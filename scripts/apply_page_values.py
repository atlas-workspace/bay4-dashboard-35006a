#!/usr/bin/env python3
"""Apply the fresh WISE snapshot values to the hardcoded literals in src/app/page.tsx.
Each replacement must match exactly once; otherwise the script fails loudly.
Layout is untouched — only dated/numeric literals are updated."""
import sys

P = "src/app/page.tsx"
s = open(P, encoding="utf-8").read()

reps = [
    # header / stamp
    ("Last refreshed: Oct 9 09:56 PT", "Last refreshed: Oct 9 13:26 PT"),
    ("live WISE sweep, Oct 9 09:56 PT", "live WISE sweep, Oct 9 13:26 PT"),

    # Arnulfo active Bay 4 task list
    ("<strong>DOCK50:</strong> TASK-5389467 (LOAD IN_PROGRESS)",
     "<strong>DOCK50:</strong> TASK-5389467 (LOAD IN_PROGRESS), TASK-5390717 (LOAD IN_PROGRESS)"),
    ("<strong>DOCK51:</strong> TASK-5381268 (LOAD IN_PROGRESS)",
     "<strong>DOCK51:</strong> TASK-5381268 (LOAD IN_PROGRESS), TASK-5389973 (LOAD IN_PROGRESS)"),
    ('                <span className="text-xs text-[#a1a1aa]">\n'
     "                  <strong>DOCK52:</strong> TASK-5389880 (LOAD IN_PROGRESS)\n"
     "                </span>\n", ""),
    ("<strong>DOCK54:</strong> TASK-5382462 (LOAD IN_PROGRESS), TASK-5338695 (LOAD IN_PROGRESS, endTime 2026-08-10 but unclosed \u26a0 STALE)",
     "<strong>DOCK54:</strong> TASK-5338695 (LOAD IN_PROGRESS, endTime 2026-08-10 but unclosed \u26a0 STALE)"),

    # Bay 4 active assignee breakdown
    ("JULIO CESAR ALVARADO:", "JULIO CESAR Alvarado:"),
    ('                <span className="text-xs text-[#a1a1aa]">\n'
     '                  <span className="text-[#f59e0b] font-semibold">DANIEL BELTRAN:</span> 1 active\n'
     "                </span>\n", ""),
    ('                <span className="text-xs text-[#a1a1aa]">\n'
     '                  <span className="text-[#f59e0b] font-semibold">Fatima Ponce:</span> 1 active\n'
     "                </span>\n", ""),

    # customer mix & status
    ("15 tasks (83.3% of active)", "13 tasks (81.3% of active)"),
    ("2 tasks (11.1% of active)", "2 tasks (12.5% of active)"),
    ("1 task (5.6% of active)", "1 task (6.3% of active)"),
    ("14 IN_PROGRESS (77.8%) / 4 NEW (22.2%)", "12 IN_PROGRESS (75.0%) / 4 NEW (25.0%)"),

    # data notes
    ("8 Occupied / 2 Reserved / 13 Available</strong> - occupied: DOCK50, DOCK51, DOCK52, DOCK53, DOCK54, DOCK56, DOCK57, DOCK61; reserved (NEW task only): DOCK66, DOCK69. 13 doors have no active task.",
     "6 Occupied / 3 Reserved / 14 Available</strong> - occupied: DOCK50, DOCK51, DOCK53, DOCK54, DOCK56, DOCK57; reserved (NEW task only): DOCK52, DOCK66, DOCK69. 14 doors have no active task."),
    ("10 outbound (LOAD)", "9 outbound (LOAD)"),
    ("8 inbound (RECEIVE)", "7 inbound (RECEIVE)"),
    ("= 18 total. 55.6% outbound / 44.4% inbound.", "= 16 total. 56.3% outbound / 43.8% inbound."),
    ("10 doors with at least one active task. 43.5% task-based occupancy (10/23).",
     "9 doors with at least one active task. 39.1% task-based occupancy (9/23)."),
    ("32 receipts with an appointmentTime on the October 9 facility-local (PT) day; 0 received (0.0%).",
     "33 receipts with an appointmentTime on the October 9 facility-local (PT) day; 6 received (18.2%)."),
    ("DOCK50 has been held 352d 20h 35m by an ended-but-unclosed RECEIVE task (TASK-5090739, endTime 2025-10-22). DOCK54 has been held 62d 17h 26m by an ended-but-unclosed LOAD task (TASK-5338695, endTime 2026-08-10).",
     "DOCK50 has been held 353d 0h 4m by an ended-but-unclosed RECEIVE task (TASK-5090739, endTime 2025-10-22). DOCK54 has been held 62d 20h 56m by an ended-but-unclosed LOAD task (TASK-5338695, endTime 2026-08-10)."),
    ("111 loads with an appointmentTime on the October 9 facility-local (PT) day; 9 loaded (8.1%).",
     "113 loads with an appointmentTime on the October 9 facility-local (PT) day; 50 loaded (44.2%)."),
    ("GURUNANDA, LLC has 15 of 18 active tasks (83.3%); ORG-40858 has 2 (11.1%); KARAKA, LLC has 1 (5.6%).",
     "GURUNANDA, LLC has 13 of 16 active tasks (81.3%); ORG-40858 has 2 (12.5%); KARAKA, LLC has 1 (6.3%)."),
    ("native dockStatus OCCUPIED = 15; RESERVED = 1; AVAILABLE = 7",
     "native dockStatus OCCUPIED = 13; RESERVED = 1; AVAILABLE = 9"),
    ("All core metrics sourced from live WISE/WMS queries, October 9, 2026 09:56 PT.",
     "All core metrics sourced from live WISE/WMS queries, October 9, 2026 13:26 PT."),

    # footer
    ("Last refreshed: October 9, 2026 09:56 PT", "Last refreshed: October 9, 2026 13:26 PT"),
]

fail = False
for old, new in reps:
    n = s.count(old)
    if n != 1:
        print(f"ERROR: expected 1 occurrence, found {n} for: {old[:70]!r}")
        fail = True
        continue
    s = s.replace(old, new)

if fail:
    sys.exit(1)

open(P, "w", encoding="utf-8").write(s)
print("page.tsx updated with", len(reps), "value changes")

# sanity: no stale stamps remain
import re
for bad in ["09:56", "352d 20h 35m", "62d 17h 26m", "111 loads", "8.1%", "83.3%", "55.6%", "43.5%", "TASK-5389880", "DANIEL BELTRAN:", "Fatima Ponce:"]:
    if bad in s:
        print("WARN stale token still present:", bad)
print("done")
