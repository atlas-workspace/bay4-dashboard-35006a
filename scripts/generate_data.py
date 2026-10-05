#!/usr/bin/env python3
"""Render src/lib/data.ts and the JSON artifacts from the live WISE snapshot."""
import json, re
from datetime import datetime, timezone, timedelta

S = json.load(open("wise_snapshot.json"))
doors = S["doors"]
kpi = S["kpi"]
LA_STAMP = S["refreshStampLA"]                        # "Oct 04 ~17:23 PDT"
ISO = S["snapshotUtc"]
_la = datetime.strptime(ISO, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc).astimezone(timezone(timedelta(hours=-7)))
ISO_HUMAN = f"{_la.strftime('%b')} {_la.day} {_la.strftime('%H:%M')} PT"      # "Oct 4 17:23 PT"
DATE_LONG = f"{_la.strftime('%B')} {_la.day}, {_la.strftime('%Y')}"          # "October 4, 2026"
BOOT = S["bootDay"]                                                           # "2026-10-04"
_boot_dt = datetime.strptime(BOOT, "%Y-%m-%d")
BOOT_LONG = f"{_boot_dt.strftime('%B')} {_boot_dt.day}, {_boot_dt.strftime('%Y')}"
WEEKDAY = _boot_dt.strftime("%A")
GTOTAL = S["assignedActivity"]["facilityGeneralTaskTotal"]

# ---- helpers -------------------------------------------------------------
def jassignees(d):
    return " / ".join(sorted(d["assignees"], key=lambda s: (s.lower(), s))) or None

def jcustomers(d):
    return " / ".join(sorted(set(d["customers"]))) or None

def door_duration(d):
    return d["duration"]

# assignments rows sorted by (door number, task id)
rows = []
for d in doors:
    for t in d["tasks"]:
        rows.append((int(d["door"].replace("DOCK", "")), t["id"], d["door"], t))
rows.sort(key=lambda x: (x[0], x[1]))

def pieces(t):
    if t["status"] == "NEW":
        p = "NEW — not started"
    else:
        p = f"IN_PROGRESS ({t['duration']})"
    if t["end"]:
        p += " ⚠ STALE"
    return p

# ---- doors block ---------------------------------------------------------
door_lines = []
occ = [d for d in doors if d["status"] == "Occupied"]
oth = [d for d in doors if d["status"] != "Occupied"]
door_lines.append(f"  // ─── OCCUPIED — doors with IN_PROGRESS tasks ({len(occ)} doors) ───")
for d in occ:
    door_lines.append(
        f'  {{ door: "{d["door"]}", status: "Occupied", assignee: {json.dumps(jassignees(d))}, '
        f'customer: {json.dumps(jcustomers(d))}, taskIds: {json.dumps(sorted(d["taskIds"]))}, '
        f'duration: {json.dumps(door_duration(d))}, anomaly: {str(d["anomaly"]).lower()} }},')
door_lines.append("")
door_lines.append(f"  // ─── AVAILABLE — no active tasks ({len(oth)} doors) ───")
for d in oth:
    door_lines.append(
        f'  {{ door: "{d["door"]}", status: "{d["status"]}", assignee: null, customer: null, '
        f'taskIds: [], duration: null, anomaly: false }},')
doors_block = "\n".join(door_lines).rstrip()

# ---- assignees -----------------------------------------------------------
asg = sorted(S["assigneeSummaries"], key=lambda a: (-a["taskCount"], a["name"]))
asg_lines = "\n".join(f'  {{ name: {json.dumps(a["name"])}, taskCount: {a["taskCount"]} }},' for a in asg)
asg_total = sum(a["taskCount"] for a in asg)

# ---- all-time ------------------------------------------------------------
at = S["allTime"]["top"]
at_lines = "\n".join(f'  {{ name: {json.dumps(a["name"])}, taskCount: {a["count"]} }},' for a in at)

# ---- assignments ---------------------------------------------------------
assign_lines = "\n".join(
    f'  {{ taskId: {json.dumps(t["id"])}, dns: {json.dumps(t["type"] + " " + t["status"])}, '
    f'customer: {json.dumps(t["customer"])}, pieces: {json.dumps(pieces(t))}, '
    f'assignee: {json.dumps(t["assignee"])}, door: {json.dumps(dn)} }},'
    for _, _, dn, t in rows)

