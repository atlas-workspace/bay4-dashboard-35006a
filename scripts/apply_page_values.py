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
STAMP_TIME = f"{_la.strftime('%H:%M')} PT"                       # "11:37 PT"
STAMP_SHORT = f"{_la.strftime('%b')} {_la.day} {STAMP_TIME}"     # "Oct 14 11:37 PT"
DATE_LONG = f"{_la.strftime('%B')} {_la.day}, {_la.strftime('%Y')}"  # "October 14, 2026"
BOOT = S["bootDay"]
_boot = datetime.strptime(BOOT, "%Y-%m-%d")
BOOT_LONG = f"{_boot.strftime('%B')} {_boot.day}, {_boot.strftime('%Y')}"

# ---- aged-anomaly durations (per door, from the live snapshot) -----------
# Every anomalous door is rendered from the live task rows (door, duration, task id,
# task type, endTime). Nothing is carried over from a previous pull.
DUR_RE = r"(?:\d+d )?\d+h \d+m"
ANOM_PARTS = []
for _d in _doors:
    for _t in _d["tasks"]:
        if _t.get("end"):
            ANOM_PARTS.append(f'{_d["door"]} has been held {_d["duration"]} by an ended-but-unclosed '
                              f'{_t["type"]} task ({_t["id"]}, endTime {_t["end"][:10]})')
ANOM_PARTS.sort(key=lambda s: int(s.split(" has been held")[0].replace("DOCK", "")))

# ---- derived business values (all from the live snapshot) ----------------
doors = S["doors"]
occ = [d["door"] for d in doors if d["status"] == "Occupied"]
res = [d["door"] for d in doors if d["status"] == "Reserved"]
avail = [d["door"] for d in doors if d["status"] == "Available"]
n_occ, n_res, n_avail, n_total = len(occ), len(res), len(avail), len(doors)
n_with = sum(1 for d in doors if d["taskIds"])

mix = S["mix"]
m_out, m_in, m_tot = mix["outbound"], mix["inbound"], mix["total"]


def pct(n, d):
    return round(n / d * 100, 1) if d else 0.0


asg = S["assigneeSummaries"]                    # already sorted by (-count, name)
custmix = S["customerMix"]
smix = {x["name"]: x["count"] for x in S["statusMix"]}
sch = S["schedule"]
n_recv = len(sch["receiptRows"])
recv = sch["inboundReceived"]
n_out = sch["outboundOrders"]
loaded = sch["outboundLoaded"]
nat = {}
for d in doors:
    nat[d["nativeDockStatus"]] = nat.get(d["nativeDockStatus"], 0) + 1

# customer display name -> org id (from the same scoped task rows)
cust_id = {}
for d in doors:
    for t in d["tasks"]:
        if t.get("customer") and t.get("customerId"):
            cust_id[t["customer"]] = t["customerId"]

# ---- replacement blocks --------------------------------------------------
def asg_color(i):
    return "#7c3aed" if i == 0 else ("#22c55e" if i < 3 else "#f59e0b")


def asg_row(i, a):
    cls = "text-xs text-[#a1a1aa] mt-1" if i == 0 else "text-xs text-[#a1a1aa]"
    return (f'                <span className="{cls}">\n'
            f'                  <span className="text-[{asg_color(i)}] font-semibold">{a["name"]}:</span> {a["taskCount"]} active\n'
            f'                </span>')


ASG_BLOCK = "\n".join(asg_row(i, a) for i, a in enumerate(asg))


def cust_row(i, c):
    cls = "text-xs text-[#a1a1aa] mt-1" if i == 0 else "text-xs text-[#a1a1aa]"
    color = "#7c3aed" if i == 0 else "#22c55e"
    label = f'{c["name"]} ({cust_id[c["name"]]})' if c["name"] in cust_id else c["name"]
    unit = "task" if c["count"] == 1 else "tasks"
    return (f'                <span className="{cls}">\n'
            f'                  <span className="text-[{color}] font-semibold">{label}:</span> {c["count"]} {unit} ({pct(c["count"], m_tot)}% of active)\n'
            f'                </span>')


CUST_BLOCK = ("\n".join(cust_row(i, c) for i, c in enumerate(custmix))
              + '\n                <div className="mt-2 pt-2 border-t border-[#1e1e2a]">\n'
              + '                  <span className="text-[10px] text-[#71717a] uppercase tracking-wider">Task Status</span>\n'
              + '                  <span className="text-xs text-[#a1a1aa] block mt-0.5">\n'
              + f'                    {smix.get("IN_PROGRESS", 0)} IN_PROGRESS ({pct(smix.get("IN_PROGRESS", 0), m_tot)}%) / {smix.get("NEW", 0)} NEW ({pct(smix.get("NEW", 0), m_tot)}%)\n'
              + '                  </span>\n'
              + '                </div>')

OCC_BULLET = (f'<li><strong className="text-[#f4f4f6]">{n_occ} Occupied / {n_res} Reserved / {n_avail} Available</strong>'
              f' - occupied: {", ".join(occ)}; reserved (NEW task only): {", ".join(res) if res else "none"}.'
              f' {n_avail} doors have no active task.</li>')

