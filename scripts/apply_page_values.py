#!/usr/bin/env python3
"""Apply the fresh WISE snapshot values (wise_snapshot.json, pulled 2026-10-10T15:01:55Z / Oct 10 08:01 PT)
to the dated/numeric literals in src/app/page.tsx.

Layout is untouched — only values that the dashboard renders are updated.
Every replacement must match exactly once, otherwise the script fails loudly.
All values below are read from the live snapshot; none are estimated.
"""
import sys

P = "src/app/page.tsx"
s = open(P, encoding="utf-8").read()

reps = [
    # header / stamp
    ("DOCK50-DOCK72 &nbsp;|&nbsp; October 9, 2026 &nbsp;|&nbsp; Last refreshed: Oct 9 13:26 PT",
     "DOCK50-DOCK72 &nbsp;|&nbsp; October 10, 2026 &nbsp;|&nbsp; Last refreshed: Oct 10 08:01 PT"),

    # All-time sweep stamp
    ("All-Time Assignments (DOCK50\u2013DOCK72) \u2014 live WISE sweep, Oct 9 13:26 PT",
     "All-Time Assignments (DOCK50\u2013DOCK72) \u2014 live WISE sweep, Oct 10 08:01 PT"),

    # Assigned Activity banner — closest real match (Arnulfo: 6 active = 6 LOAD / 0 RECEIVE, all GURUNANDA)
    ("assigned activity: 7 active tasks\n                (6 LOAD / 1 RECEIVE) across GURUNANDA and KARAKA.",
     "assigned activity: 6 active tasks\n                (6 LOAD / 0 RECEIVE) across GURUNANDA."),

    # Arnulfo Active Bay 4 header
    ("Arnulfo Active Bay 4 Tasks (7)", "Arnulfo Active Bay 4 Tasks (6)"),

    # Arnulfo task list — TASK-5389973 now belongs to DANIEL BELTRAN
    ("<strong>DOCK51:</strong> TASK-5381268 (LOAD IN_PROGRESS), TASK-5389973 (LOAD IN_PROGRESS)",
     "<strong>DOCK51:</strong> TASK-5381268 (LOAD IN_PROGRESS)"),

    # Arnulfo no longer holds DOCK56; he now holds DOCK58
    ("<strong>DOCK56:</strong> TASK-5389635 (RECEIVE IN_PROGRESS)",
     "<strong>DOCK58:</strong> TASK-5390995 (LOAD IN_PROGRESS)"),

    # Arnulfo total
    ("Total: 7 open tasks (6 LOAD / 1 RECEIVE). Arnulfo also has 2 facility",
     "Total: 6 open tasks (6 LOAD / 0 RECEIVE). Arnulfo also has 2 facility"),

    # Bay 4 active assignee breakdown (ARNULFO 7 -> 6; DANIEL BELTRAN back at 2; JULIO 2 -> 1)
    ('                <span className="text-xs text-[#a1a1aa] mt-1">\n'
     '                  <span className="text-[#7c3aed] font-semibold">ARNULFO MUNGUIA:</span> 7 active\n'
     '                </span>\n'
     '                <span className="text-xs text-[#a1a1aa]">\n'
     '                  <span className="text-[#22c55e] font-semibold">EDUARDO MEJIA:</span> 2 active\n'
     '                </span>\n'
     '                <span className="text-xs text-[#a1a1aa]">\n'
     '                  <span className="text-[#22c55e] font-semibold">JULIO CESAR Alvarado:</span> 2 active\n'
     '                </span>\n',
     '                <span className="text-xs text-[#a1a1aa] mt-1">\n'
     '                  <span className="text-[#7c3aed] font-semibold">ARNULFO MUNGUIA:</span> 6 active\n'
     '                </span>\n'
     '                <span className="text-xs text-[#a1a1aa]">\n'
     '                  <span className="text-[#22c55e] font-semibold">DANIEL BELTRAN:</span> 2 active\n'
     '                </span>\n'
     '                <span className="text-xs text-[#a1a1aa]">\n'
     '                  <span className="text-[#22c55e] font-semibold">EDUARDO MEJIA:</span> 2 active\n'
     '                </span>\n'
     '                <span className="text-xs text-[#a1a1aa]">\n'
     '                  <span className="text-[#22c55e] font-semibold">JULIO CESAR Alvarado:</span> 1 active\n'
     '                </span>\n'),

    # Customer mix & status (GURUNANDA 13 -> 15; ORG-40858 2 -> 1; KARAKA now 0 active -> row dropped)
    ('                  <span className="text-[#7c3aed] font-semibold">GURUNANDA, LLC (ORG-655875):</span> 13 tasks (81.3% of active)\n'
     '                </span>\n'
     '                <span className="text-xs text-[#a1a1aa]">\n'
     '                  <span className="text-[#22c55e] font-semibold">ORG-40858:</span> 2 tasks (12.5% of active)\n'
     '                </span>\n'
     '                <span className="text-xs text-[#a1a1aa]">\n'
     '                  <span className="text-[#f59e0b] font-semibold">KARAKA, LLC (ORG-585450):</span> 1 task (6.3% of active)\n'
     '                </span>\n',
     '                  <span className="text-[#7c3aed] font-semibold">GURUNANDA, LLC (ORG-655875):</span> 15 tasks (93.8% of active)\n'
     '                </span>\n'
     '                <span className="text-xs text-[#a1a1aa]">\n'
     '                  <span className="text-[#22c55e] font-semibold">ORG-40858:</span> 1 task (6.3% of active)\n'
     '                </span>\n'),

    # task status split
    ("12 IN_PROGRESS (75.0%) / 4 NEW (25.0%)", "13 IN_PROGRESS (81.3%) / 3 NEW (18.8%)"),

    # data notes — door utilization
    ("6 Occupied / 3 Reserved / 14 Available</strong> - occupied: DOCK50, DOCK51, DOCK53, DOCK54, DOCK56, DOCK57; reserved (NEW task only): DOCK52, DOCK66, DOCK69. 14 doors have no active task.",
     "8 Occupied / 2 Reserved / 13 Available</strong> - occupied: DOCK50, DOCK51, DOCK52, DOCK53, DOCK54, DOCK56, DOCK57, DOCK58; reserved (NEW task only): DOCK66, DOCK69. 13 doors have no active task."),

    # data notes — mix
    ("9 outbound (LOAD)</strong> / <strong className=\"text-[#22c55e]\">7 inbound (RECEIVE)</strong> = 16 total. 56.3% outbound / 43.8% inbound.",
     "11 outbound (LOAD)</strong> / <strong className=\"text-[#22c55e]\">5 inbound (RECEIVE)</strong> = 16 total. 68.8% outbound / 31.3% inbound."),

    # data notes — occupancy
    ("9 doors with at least one active task. 39.1% task-based occupancy (9/23).",
     "10 doors with at least one active task. 43.5% task-based occupancy (10/23)."),

    # data notes — scheduled inbounds
    ("33 receipts with an appointmentTime on the October 9 facility-local (PT) day; 6 received (18.2%).",
     "2 receipts with an appointmentTime on the October 10 facility-local (PT) day; 0 received (0.0%)."),

    # data notes — aged anomalies
    ("DOCK50 has been held 353d 0h 4m by an ended-but-unclosed RECEIVE task (TASK-5090739, endTime 2025-10-22). DOCK54 has been held 62d 20h 56m by an ended-but-unclosed LOAD task (TASK-5338695, endTime 2026-08-10).",
     "DOCK50 has been held 353d 18h 40m by an ended-but-unclosed RECEIVE task (TASK-5090739, endTime 2025-10-22). DOCK54 has been held 63d 15h 32m by an ended-but-unclosed LOAD task (TASK-5338695, endTime 2026-08-10)."),

    # data notes — scheduled outbounds (day bucket is genuinely empty at pull time: 0/0 -> no rate)
    ("113 loads with an appointmentTime on the October 9 facility-local (PT) day; 50 loaded (44.2%).",
     "0 loads with an appointmentTime on the October 10 facility-local (PT) day yet; no outbound load rate available (0 scheduled / 0 loaded)."),

    # data notes — customer mix
    ("GURUNANDA, LLC has 13 of 16 active tasks (81.3%); ORG-40858 has 2 (12.5%); KARAKA, LLC has 1 (6.3%).",
     "GURUNANDA, LLC has 15 of 16 active tasks (93.8%); ORG-40858 has 1 (6.3%)"),

    # data notes — native dock status
    ("native dockStatus OCCUPIED = 13; RESERVED = 1; AVAILABLE = 9",
     "native dockStatus OCCUPIED = 16; RESERVED = 1; AVAILABLE = 6"),

    # data notes / footer — refresh instant
    ("All core metrics sourced from live WISE/WMS queries, October 9, 2026 13:26 PT.",
     "All core metrics sourced from live WISE/WMS queries, October 10, 2026 08:01 PT."),
    ("Last refreshed: October 9, 2026 13:26 PT", "Last refreshed: October 10, 2026 08:01 PT"),
]

fail = False
for old, new in reps:
    n = s.count(old)
    if n != 1:
        print(f"ERROR: expected 1 occurrence, found {n} for: {old[:80]!r}")
        fail = True
        continue
    s = s.replace(old, new)

if fail:
    print("ABORTED — no changes written")
    sys.exit(1)

open(P, "w", encoding="utf-8").write(s)
print(f"page.tsx updated with {len(reps)} value changes")

# sanity: no stale tokens remain
stale = ["Oct 9 13:26", "October 9, 2026", "353d 0h 4m", "62d 20h 56m", "113 loads", "44.2%",
         "81.3%", "56.3%", "43.5%", "39.1%", "KARAKA", "TASK-5389635", "TASK-5389973",
         "18.2%", "(7)", "7 active", "October 9 facility-local"]
for bad in stale:
    if bad in s:
        print("WARN stale token still present:", bad)
print("done")
