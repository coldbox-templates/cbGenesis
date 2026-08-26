#!/usr/bin/env python3
"""
Determines the real pass/fail outcome of a `box testbox run` invocation.

`box testbox run`'s own exit code is not reliable -- it returns non-zero even
when every single spec passes -- and its `outputFile` write is itself flaky
(observed silently not writing the file at all on some CI runs). This script
instead parses the JSON report TestBox prints to stdout (captured by the CI
workflow's "Run Tests" step into tests/results/raw-output.log) and exits with
the real outcome.
"""

import re
import sys

RAW_LOG_PATH = "tests/results/raw-output.log"


def main():
    with open(RAW_LOG_PATH, errors="replace") as f:
        content = f.read()

    idx = content.find('{"CFMLEngine"')
    if idx == -1:
        print("::error::Could not find the TestBox JSON report in the test output")
        return 1

    # GitHub Actions timestamps each captured line; strip that before rejoining, since
    # TestBox's HTML runner writes the JSON report across several writeoutput() calls.
    lines = content[idx:].split("\n")
    joined = "\n".join(
        re.sub(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z ", "", line) for line in lines
    )

    # The report's own top-level totalError/totalFail counters aren't reliable (observed
    # negative on a fully-passing run), so determine the real outcome from each spec's own
    # status instead. Every spec has a "failMessage" key (empty when passed), which makes a
    # reliable per-spec delimiter even though the full JSON has embedded unescaped quotes
    # (from TestBox's HTML code-context snippets) that break a real JSON parser.
    specs = re.split(r'"failMessage":".*?","failExtendedInfo"', joined)[1:]
    failures = []
    for chunk in specs:
        status_match = re.search(r'"status":"([^"]*)"', chunk)
        if status_match and status_match.group(1) != "Passed":
            name_match = re.search(r'"displayName":"([^"]*)"', chunk)
            failures.append((name_match.group(1) if name_match else "?", status_match.group(1)))

    print(f"{len(specs)} specs, {len(failures)} not passed")
    for name, status in failures:
        print(f"  [{status}] {name}")

    if not specs:
        print("::error::Parsed 0 specs from the TestBox report -- treating as a failure")
        return 1

    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
