#!/usr/bin/env python3
"""Apply the fresh WISE snapshot values (wise_snapshot.json) to the dated/numeric
literals in src/app/page.tsx.

Layout is untouched — only values that the dashboard renders are updated.
Every replacement must match exactly once, otherwise the script fails loudly.
All values below are read from the live snapshot; none are estimated.
"""
import json
import math
import sys
from datetime import datetime, timezone, timedelta


def r1(x):
    """One-decimal percentage using round-half-up (matches the dashboard's convention)."""
    return f"{math.floor(x * 10 + 0.5) / 10:.1f}"

S = json.load(open("wise_snapshot.json"))
_kpi = S["kpi"]
_sch = S["schedule"]
_arn = S["arnulfo"]
_aa = S["assignedActivity"]
_doors = S["doors"]
_mix = S["mix"]
_cmix = S["customerMix"]
_smix = S["statusMix"]

# ---- timestamps ----------------------------------------------------------
_snap = datetime.strptime(S["snapshotUtc"], "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
_la = _snap.astimezone(timezone(timedelta(hours=-7)))                 # PDT
STAMP_TIME = f"{_la.strftime('%H:%M')} PT"                                          # "08:16 PT"
STAMP_SHORT = f"{_la.strftime('%b')} {_la.day} {STAMP_TIME}"                        # "Oct 11 08:16 PT"
DATE_LONG = f"{_la.strftime('%B')} {_la.day}, {_la.strftime('%Y')}"               # "October 11, 2026"
_boot = datetime.strptime(S["bootDay"], "%Y-%m-%d")
BOOT_LONG = f"{_boot.strftime('%B')} {_boot.day}, {_boot.strftime('%Y')}"         # "October 11, 2026"

# ---- derived values ------------------------------------------------------
occupied = [d["door"] for d in _doors if d["status"] == "Occupied"]
reserved = [d["door"] for d in _doors if d["status"] == "Reserved"]
n_occ, n_res, n_avail = _kpi["occupied"], _kpi["reserved"], _kpi["available"]
anoms = [(d["door"], d["duration"]) for d in _doors if d["anomaly"]]
with_tasks = _kpi["withTasks"]
n_total = _kpi["total"]
n_new = next((m["count"] for m in _smix if m["name"] == "NEW"), 0)
n_inprog = next((m["count"] for m in _smix if m["name"] == "IN_PROGRESS"), 0)
mix_total = _mix["total"]
outb, inb = _mix["outbound"], _mix["inbound"]
pct_out = (outb / mix_total * 100) if mix_total else 0.0
pct_in = (inb / mix_total * 100) if mix_total else 0.0
cust_rows = [(c["name"], c["count"], r1(c["count"] / mix_total * 100)) for c in _cmix]
sched_in = _sch["inboundOrders"]
recv_in = _sch["inboundReceived"]
sched_out = _sch["outboundOrders"]
loaded_out = _sch["outboundLoaded"]
native = {}
for d in _doors:
    native[d["nativeDockStatus"]] = native.get(d["nativeDockStatus"], 0) + 1
gt = _aa["facilityGeneralTaskTotal"]
gt_mix = _aa["statusMix"]

P = "src/app/page.tsx"
s = open(P, encoding="utf-8").read()

reps = [
    ("DOCK50-DOCK72 &nbsp;|&nbsp; October 10, 2026 &nbsp;|&nbsp; Last refreshed: Oct 10 15:18 PT",
     f"DOCK50-DOCK72 &nbsp;|&nbsp; {DATE_LONG} &nbsp;|&nbsp; Last refreshed: {STAMP_SHORT}"),

    ("All-Time Assignments (DOCK50\u2013DOCK72) \u2014 live WISE sweep, Oct 10 15:18 PT",
     f"All-Time Assignments (DOCK50\u2013DOCK72) \u2014 live WISE sweep, {STAMP_SHORT}"),

    # Assigned Activity banner — general-task sweep + closest real match
    ("Facility sweep of all 120 general tasks found 0 exact phrase matches (CLOSED 89 / NEEDS_APPROVAL 19 /\n"
     "                NEW 10 / IN_PROGRESS 2), so every task note, job description, and task-line field was scanned.\n"
     "                Closest real match - ARNULFO MUNGUIA&apos;s Bay 4 DOCK50-DOCK72 assigned activity: 6 active tasks\n"
     "                (6 LOAD / 0 RECEIVE) across GURUNANDA.",
     f"Facility sweep of all {gt} general tasks found {len(_aa['exactPhraseHits'])} exact phrase matches "
     f"(CLOSED {gt_mix.get('CLOSED', 0)} / NEEDS_APPROVAL {gt_mix.get('NEEDS_APPROVAL', 0)} /\n"
     f"                NEW {gt_mix.get('NEW', 0)} / IN_PROGRESS {gt_mix.get('IN_PROGRESS', 0)}), so every task note, "
     "job description, and task-line field was scanned.\n"
     f"                Closest real match - ARNULFO MUNGUIA&apos;s Bay 4 DOCK50-DOCK72 assigned activity: "
     f"{_arn['count']} active tasks\n"
     f"                ({_arn['load']} LOAD / {_arn['receive']} RECEIVE) across GURUNANDA."),

    # Arnulfo Active Bay 4 header
    ("Arnulfo Active Bay 4 Tasks (6)", f"Arnulfo Active Bay 4 Tasks ({_arn['count']})"),

    # Arnulfo total
    ("Total: 6 open tasks (6 LOAD / 0 RECEIVE). Arnulfo also has 2 facility",
     f"Total: {_arn['count']} open tasks ({_arn['load']} LOAD / {_arn['receive']} RECEIVE). Arnulfo also has "
     f"{len(_aa['arnulfoGeneralTasks'])} facility"),

    # task status split
    ("13 IN_PROGRESS (81.3%) / 3 NEW (18.8%)",
     f"{n_inprog} IN_PROGRESS ({r1(n_inprog / mix_total * 100)}%) / {n_new} NEW ({r1(n_new / mix_total * 100)}%)"),

    # data notes — door utilization
    ("8 Occupied / 2 Reserved / 13 Available</strong> - occupied: DOCK50, DOCK51, DOCK52, DOCK53, DOCK54, DOCK56, DOCK57, DOCK58; reserved (NEW task only): DOCK66, DOCK69. 13 doors have no active task.",
     f"{n_occ} Occupied / {n_res} Reserved / {n_avail} Available</strong> - occupied: {', '.join(occupied)}; "
     f"reserved (NEW task only): {', '.join(reserved)}. {n_avail} doors have no active task."),

    # data notes — mix
    ("11 outbound (LOAD)</strong> / <strong className=\"text-[#22c55e]\">5 inbound (RECEIVE)</strong> = 16 total. 68.8% outbound / 31.3% inbound.",
     f"{outb} outbound (LOAD)</strong> / <strong className=\"text-[#22c55e]\">{inb} inbound (RECEIVE)</strong> = "
     f"{mix_total} total. {r1(pct_out)}% outbound / {r1(pct_in)}% inbound."),

    # data notes — occupancy
    ("10 doors with at least one active task. 43.5% task-based occupancy (10/23).",
     f"{with_tasks} doors with at least one active task. {with_tasks / n_total * 100:.1f}% task-based occupancy ({with_tasks}/{n_total})."),

    # data notes — scheduled inbounds
    ("2 receipts with an appointmentTime on the October 10 facility-local (PT) day; 0 received (0.0%).",
     (f"{sched_in} receipts with an appointmentTime on the {BOOT_LONG} facility-local (PT) day; "
      f"{recv_in} received.") if sched_in else
     (f"No receipts with an appointmentTime on the {BOOT_LONG} facility-local (PT) day; no inbound "
      f"receipt rate available ({sched_in} scheduled / {recv_in} received).")),

    # data notes — aged anomalies
    ("DOCK50 has been held 354d 1h 57m by an ended-but-unclosed RECEIVE task (TASK-5090739, endTime 2025-10-22). DOCK54 has been held 63d 22h 48m by an ended-but-unclosed LOAD task (TASK-5338695, endTime 2026-08-10).",
     "DOCK50 has been held %s by an ended-but-unclosed RECEIVE task (TASK-5090739, endTime 2025-10-22). "
     "DOCK54 has been held %s by an ended-but-unclosed LOAD task (TASK-5338695, endTime 2026-08-10)."
     % (anoms[0][1], anoms[1][1])),

    # data notes — scheduled outbounds
    ("0 loads with an appointmentTime on the October 10 facility-local (PT) day yet; no outbound load rate available (0 scheduled / 0 loaded).",
     (f"{sched_out} loads with an appointmentTime on the {BOOT_LONG} facility-local (PT) day; "
      f"{loaded_out} loaded ({loaded_out / sched_out * 100:.1f}%).") if sched_out else
     (f"No loads with an appointmentTime on the {BOOT_LONG} facility-local (PT) day yet; no outbound "
      f"load rate available ({sched_out} scheduled / {loaded_out} loaded).")),

    # data notes — customer mix
    ("GURUNANDA, LLC has 15 of 16 active tasks (93.8%); ORG-40858 has 1 (6.3%)",
     (f"{cust_rows[0][0]} has {cust_rows[0][1]} of {mix_total} active tasks ({cust_rows[0][2]}%); "
      f"{cust_rows[1][0]} has {cust_rows[1][1]} ({cust_rows[1][2]}%)") if len(cust_rows) > 1 else
     (f"{cust_rows[0][0]} has all {mix_total} active tasks")),

    # data notes — native dock status
    ("native dockStatus OCCUPIED = 16; RESERVED = 1; AVAILABLE = 6",
     "native dockStatus OCCUPIED = %d; RESERVED = %d; AVAILABLE = %d"
     % (native.get("OCCUPIED", 0), native.get("RESERVED", 0), native.get("AVAILABLE", 0))),

    # data notes / footer — refresh instant
    ("All core metrics sourced from live WISE/WMS queries, October 10, 2026 15:18 PT.",
     f"All core metrics sourced from live WISE/WMS queries, {DATE_LONG} {STAMP_TIME}."),
    ("Last refreshed: October 10, 2026 15:18 PT", f"Last refreshed: {DATE_LONG} {STAMP_TIME}"),
]

fail = False
for old, new in reps:
    n = s.count(old)
    if n != 1:
        print(f"ERROR: expected 1 occurrence, found {n} for: {old[:90]!r}")
        fail = True
        continue
    s = s.replace(old, new)

if fail:
    print("ABORTED — no changes written")
    sys.exit(1)

open(P, "w", encoding="utf-8").write(s)
print(f"page.tsx updated with {len(reps)} value changes")

# sanity: no stale tokens remain
stale = ["Oct 10 15:18", "October 10, 2026", "354d 1h 57m", "63d 22h 48m",
         "2 receipts with an appointmentTime", "October 10 facility-local",
         "93.8%", "68.8%", "43.5%", "2 facility\n                general tasks"]
for bad in stale:
    if bad in s:
        print("WARN stale token still present:", bad)
print("done")
