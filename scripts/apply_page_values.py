#!/usr/bin/env python3
"""Apply the fresh WISE snapshot values (wise_snapshot.json) to the dated/numeric
literals in src/app/page.tsx.

Layout is untouched — only the value tokens that the dashboard renders are updated.
Each replacement is anchored on its stable surrounding label text and must match
exactly once, otherwise the script fails loudly and writes nothing.
All values below are read from the live snapshot; none are estimated.
"""
import json
import re
import sys
from datetime import datetime, timezone, timedelta

S = json.load(open("wise_snapshot.json"))
_doors = S["doors"]

# ---- timestamps ----------------------------------------------------------
_snap = datetime.strptime(S["snapshotUtc"], "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
_la = _snap.astimezone(timezone(timedelta(hours=-7)))            # PDT
STAMP_TIME = f"{_la.strftime('%H:%M')} PT"                       # "11:07 PT"
STAMP_SHORT = f"{_la.strftime('%b')} {_la.day} {STAMP_TIME}"     # "Oct 11 11:07 PT"
DATE_LONG = f"{_la.strftime('%B')} {_la.day}, {_la.strftime('%Y')}"  # "October 11, 2026"

# ---- aged-anomaly durations (per door, from the live snapshot) -----------
anom_dur = {d["door"]: d["duration"] for d in _doors if d["anomaly"]}
DUR_RE = r"(?:\d+d )?\d+h \d+m"

P = "src/app/page.tsx"
s = open(P, encoding="utf-8").read()

# (pattern, replacement) — every pattern must match exactly once.
reps = [
    # Header line: "<doors> | <long date> | Last refreshed: <short stamp>"
    (r"(DOCK50-DOCK72 &nbsp;\|&nbsp; )[A-Z][a-z]+ \d{1,2}, \d{4}"
     r"( &nbsp;\|&nbsp; Last refreshed: )[A-Z][a-z]{2} \d{1,2} \d{2}:\d{2} PT",
     lambda m: m.group(1) + DATE_LONG + m.group(2) + STAMP_SHORT),

    # "All-Time Assignments (DOCK50–DOCK72) — live WISE sweep, <stamp>"
    (r"(live WISE sweep, )[A-Z][a-z]{2} \d{1,2} \d{2}:\d{2} PT",
     lambda m: m.group(1) + STAMP_SHORT),

    # Data Notes — aged anomalies (one per anomalous door)
    (r"(DOCK50 has been held )" + DUR_RE + r"( by an ended-but-unclosed RECEIVE task)",
     lambda m: m.group(1) + anom_dur["DOCK50"] + m.group(2)),
    (r"(DOCK54 has been held )" + DUR_RE + r"( by an ended-but-unclosed LOAD task)",
     lambda m: m.group(1) + anom_dur["DOCK54"] + m.group(2)),

    # Data Notes — source provenance stamp
    (r"(All core metrics sourced from live WISE/WMS queries, )[A-Z][a-z]+ \d{1,2}, \d{4} \d{2}:\d{2} PT",
     lambda m: m.group(1) + f"{DATE_LONG} {STAMP_TIME}"),

    # Footer — long-form refresh stamp
    (r"(Last refreshed: )[A-Z][a-z]+ \d{1,2}, \d{4} \d{2}:\d{2} PT",
     lambda m: m.group(1) + f"{DATE_LONG} {STAMP_TIME}"),
]

fail = False
for pat, rep in reps:
    s, n = re.subn(pat, rep, s)
    if n != 1:
        print(f"ERROR: expected 1 occurrence, found {n} for pattern: {pat[:80]!r}")
        fail = True

if fail:
    print("ABORTED — no changes written")
    sys.exit(1)

open(P, "w", encoding="utf-8").write(s)
print(f"page.tsx updated with {len(reps)} value changes")

# sanity: no stale tokens remain
stale = ["08:16 PT", "354d 18h 55m", "64d 15h 47m"]
for bad in stale:
    if bad in s:
        print("WARN stale token still present:", bad)
print("done")