mix = S["mix"]
sch = S["schedule"]
pct_in = (sch["inboundReceived"] / len(sch["receiptRows"])) * 100 if sch["receiptRows"] else 0.0

data_ts = f'''/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 *
 * TASK DATA: Refreshed {ISO_HUMAN} (live WISE/WMS APIs, read-only)
 *   Sources:
 *     - /wms-bam/wms-location/search-by-paging        — resolved DOCK50–DOCK72 → location IDs (23 doors, re-verified)
 *     - /wms-bam/outbound/load-task/search-by-paging  — active load tasks (status NEW + IN_PROGRESS, dockId filter)
 *     - /wms-bam/inbound/receive-task/search-by-paging— active receive tasks (status NEW + IN_PROGRESS, dockId filter)
 *     - /wms-bam/inbound/receipt/search-by-paging     — scheduled inbounds (appointmentTime on the {BOOT} facility-local PT day)
 *     - /wms-bam/outbound/load/search-by-paging       — scheduled outbounds (appointmentTime bucket for the {BOOT} PT day)
 *     - /wms-bam/task/general-task/search-by-paging   — facility general-task sweep ({GTOTAL} tasks) for the named Assigned Activity
 *   item-time-zone: America/Los_Angeles → appointment-day buckets are the FACILITY-LOCAL (PT) day.
 *
 *   SNAPSHOT INSTANT: {ISO} ({ISO_HUMAN}).
 *   Scope: tenant LT, facility LT_F1 (x-facility-id: LT_F1).
 *   Open / active = NEW + IN_PROGRESS. Door duration = snapshot instant − earliest IN_PROGRESS startTime on the door.
 *
 *   NOTE on timestamps: load-task/receive-task return task start/end timestamps in UTC; durations below are
 *   aged from those UTC start times to the UTC snapshot instant above.
 *
 *   Door-id map (re-verified this pull): DOCK50=570 DOCK51=554 DOCK52=556 DOCK53=552 DOCK54=564 DOCK55=560 DOCK56=575 DOCK57=563 DOCK58=572 DOCK59=571 DOCK60=565 DOCK61=567 DOCK62=566 DOCK63=568 DOCK64=559 DOCK65=573 DOCK66=576 DOCK67=577 DOCK68=574 DOCK69=578 DOCK70=579 DOCK71=580 DOCK72=587.
 *
 * Do NOT fabricate, estimate, or guess any metric.
 */

export type DoorStatus = "Occupied" | "Reserved" | "Available";

export interface DoorRecord {{
  door: string;
  status: DoorStatus;
  assignee: string | null;
  customer: string | null;
  taskIds: string[];
  duration: string | null;
  anomaly: boolean;
}}

export interface KpiMetric {{ label: string; value: string; numerator: number; denominator: number; percentage: number; }}
export interface AssigneeSummary {{ name: string; taskCount: number; }}
export interface MixMetric {{ label: string; count: number; total: number; }}
export interface TaskRecord {{ taskId: string; dns: string; customer: string; pieces: string; assignee: string; door: string; }}

// Retained for the (currently unmounted) GrazaDispatchSummary component so the
// source keeps its existing type contract.
export interface GrazaDispatchRun {{ runLabel: string; time: string; runInfo: {{ date: string; facility: string; customer: string; assignee: string; totalOrdersFound: number; }}; plans: {{ planId: string; taskId: string; status: string; method: string; skipPackingScan: boolean; orderCount: number; }}[]; labelNoteOrders: {{ dn: string; planId: string; status: string; note: string; }}[]; exceptions: {{ dn: string; reason: string; action: string; }}[]; summary: {{ totalPlans: number; totalTasks: number; exceptions: number; issues: string[]; }}; }}
export interface GrazaCombinedDispatchData {{ combinedSummary: {{ totalOrdersCovered: number; coveragePct: number; totalPlans: number; wavePlans: number; batchPlans: number; labelNotePlans: number; released: number; inProgress: number; failures: number; stuckPlans: number; unassignedTasks: number; exceptions: number; }}; runs: GrazaDispatchRun[]; }}

export const TOTAL_DOORS = 23;

// Door utilization — task-derived. "Occupied" = ≥1 IN_PROGRESS task;
// "Reserved" = only NEW tasks; "Available" = no active task.
// Duration = as-of {ISO} minus the earliest IN_PROGRESS task startTime on the door.
// anomaly = the door carries an IN_PROGRESS task whose endTime is already set (ended but never closed).
export const doors: DoorRecord[] = [
{doors_block}
];

const ocupadas = doors.filter((d) => d.status === "Occupied").length;
const available = doors.filter((d) => d.status === "Available").length;
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length;

export const kpiMetrics: KpiMetric[] = [
  {{ label: "Doors w/ Active Tasks", value: `${{doorsWithTasks}}/23`, numerator: doorsWithTasks, denominator: TOTAL_DOORS, percentage: (doorsWithTasks / TOTAL_DOORS) * 100 }},
  {{ label: "In Progress (Occupied)", value: `${{ocupadas}}`, numerator: ocupadas, denominator: TOTAL_DOORS, percentage: (ocupadas / TOTAL_DOORS) * 100 }},
  {{ label: "Doors Available", value: `${{available}}`, numerator: available, denominator: TOTAL_DOORS, percentage: (available / TOTAL_DOORS) * 100 }},
  {{ label: "Task Occupancy Rate", value: `${{((doorsWithTasks / TOTAL_DOORS) * 100).toFixed(1)}}%`, numerator: doorsWithTasks, denominator: TOTAL_DOORS, percentage: (doorsWithTasks / TOTAL_DOORS) * 100 }},
];

// Active assignee task counts - Bay 4 DOCK50-DOCK72, task-level assignee mapping ({asg_total} tasks)
export const assigneeSummaries: AssigneeSummary[] = [
{asg_lines}
];

// All-time CLOSED LOAD + RECEIVE task counts at Bay 4 doors, by assignee.
// Live WISE sweep (per-door, statuses CLOSED + FORCE_CLOSED): {S["allTime"]["closedTotal"]} closed tasks
// ({S["allTime"]["load"]} LOAD / {S["allTime"]["receive"]} RECEIVE), {S["allTime"]["distinct"]} distinct assignees.
export const allTimeAssigneeSummaries: AssigneeSummary[] = [
{at_lines}
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

// Schedule: facility-local {BOOT} ({WEEKDAY}).
// Inbound = receipts with appointmentTime on the day → {len(sch["receiptRows"])} scheduled; received = receipts with receivedTime → {sch["inboundReceived"]} ({pct_in:.1f}%).
// Outbound = loads with appointmentTime on the day bucket → {len(sch["loadRowsPreview"])} scheduled ({WEEKDAY} — no loads booked);
//     loaded = load status LOADED or SHIPPED → {sch["outboundLoaded"]} (no scheduled outbounds to load)
export const scheduleAvailable = true;
export const scheduledInboundOrders = {len(sch["receiptRows"])};
export const scheduledInboundReceived = {sch["inboundReceived"]};
export const scheduledOutboundOrders = {len(sch["loadRowsPreview"])};
export const scheduledOutboundLoaded = {sch["outboundLoaded"]};
export const pctScheduledInboundReceived = scheduledInboundOrders > 0 ? (scheduledInboundReceived / scheduledInboundOrders) * 100 : 0; // {pct_in:.1f}%
export const pctScheduledOutboundLoaded = scheduledOutboundOrders > 0 ? (scheduledOutboundLoaded / scheduledOutboundOrders) * 100 : 0;   // n/a (0 scheduled)

// Facility-wide appointment context — unavailable
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 0;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime
export const doorDurationsAvailable = true;

// Active task records from fresh WISE data ({ISO} snapshot)
// {mix["total"]} active tasks: {mix["outbound"]} LOAD (outbound) + {mix["inbound"]} RECEIVE (inbound)
export const assignments: TaskRecord[] = [
{assign_lines}
];
'''

with open("src/lib/data.ts", "w") as f:
    f.write(data_ts)
print("wrote src/lib/data.ts")
print("doors occ/res/avail:", kpi["occupied"], kpi["reserved"], kpi["available"], "anom", kpi["anomalous"])
print("assignee order:", [(a["name"], a["taskCount"]) for a in asg])
print("alltime top:", [(a["name"], a["count"]) for a in at])
print("assignments rows:", len(rows))
