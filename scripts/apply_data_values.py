#!/usr/bin/env python3
"""Apply the fresh WISE snapshot values (wise_snapshot.json) to src/lib/data.ts.

Layout and component contracts are untouched: the type declarations are kept
verbatim and only the data exports (doors, KPIs, assignee summaries, mix,
schedule constants, active task records) are regenerated from the live snapshot.
Every value written here is read from wise_snapshot.json; nothing is estimated.
"""
import json
import re
from datetime import datetime, timezone, timedelta

S = json.load(open("wise_snapshot.json"))
P = "src/lib/data.ts"

_snap = datetime.strptime(S["snapshotUtc"], "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
_la = _snap.astimezone(timezone(timedelta(hours=-7)))            # PDT
STAMP = f"{_la.strftime('%b')} {_la.day} {_la.strftime('%H:%M')} PT"   # "Oct 17 10:48 PT"

doors = S["doors"]
kpi = S["kpi"]
mix = S["mix"]
sch = S["schedule"]
asg = S["assigneeSummaries"]
at = S["allTime"]
BOOT = S["bootDay"]

occupied = [d for d in doors if d["status"] == "Occupied"]
reserved = [d for d in doors if d["status"] == "Reserved"]
available = [d for d in doors if d["status"] == "Available"]
with_tasks = sum(1 for d in doors if d["taskIds"])


def js(s):
    return json.dumps(s, ensure_ascii=False)


# ---------------------------------------------------------------- header
header = f'''/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 *
 * TASK DATA: Refreshed {STAMP} (live WISE/WMS APIs, read-only)
 *   Sources:
 *     - /wms-bam/wms-location/search-by-paging        — resolved DOCK50–DOCK72 → location IDs (23 doors, re-verified)
 *     - /wms-bam/outbound/load-task/search-by-paging  — active load tasks (status NEW + IN_PROGRESS + EXCEPTION, dockId filter)
 *     - /wms-bam/inbound/receive-task/search-by-paging— active receive tasks (status NEW + IN_PROGRESS + EXCEPTION, dockId filter)
 *     - /wms-bam/inbound/receipt/search-by-paging     — scheduled inbounds (appointmentTime on the {BOOT} facility-local PT day)
 *     - /wms-bam/outbound/load/search-by-paging       — scheduled outbounds (appointmentTime bucket for the {BOOT} PT day)
 *     - /wms-bam/task/general-task/search-by-paging   — facility general-task sweep ({S["assignedActivity"]["facilityGeneralTaskTotal"]} tasks) for the named Assigned Activity
 *   item-time-zone: America/Los_Angeles → appointment-day buckets are the FACILITY-LOCAL (PT) day.
 *
 *   SNAPSHOT INSTANT: {S["snapshotUtc"]} ({STAMP}).
 *   Scope: tenant LT, facility LT_F1 (x-facility-id: LT_F1).
 *   Open / active = NEW + IN_PROGRESS. Door duration = snapshot instant − earliest IN_PROGRESS startTime on the door.
 *
 *   NOTE on timestamps: load-task/receive-task return task start/end timestamps in UTC; durations below are
 *   aged from those UTC start times to the UTC snapshot instant above.
 *
 *   Door-id map (re-verified this pull): {" ".join(f"{n}={i}" for i, n in S["doorIdMap"].items())}.
 *
 * Do NOT fabricate, estimate, or guess any metric.
 */
'''


def door_line(d):
    if d["status"] == "Occupied":
        who = " / ".join(d["assignees"]) if d["assignees"] else None
        cust = " / ".join(d["customers"]) if d["customers"] else None
    elif d["status"] == "Reserved":
        who = " / ".join(d["assignees"]) if d["assignees"] else None
        cust = " / ".join(d["customers"]) if d["customers"] else None
    else:
        who = cust = None
    return (f'  {{ door: {js(d["door"])}, status: {js(d["status"])}, assignee: '
            f'{js(who) if who else "null"}, customer: {js(cust) if cust else "null"}, '
            f'taskIds: {json.dumps(sorted(d["taskIds"]))}, duration: '
            f'{js(d["duration"]) if d["duration"] else "null"}, anomaly: '
            f'{"true" if d["anomaly"] else "false"} }},')


door_block = 'export const doors: DoorRecord[] = [\n'
door_block += f'  // ─── OCCUPIED — doors with IN_PROGRESS tasks ({len(occupied)} doors) ───\n'
for d in occupied:
    door_block += door_line(d) + "\n"
door_block += f'\n  // ─── RESERVED / AVAILABLE — no IN_PROGRESS task ({len(reserved) + len(available)} doors) ───\n'
for d in sorted(doors, key=lambda x: x["door"]):
    if d["status"] != "Occupied":
        door_block += door_line(d) + "\n"
door_block += "];"

asg_lines = "\n".join(f'  {{ name: {js(a["name"])}, taskCount: {a["taskCount"]} }},' for a in asg)
all_lines = "\n".join(f'  {{ name: {js(a["name"])}, taskCount: {a["count"]} }},' for a in at["top"])


def task_pieces(t):
    if t["status"] == "NEW" and not t["start"]:
        return "NEW — not started"
    base = f'{t["status"]} ({t["duration"]})' if t["duration"] else t["status"]
    if t["end"]:
        base += " ⚠ STALE"
    return base


assign_rows = []
for d in sorted(doors, key=lambda x: x["door"]):
    for t in d["tasks"]:
        assign_rows.append(
            f'  {{ taskId: {js(t["id"])}, dns: {js(t["type"] + " " + t["status"])}, '
            f'customer: {js(t["customer"])}, pieces: {js(task_pieces(t))}, '
            f'assignee: {js(t["assignee"] or "(unassigned)")}, door: {js(d["door"])} }},')
assign_block = "\n".join(assign_rows)

body = f'''
export const TOTAL_DOORS = 23;

// Door utilization — task-derived. "Occupied" = ≥1 IN_PROGRESS task;
// "Reserved" = only NEW tasks; "Available" = no active task.
// Duration = as-of {S["snapshotUtc"]} minus the earliest IN_PROGRESS task startTime on the door.
// anomaly = the door carries an IN_PROGRESS task whose endTime is already set (ended but never closed).
{door_block}

const ocupadas = doors.filter((d) => d.status === "Occupied").length;
const available = doors.filter((d) => d.status === "Available").length;
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length;

export const kpiMetrics: KpiMetric[] = [
  {{ label: "Doors w/ Active Tasks", value: `${{doorsWithTasks}}/23`, numerator: doorsWithTasks, denominator: TOTAL_DOORS, percentage: (doorsWithTasks / TOTAL_DOORS) * 100 }},
  {{ label: "In Progress (Occupied)", value: `${{ocupadas}}`, numerator: ocupadas, denominator: TOTAL_DOORS, percentage: (ocupadas / TOTAL_DOORS) * 100 }},
  {{ label: "Doors Available", value: `${{available}}`, numerator: available, denominator: TOTAL_DOORS, percentage: (available / TOTAL_DOORS) * 100 }},
  {{ label: "Task Occupancy Rate", value: `${{((doorsWithTasks / TOTAL_DOORS) * 100).toFixed(1)}}%`, numerator: doorsWithTasks, denominator: TOTAL_DOORS, percentage: (doorsWithTasks / TOTAL_DOORS) * 100 }},
];

// Active assignee task counts - Bay 4 DOCK50-DOCK72, task-level assignee mapping ({mix["total"]} tasks)
export const assigneeSummaries: AssigneeSummary[] = [
{asg_lines}
];

// All-time CLOSED LOAD + RECEIVE task counts at Bay 4 doors, by assignee.
// Live WISE sweep (per-door, statuses CLOSED + FORCE_CLOSED): {at["closedTotal"]} closed tasks
// ({at["load"]} LOAD / {at["receive"]} RECEIVE), {at["distinct"]} distinct assignees.
export const allTimeAssigneeSummaries: AssigneeSummary[] = [
{all_lines}
];

// Mix: {mix["outbound"]} LOAD (outbound) + {mix["inbound"]} RECEIVE (inbound) = {mix["total"]} active tasks at Bay 4 doors
export const inboundOutboundMix: MixMetric[] = [
  {{ label: "Outbound", count: {mix["outbound"]}, total: {mix["total"]} }},
  {{ label: "Inbound", count: {mix["inbound"]}, total: {mix["total"]} }},
];

export const activeInboundOutboundMix: MixMetric[] = [
  {{ label: "Outbound", count: {mix["outbound"]}, total: {mix["total"]} }},
  {{ label: "Inbound", count: {mix["inbound"]}, total: {mix["total"]} }},
];

// Schedule: facility-local {BOOT}.
// Inbound = receipts with appointmentTime on the day → {sch["inboundOrders"]} scheduled; received = receipts with receivedTime → {sch["inboundReceived"]} ({round((sch["inboundReceived"] / sch["inboundOrders"] * 100) if sch["inboundOrders"] else 0, 1)}%).
// Outbound = loads with appointmentTime on the day bucket → {sch["outboundOrders"]} scheduled;
//     loaded = load status LOADED or SHIPPED → {sch["outboundLoaded"]} ({round((sch["outboundLoaded"] / sch["outboundOrders"] * 100) if sch["outboundOrders"] else 0, 1)}%)
export const scheduleAvailable = true;
export const scheduledInboundOrders = {sch["inboundOrders"]};
export const scheduledInboundReceived = {sch["inboundReceived"]};
export const scheduledOutboundOrders = {sch["outboundOrders"]};
export const scheduledOutboundLoaded = {sch["outboundLoaded"]};
export const pctScheduledInboundReceived = scheduledInboundOrders > 0 ? (scheduledInboundReceived / scheduledInboundOrders) * 100 : 0;
export const pctScheduledOutboundLoaded = scheduledOutboundOrders > 0 ? (scheduledOutboundLoaded / scheduledOutboundOrders) * 100 : 0;

// Facility-wide appointment context — unavailable
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 0;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime
export const doorDurationsAvailable = true;

// Active task records from fresh WISE data ({S["snapshotUtc"]} snapshot)
// {mix["total"]} active tasks: {mix["outbound"]} LOAD (outbound) + {mix["inbound"]} RECEIVE (inbound)
export const assignments: TaskRecord[] = [
{assign_block}
];
'''

src = open(P).read()
anchor = "export type DoorStatus"
head = src[: src.index("export interface GrazaCombinedDispatchData")]
head = head[head.index(anchor):]  # drop old doc block, keep types verbatim to the Graza interface
graza = "export interface GrazaCombinedDispatchData"
graza_end = src.index("\n\n", src.index(graza))
types = src[src.index(anchor): graza_end]

open(P, "w").write(header + "\n" + types + "\n" + body)
print("data.ts refreshed from wise_snapshot.json")
print(" doors:", len(doors), "occupied:", len(occupied), "reserved:", len(reserved),
      "available:", len(available), "withTasks:", with_tasks)
print(" mix:", mix, "schedule:", sch["inboundOrders"], sch["inboundReceived"],
      sch["outboundOrders"], sch["outboundLoaded"])
print(" assignees:", len(asg), "assignments rows:", len(assign_rows))
