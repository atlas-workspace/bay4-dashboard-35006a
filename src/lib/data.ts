/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 *
 * TASK DATA: Refreshed 2026-10-02 13:55 PT (live WISE/WMS APIs, read-only)
 *   Sources:
 *     - /wms-bam/wms-location/search-by-paging        — resolved DOCK50–DOCK72 → location IDs (23 doors, verified)
 *     - /wms-bam/outbound/load-task/search-by-paging  — active load tasks (status NEW + IN_PROGRESS, dockId filter)
 *     - /wms-bam/inbound/receive-task/search-by-paging— active receive tasks (status NEW + IN_PROGRESS, dockId filter)
 *     - /wms-bam/inbound/receipt/search-by-paging     — scheduled inbounds (appointmentTime window, 2026-10-02 facility day)
 *     - /wms-bam/outbound/load/search-by-paging       — scheduled outbounds (bounded appointmentTimePeriod + cumulative buckets)
 *     - /wms-bam/task/general-task/search-by-paging   — facility general-task sweep (118 tasks) for the named Assigned Activity
 *     - /wms-bam/organization/search-by-paging        — customer names (ORG-655875, ORG-585450)
 *   item-time-zone: America/Los_Angeles → appointment-day buckets are the FACILITY-LOCAL (PT) day; task
 *     start/end timestamps are returned by WISE in UTC and durations are aged startTime → snapshot UTC instant.
 *
 *   SNAPSHOT INSTANT: 2026-10-02T20:55:52Z (2026-10-02 13:55 PT).
 *   Scope: tenant LT, facility LT_F1 (x-facility-id: LT_F1).
 *   Open / active = NEW + IN_PROGRESS. Door duration = snapshot instant − earliest IN_PROGRESS startTime on the door.
 *
 *   Door-id map (verified this pull): DOCK50=570 DOCK51=554 DOCK52=556 DOCK53=552 DOCK54=564 DOCK55=560 DOCK56=575
 *     DOCK57=563 DOCK58=572 DOCK59=571 DOCK60=565 DOCK61=567 DOCK62=566 DOCK63=568 DOCK64=559
 *     DOCK65=573 DOCK66=576 DOCK67=577 DOCK68=574 DOCK69=578 DOCK70=579 DOCK71=580 DOCK72=587.
 *
 * Do NOT fabricate, estimate, or guess any metric.
 */

export type DoorStatus = "Occupied" | "Reserved" | "Available";

export interface DoorRecord {
  door: string;
  status: DoorStatus;
  assignee: string | null;
  customer: string | null;
  taskIds: string[];
  duration: string | null;
  anomaly: boolean;
}

export interface KpiMetric { label: string; value: string; numerator: number; denominator: number; percentage: number; }
export interface AssigneeSummary { name: string; taskCount: number; }
export interface MixMetric { label: string; count: number; total: number; }
export interface TaskRecord { taskId: string; dns: string; customer: string; pieces: string; assignee: string; door: string; }

// Retained for the (currently unmounted) GrazaDispatchSummary component so the
// source keeps its existing type contract.
export interface GrazaDispatchRun { runLabel: string; time: string; runInfo: { date: string; facility: string; customer: string; assignee: string; totalOrdersFound: number; }; plans: { planId: string; taskId: string; status: string; method: string; skipPackingScan: boolean; orderCount: number; }[]; labelNoteOrders: { dn: string; planId: string; status: string; note: string; }[]; exceptions: { dn: string; reason: string; action: string; }[]; summary: { totalPlans: number; totalTasks: number; exceptions: number; issues: string[]; }; }
export interface GrazaCombinedDispatchData { combinedSummary: { totalOrdersCovered: number; coveragePct: number; totalPlans: number; wavePlans: number; batchPlans: number; labelNotePlans: number; released: number; inProgress: number; failures: number; stuckPlans: number; unassignedTasks: number; exceptions: number; }; runs: GrazaDispatchRun[]; }

export const TOTAL_DOORS = 23;