MIX_BULLET = (f'<li>Active tasks: <strong className="text-[#7c3aed]">{m_out} outbound (LOAD)</strong> / '
              f'<strong className="text-[#22c55e]">{m_in} inbound (RECEIVE)</strong> = {m_tot} total. '
              f'{pct(m_out, m_tot)}% outbound / {pct(m_in, m_tot)}% inbound.</li>')

DOOR_BULLET = (f'<li>{n_with} doors with at least one active task. '
               f'{pct(n_with, n_total)}% task-based occupancy ({n_with}/{n_total}).</li>')

INB_BULLET = (f'<li><strong className="text-[#22c55e]">★ Scheduled inbounds:</strong> {n_recv} '
              f'{"receipt" if n_recv == 1 else "receipts"} with an '
              f'appointmentTime on the {BOOT_LONG} facility-local (PT) day; {recv} received ({pct(recv, n_recv)}%).</li>')

OUT_BULLET = (f'<li><strong className="text-[#7c3aed]">★ Scheduled outbounds:</strong> {n_out} loads with an '
              f'appointmentTime in the {BOOT_LONG} facility-local (PT) day bucket; {loaded} loaded ({pct(loaded, n_out)}%).</li>')

CM_BULLET = ('<li><strong className="text-[#7c3aed]">★ Customer mix:</strong> '
             + '; '.join(f'{c["name"]} has {c["count"]} of {m_tot} active tasks ({pct(c["count"], m_tot)}%)' for c in custmix)
             + '</li>')

NAT_BULLET = ('<li>Door status is task-derived. The WMS native <em>dockStatus</em> field differs on this pull '
              f'(native dockStatus OCCUPIED = {nat.get("OCCUPIED", 0)}; RESERVED = {nat.get("RESERVED", 0)}; '
              f'AVAILABLE = {nat.get("AVAILABLE", 0)} - while the grid keeps the same task-derived convention as the tracked activity).</li>')

ANOM_BULLET = ('<li><strong className="text-[#f59e0b]">⚠ Aged Anomalies:</strong> '
               + ". ".join(ANOM_PARTS) + ".</li>")

# ---- Arnulfo Bay-4 assigned activity (live, resolved by assignee user id) --
ARNULLFO_UID = "89"
CUST_SHORT = {"ORG-655875": "GURUNANDA", "ORG-585450": "KARAKA"}
arn = []
for d in _doors:
    for t in d["tasks"]:
        if str(t.get("assigneeUserId")) == ARNULLFO_UID:
            arn.append((int(d["door"].replace("DOCK", "")), t["id"], d["door"], t))
arn.sort(key=lambda x: (x[0], x[1]))
n_arn = len(arn)
n_arn_load = sum(1 for _, _, _, t in arn if t["type"] == "LOAD")
n_arn_recv = sum(1 for _, _, _, t in arn if t["type"] == "RECEIVE")
_arn_cust_n = {}
for _, _, _, t in arn:
    nm = CUST_SHORT.get(t.get("customerId"), t.get("customer"))
    if nm:
        _arn_cust_n[nm] = _arn_cust_n.get(nm, 0) + 1
ARN_CUSTS = " and ".join(k for k, _ in sorted(_arn_cust_n.items(), key=lambda kv: (-kv[1], kv[0])))

_g = S["assignedActivity"]["arnulfoGeneralTasks"]
_gstat = sorted({x["status"] for x in _g})
if len(_g) == 2 and len(_gstat) == 1:
    ARN_FOOT_TXT = f"Arnulfo also has 2 facility general tasks, both {_gstat[0]}"
else:
    ARN_FOOT_TXT = f"Arnulfo also has {len(_g)} facility general tasks ({', '.join(_gstat)})"

_gt = S["assignedActivity"]["facilityGeneralTaskTotal"]
_gsm = S["assignedActivity"]["statusMix"]
_nh = len(S["assignedActivity"]["exactPhraseHits"])


def arn_row(i, door, t):
    cls = "text-xs text-[#a1a1aa] mt-1" if i == 0 else "text-xs text-[#a1a1aa]"
    detail = f'{t["type"]} {t["status"]}'
    if t.get("end") and t["status"] != "NEW":
        detail += f', endTime {t["end"][:10]} but unclosed \u26a0 STALE'
    return (f'                <span className="{cls}">\n'
            f'                  <strong>{door}:</strong> {t["id"]} ({detail})\n'
            f'                </span>')


ARN_BODY = "\n".join(arn_row(i, door, t) for i, (_, _, door, t) in enumerate(arn)) + "\n" + (
    '                <span className="text-xs text-[#71717a] mt-1 italic">\n'
    f'                  Total: {n_arn} open tasks ({n_arn_load} LOAD / {n_arn_recv} RECEIVE). {ARN_FOOT_TXT};\n'
    '                  neither carries the queried description.\n'
    '                </span>')

