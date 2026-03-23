#!/usr/bin/env python3
"""Remove duplicated modal HTML and JS from all shader pages.

After this script:
- The <div class="code-modal"> block is removed from each file's HTML.
- The modal JS constants, helpers, and event-listener block are removed from
  the inline <script>. ui.js now owns all of that.
- window.shaderControls = params; is preserved in place.
- The iframe visibility check (if window.self !== window.top) is removed;
  ui.js handles it in enhanceToolbar().
"""

import re, os

DIR = os.path.join(os.path.dirname(__file__), "..", "atmospheric-hero-shaders")
SKIP = {"index.html", "preview.html"}


def remove_modal_html(lines):
    """Remove the <div class="code-modal"> block (handles single- and multi-line)."""
    result = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if '<div class="code-modal"' in line:
            # Track opening/closing div depth to find the matching close
            depth = line.count("<div") - line.count("</div>")
            i += 1
            while i < len(lines) and depth > 0:
                depth += lines[i].count("<div") - lines[i].count("</div>")
                i += 1
            # Skip any immediately following blank line left by the removal
            if i < len(lines) and lines[i].strip() == "":
                i += 1
            continue
        result.append(line)
        i += 1
    return result


def remove_modal_js(lines):
    """Remove the modal JS block starting at 'const backLink = document.querySelector'.

    Preserves window.shaderControls = params; which sits between the modal
    event-listener block and the iframe check.
    Removes the iframe visibility check block (if window.self !== window.top).
    """
    result = []
    i = 0
    n = len(lines)

    while i < n:
        line = lines[i]

        if re.search(r"const backLink\s*=\s*document\.querySelector\(", line):
            saved_controls = None
            iframe_started = False
            iframe_depth = 0

            j = i
            while j < n:
                l = lines[j]

                # Preserve the shaderControls assignment
                if "window.shaderControls" in l:
                    saved_controls = l

                # Detect start of the iframe check block
                if re.search(r"if\s*\(window\.self\s*!==\s*window\.top\)", l):
                    iframe_started = True
                    iframe_depth = 0

                # Count braces once we're inside the iframe block
                if iframe_started:
                    for ch in l:
                        if ch == "{":
                            iframe_depth += 1
                        elif ch == "}":
                            iframe_depth -= 1
                    if iframe_depth == 0:
                        j += 1
                        break

                j += 1

            if saved_controls is not None:
                result.append(saved_controls)

            i = j
            continue

        result.append(line)
        i += 1

    return result


def collapse_blank_lines(lines):
    """Replace runs of more than one blank line with a single blank line."""
    cleaned = []
    prev_blank = False
    for line in lines:
        is_blank = line.strip() == ""
        if is_blank and prev_blank:
            continue
        cleaned.append(line)
        prev_blank = is_blank
    return cleaned


def process(path):
    with open(path, encoding="utf-8") as f:
        original = f.read()

    lines = original.split("\n")
    lines = remove_modal_html(lines)
    lines = remove_modal_js(lines)
    lines = collapse_blank_lines(lines)
    result = "\n".join(lines)

    if result == original:
        return False

    with open(path, "w", encoding="utf-8") as f:
        f.write(result)
    return True


changed = []
skipped = []

for fname in sorted(os.listdir(DIR)):
    if not fname.endswith(".html") or fname in SKIP:
        continue
    path = os.path.join(DIR, fname)
    if process(path):
        changed.append(fname)
        print(f"  ✓  {fname}")
    else:
        skipped.append(fname)
        print(f"  –  {fname}  (no change)")

print(f"\n{len(changed)} files modified, {len(skipped)} unchanged")