// Door utilization — task-derived. "Occupied" = ≥1 IN_PROGRESS task;
// "Reserved" = only NEW tasks; "Available" = no active task.
// Duration = as-of 2026-10-02T20:55:52Z minus the earliest IN_PROGRESS task startTime on the door.
// anomaly = the door carries an IN_PROGRESS task whose endTime is already set (ended but never closed).
export const doors: DoorRecord[] = [
  // ─── OCCUPIED — doors with IN_PROGRESS tasks (8 doors) ───
  { door: "DOCK50", status: "Occupied", assignee: "ARNULFO MUNGUIA / daira gonzalez", customer: "GURUNANDA, LLC", taskIds: ["TASK-5381269", "TASK-5090739"], duration: "346d 0h 34m", anomaly: true },
  { door: "DOCK51", status: "Occupied", assignee: "ARNULFO MUNGUIA", customer: "GURUNANDA, LLC", taskIds: ["TASK-5381268"], duration: "2d 22h 29m", anomaly: false },
  { door: "DOCK52", status: "Occupied", assignee: "ARNULFO MUNGUIA", customer: "GURUNANDA, LLC", taskIds: ["TASK-5383483"], duration: "1d 0h 9m", anomaly: false },
  { door: "DOCK53", status: "Occupied", assignee: "ARNULFO MUNGUIA", customer: "GURUNANDA, LLC", taskIds: ["TASK-5382457"], duration: "1d 22h 7m", anomaly: false },
  { door: "DOCK54", status: "Occupied", assignee: "ARNULFO MUNGUIA", customer: "GURUNANDA, LLC", taskIds: ["TASK-5382462", "TASK-5380820", "TASK-5338695"], duration: "55d 21h 26m", anomaly: true },
  { door: "DOCK55", status: "Occupied", assignee: "ARNULFO MUNGUIA", customer: "KARAKA, LLC", taskIds: ["TASK-5380438", "TASK-5378787"], duration: "4d 5h 4m", anomaly: false },
  { door: "DOCK56", status: "Occupied", assignee: "CANDY MENDEZ", customer: "GURUNANDA, LLC", taskIds: ["TASK-5384550"], duration: "0h 34m", anomaly: false },
  { door: "DOCK69", status: "Occupied", assignee: "Jorge Antonio Franco", customer: "GURUNANDA, LLC", taskIds: ["TASK-5381972", "TASK-5377286"], duration: "7d 5h 17m", anomaly: false },

  // ─── RESERVED — doors with only NEW tasks (1 door) ───
  { door: "DOCK57", status: "Reserved", assignee: "ARNULFO MUNGUIA", customer: "GURUNANDA, LLC", taskIds: ["TASK-5384637"], duration: null, anomaly: false },

  // ─── AVAILABLE — no active tasks (14 doors) ───
  { door: "DOCK58", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK59", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK60", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK61", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK62", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK63", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK64", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK65", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK66", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK67", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK68", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK70", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK71", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK72", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
];

const ocupadas = doors.filter((d) => d.status === "Occupied").length;
const available = doors.filter((d) => d.status === "Available").length;
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length;

export const kpiMetrics: KpiMetric[] = [
  { label: "Doors w/ Active Tasks", value: `${doorsWithTasks}/23`, numerator: doorsWithTasks, denominator: TOTAL_DOORS, percentage: (doorsWithTasks / TOTAL_DOORS) * 100 },
  { label: "In Progress (Occupied)", value: `${ocupadas}`, numerator: ocupadas, denominator: TOTAL_DOORS, percentage: (ocupadas / TOTAL_DOORS) * 100 },
  { label: "Doors Available", value: `${available}`, numerator: available, denominator: TOTAL_DOORS, percentage: (available / TOTAL_DOORS) * 100 },
  { label: "Task Occupancy Rate", value: `${((doorsWithTasks / TOTAL_DOORS) * 100).toFixed(1)}%`, numerator: doorsWithTasks, denominator: TOTAL_DOORS, percentage: (doorsWithTasks / TOTAL_DOORS) * 100 },
];

// Active assignee task counts - Bay 4 DOCK50-DOCK72, task-level assignee mapping (14 tasks)
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 10 },
  { name: "Jorge Antonio Franco", taskCount: 2 },
  { name: "CANDY MENDEZ", taskCount: 1 },
  { name: "daira gonzalez", taskCount: 1 },
];

// PRIOR BASELINE — not regenerated in this refresh (no live all-time source pulled).
export const allTimeAssigneeSummaries: AssigneeSummary[] = [
  { name: "Arnulfo Munguia (89)", taskCount: 110 },
  { name: "Daniel Beltran", taskCount: 90 },
  { name: "Caren Cubides", taskCount: 3 },
  { name: "Daniela Gonzalez", taskCount: 1 },
  { name: "Fatima Ponce", taskCount: 1 },
  { name: "Nanci Viviana Rosas", taskCount: 1 },
  { name: "Rufino Munguia", taskCount: 1 },
];