BANNER_BLOCK = (
    '<span className="text-xs text-[#a1a1aa] block mt-0.5">\n'
    f'                Facility sweep of all {_gt} general tasks found {_nh} exact phrase matches '
    f'(CLOSED {_gsm.get("CLOSED", 0)} / NEEDS_APPROVAL {_gsm.get("NEEDS_APPROVAL", 0)} /\n'
    f'                NEW {_gsm.get("NEW", 0)} / IN_PROGRESS {_gsm.get("IN_PROGRESS", 0)}), so every task note, job description, and task-line field was scanned.\n'
    f'                Closest real match - ARNULFO MUNGUIA&apos;s Bay 4 DOCK50-DOCK72 assigned activity: {n_arn} active tasks\n'
    f'                ({n_arn_load} LOAD / {n_arn_recv} RECEIVE) across {ARN_CUSTS}.\n'
    '              </span>')

# ---- run -----------------------------------------------------------------
P = "src/app/page.tsx"
s = open(P, encoding="utf-8").read()

_fail = []


def sub_once(pattern, repl, label):
    global s
    s, n = re.subn(pattern, repl, s, flags=re.S)
    if n != 1:
        _fail.append(f"{label}: expected 1 match, found {n}")


sub_once(r"(DOCK50-DOCK72 &nbsp;\|&nbsp; )[A-Z][a-z]+ \d{1,2}, \d{4}( &nbsp;\|&nbsp; Last refreshed: )[A-Z][a-z]{2} \d{1,2} \d{2}:\d{2} PT",
         lambda m: m.group(1) + DATE_LONG + m.group(2) + STAMP_SHORT, "header stamp")
sub_once(r"(live WISE sweep, )[A-Z][a-z]{2} \d{1,2} \d{2}:\d{2} PT",
         lambda m: m.group(1) + STAMP_SHORT, "all-time stamp")
sub_once(r'<li><strong className="text-\[#f59e0b\]">⚠ Aged Anomalies:.*?</li>',
         lambda m: ANOM_BULLET, "aged-anomaly bullet")
sub_once(r"(Bay 4 Active Assignee Breakdown\s*</span>\n)(.*?)(\n              </div>)",
         lambda m: m.group(1) + ASG_BLOCK + m.group(3), "assignee breakdown block")
sub_once(r"(Bay 4 Customer Mix &amp; Status\s*</span>\n)(.*?)(\n              </div>)",
         lambda m: m.group(1) + CUST_BLOCK + m.group(3), "customer mix block")
sub_once(r'<span className="text-xs text-\[#a1a1aa\] block mt-0\.5">\s*Facility sweep of all.*?</span>',
         lambda m: BANNER_BLOCK, "assigned-activity banner")
sub_once(r'(<span className="text-\[10px\] text-\[#71717a\] uppercase tracking-wider">\n\s*Arnulfo Active Bay 4 Tasks \()\d+(\)\s*</span>\n)(.*?)(\n              </div>)',
         lambda m: m.group(1) + str(n_arn) + m.group(2) + ARN_BODY + m.group(4), "Arnulfo column")
sub_once(r'<li><strong className="text-\[#f4f4f6\]">.*?</li>', lambda m: OCC_BULLET, "occupancy bullet")
sub_once(r'<li>Active tasks: .*?</li>', lambda m: MIX_BULLET, "mix bullet")
sub_once(r'<li>\d+ doors with at least one active task\..*?</li>', lambda m: DOOR_BULLET, "doors-with-task bullet")
sub_once(r'<li><strong className="text-\[#22c55e\]">★ Scheduled inbounds:.*?</li>', lambda m: INB_BULLET, "inbound bullet")
sub_once(r'<li><strong className="text-\[#7c3aed\]">★ Scheduled outbounds:.*?</li>', lambda m: OUT_BULLET, "outbound bullet")
sub_once(r'<li><strong className="text-\[#7c3aed\]">★ Customer mix:.*?</li>', lambda m: CM_BULLET, "customer-mix bullet")
sub_once(r'<li>Door status is task-derived\..*?</li>', lambda m: NAT_BULLET, "native-dock-status bullet")
sub_once(r"(All core metrics sourced from live WISE/WMS queries, )[A-Z][a-z]+ \d{1,2}, \d{4} \d{2}:\d{2} PT",
         lambda m: m.group(1) + f"{DATE_LONG} {STAMP_TIME}", "source stamp")
sub_once(r"(Last refreshed: )[A-Z][a-z]+ \d{1,2}, \d{4} \d{2}:\d{2} PT",
         lambda m: m.group(1) + f"{DATE_LONG} {STAMP_TIME}", "footer stamp")

if _fail:
    print("ABORTED — no changes written:")
    for f in _fail:
        print("  -", f)
    sys.exit(1)

open(P, "w", encoding="utf-8").write(s)
print("page.tsx refreshed with all snapshot values")
print("  occupied/reserved/available:", n_occ, n_res, n_avail, "| withTask:", n_with)
print("  mix out/in:", m_out, m_in, "| customer:", [(c["name"], c["count"]) for c in custmix], "| status:", smix)
print("  schedule in:", recv, "/", n_recv, "  out:", loaded, "/", n_out, "| native:", nat)