// Mix: 8 LOAD (outbound) + 6 RECEIVE (inbound) = 14 active tasks at Bay 4 doors
export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 8, total: 14 },
  { label: "Inbound", count: 6, total: 14 },
];

export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 8, total: 14 },
  { label: "Inbound", count: 6, total: 14 },
];

// Schedule: facility-local 2026-10-02 (Friday).
// Inbound = receipts with appointmentTime on the day (server honors BOTH bounds);
//           received = receipt status CLOSED.  → 10 received of 29 scheduled (34.5%).
// Outbound = loads with appointmentTime on the day (appointmentTimePeriod honored; the
//   appointmentTimeFrom-only bound is not day-bounded, so the bounded period is used and
//   cross-checked by cumulative subtraction):
//     all   : 409 (≥ Oct 02) − 287 (≥ Oct 03) = 122 scheduled (bounded period also returns 122)
//     loaded: 58 (≥ Oct 02) − 2 (≥ Oct 03) = 56 (LOADED or SHIPPED) → 45.9% loaded
export const scheduleAvailable = true;
export const scheduledInboundOrders = 29;
export const scheduledInboundReceived = 10;
export const scheduledOutboundOrders = 122;
export const scheduledOutboundLoaded = 56;
export const pctScheduledInboundReceived = (scheduledInboundReceived / scheduledInboundOrders) * 100; // 34.5%
export const pctScheduledOutboundLoaded = (scheduledOutboundLoaded / scheduledOutboundOrders) * 100;   // 45.9%

// Facility-wide appointment context — unavailable
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 0;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime
export const doorDurationsAvailable = true;

// Active task records from fresh WISE data (2026-10-02T20:55:52Z snapshot)
// 14 active tasks: 8 LOAD (outbound) + 6 RECEIVE (inbound)
export const assignments: TaskRecord[] = [
  { taskId: "TASK-5381269", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (2d 22h 26m)", assignee: "ARNULFO MUNGUIA", door: "DOCK50" },
  { taskId: "TASK-5090739", dns: "RECEIVE IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (346d 0h 34m) ⚠ STALE", assignee: "daira gonzalez", door: "DOCK50" },
  { taskId: "TASK-5381268", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (2d 22h 29m)", assignee: "ARNULFO MUNGUIA", door: "DOCK51" },
  { taskId: "TASK-5383483", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (1d 0h 9m)", assignee: "ARNULFO MUNGUIA", door: "DOCK52" },
  { taskId: "TASK-5382457", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (1d 22h 7m)", assignee: "ARNULFO MUNGUIA", door: "DOCK53" },
  { taskId: "TASK-5382462", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (1d 4h 32m)", assignee: "ARNULFO MUNGUIA", door: "DOCK54" },
  { taskId: "TASK-5380820", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (3d 1h 47m)", assignee: "ARNULFO MUNGUIA", door: "DOCK54" },
  { taskId: "TASK-5338695", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (55d 21h 26m) ⚠ STALE", assignee: "ARNULFO MUNGUIA", door: "DOCK54" },
  { taskId: "TASK-5380438", dns: "RECEIVE IN_PROGRESS", customer: "KARAKA, LLC", pieces: "IN_PROGRESS (3d 0h 12m)", assignee: "ARNULFO MUNGUIA", door: "DOCK55" },
  { taskId: "TASK-5378787", dns: "RECEIVE IN_PROGRESS", customer: "KARAKA, LLC", pieces: "IN_PROGRESS (4d 5h 4m)", assignee: "ARNULFO MUNGUIA", door: "DOCK55" },
  { taskId: "TASK-5384550", dns: "RECEIVE IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (0h 34m)", assignee: "CANDY MENDEZ", door: "DOCK56" },
  { taskId: "TASK-5384637", dns: "LOAD NEW", customer: "GURUNANDA, LLC", pieces: "NEW — not started", assignee: "ARNULFO MUNGUIA", door: "DOCK57" },
  { taskId: "TASK-5381972", dns: "RECEIVE NEW", customer: "GURUNANDA, LLC", pieces: "NEW — not started", assignee: "Jorge Antonio Franco", door: "DOCK69" },
  { taskId: "TASK-5377286", dns: "RECEIVE IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (7d 5h 17m)", assignee: "Jorge Antonio Franco", door: "DOCK69" },
];
