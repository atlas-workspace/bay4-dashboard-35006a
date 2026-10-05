/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 *
 * TASK DATA: Refreshed Oct 5 09:03 PT (live WISE/WMS APIs, read-only)
 *   Sources:
 *     - /wms-bam/wms-location/search-by-paging        — resolved DOCK50–DOCK72 → location IDs (23 doors, re-verified)
 *     - /wms-bam/outbound/load-task/search-by-paging  — active load tasks (status NEW + IN_PROGRESS, dockId filter)
 *     - /wms-bam/inbound/receive-task/search-by-paging— active receive tasks (status NEW + IN_PROGRESS, dockId filter)
 *     - /wms-bam/inbound/receipt/search-by-paging     — scheduled inbounds (appointmentTime on the 2026-10-05 facility-local PT day)
 *     - /wms-bam/outbound/load/search-by-paging       — scheduled outbounds (appointmentTime bucket for the 2026-10-05 PT day)
 *     - /wms-bam/task/general-task/search-by-paging   — facility general-task sweep (118 tasks) for the named Assigned Activity
 *   item-time-zone: America/Los_Angeles → appointment-day buckets are the FACILITY-LOCAL (PT) day.
 *
 *   SNAPSHOT INSTANT: 2026-10-05T16:03:05Z (Oct 5 09:03 PT).
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
// Duration = as-of 2026-10-05T16:03:05Z minus the earliest IN_PROGRESS task startTime on the door.
// anomaly = the door carries an IN_PROGRESS task whose endTime is already set (ended but never closed).
export const doors: DoorRecord[] = [
  // ─── OCCUPIED — doors with IN_PROGRESS tasks (8 doors) ───
  { door: "DOCK50", status: "Occupied", assignee: "ARNULFO MUNGUIA / daira gonzalez", customer: "GURUNANDA, LLC", taskIds: ["TASK-5090739", "TASK-5381269"], duration: "348d 19h 41m", anomaly: true },
  { door: "DOCK51", status: "Occupied", assignee: "ARNULFO MUNGUIA", customer: "GURUNANDA, LLC", taskIds: ["TASK-5381268"], duration: "5d 17h 36m", anomaly: false },
  { door: "DOCK53", status: "Occupied", assignee: "ARNULFO MUNGUIA", customer: "GURUNANDA, LLC", taskIds: ["TASK-5382457"], duration: "4d 17h 14m", anomaly: false },
  { door: "DOCK54", status: "Occupied", assignee: "ARNULFO MUNGUIA", customer: "GURUNANDA, LLC", taskIds: ["TASK-5338695", "TASK-5380820", "TASK-5382462"], duration: "58d 16h 33m", anomaly: true },
  { door: "DOCK55", status: "Occupied", assignee: "ARNULFO MUNGUIA", customer: "KARAKA, LLC", taskIds: ["TASK-5378787"], duration: "7d 0h 11m", anomaly: false },
  { door: "DOCK56", status: "Occupied", assignee: "CANDY MENDEZ / DANIEL BELTRAN", customer: "GURUNANDA, LLC", taskIds: ["TASK-5384550", "TASK-5385704"], duration: "2d 19h 41m", anomaly: false },
  { door: "DOCK68", status: "Occupied", assignee: "DANIELA GONZALEZ", customer: "GURUNANDA, LLC", taskIds: ["TASK-5384940"], duration: "2d 11h 16m", anomaly: false },
  { door: "DOCK69", status: "Occupied", assignee: "Jorge Antonio Franco", customer: "GURUNANDA, LLC", taskIds: ["TASK-5377286", "TASK-5381972"], duration: "10d 0h 24m", anomaly: false },

  // ─── AVAILABLE — no active tasks (15 doors) ───
  { door: "DOCK52", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK57", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
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

// Active assignee task counts - Bay 4 DOCK50-DOCK72, task-level assignee mapping (13 tasks)
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 7 },
  { name: "Jorge Antonio Franco", taskCount: 2 },
  { name: "CANDY MENDEZ", taskCount: 1 },
  { name: "DANIEL BELTRAN", taskCount: 1 },
  { name: "DANIELA GONZALEZ", taskCount: 1 },
  { name: "daira gonzalez", taskCount: 1 },
];

// All-time CLOSED LOAD + RECEIVE task counts at Bay 4 doors, by assignee.
// Live WISE sweep (per-door, statuses CLOSED + FORCE_CLOSED): 3944 closed tasks
// (2897 LOAD / 1047 RECEIVE), 83 distinct assignees.
export const allTimeAssigneeSummaries: AssigneeSummary[] = [
  { name: "DANIEL BELTRAN", taskCount: 1010 },
  { name: "ARNULFO MUNGUIA", taskCount: 1003 },
  { name: "DANIELA GONZALEZ", taskCount: 422 },
  { name: "GEORGE LC BROWN", taskCount: 151 },
  { name: "Renato Rosales", taskCount: 151 },
  { name: "Caren Cubides", taskCount: 147 },
  { name: "Fatima Ponce", taskCount: 120 },
  { name: "JULIO CESAR ALVARADO", taskCount: 113 },
  { name: "MARTIN MUNGUIA", taskCount: 106 },
  { name: "David Ramirez Selva", taskCount: 76 },
];

// Mix: 7 LOAD (outbound) + 6 RECEIVE (inbound) = 13 active tasks at Bay 4 doors
export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 7, total: 13 },
  { label: "Inbound", count: 6, total: 13 },
];

export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 7, total: 13 },
  { label: "Inbound", count: 6, total: 13 },
];

// Schedule: facility-local 2026-10-05 (Monday).
// Inbound = receipts with appointmentTime on the day → 22 scheduled; received = receipts with receivedTime → 1 (4.5%).
// Outbound = loads with appointmentTime on the day bucket → 160 scheduled;
//     loaded = load status LOADED or SHIPPED → 4 (2.5%)
export const scheduleAvailable = true;
export const scheduledInboundOrders = 22;
export const scheduledInboundReceived = 1;
export const scheduledOutboundOrders = 160;
export const scheduledOutboundLoaded = 4;
export const pctScheduledInboundReceived = scheduledInboundOrders > 0 ? (scheduledInboundReceived / scheduledInboundOrders) * 100 : 0; // 4.5%
export const pctScheduledOutboundLoaded = scheduledOutboundOrders > 0 ? (scheduledOutboundLoaded / scheduledOutboundOrders) * 100 : 0;   // 2.5%

// Facility-wide appointment context — unavailable
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 0;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime
export const doorDurationsAvailable = true;

// Active task records from fresh WISE data (2026-10-05T16:03:05Z snapshot)
// 13 active tasks: 7 LOAD (outbound) + 6 RECEIVE (inbound)
export const assignments: TaskRecord[] = [
  { taskId: "TASK-5090739", dns: "RECEIVE IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (348d 19h 41m) \u26a0 STALE", assignee: "daira gonzalez", door: "DOCK50" },
  { taskId: "TASK-5381269", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (5d 17h 33m)", assignee: "ARNULFO MUNGUIA", door: "DOCK50" },
  { taskId: "TASK-5381268", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (5d 17h 36m)", assignee: "ARNULFO MUNGUIA", door: "DOCK51" },
  { taskId: "TASK-5382457", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (4d 17h 14m)", assignee: "ARNULFO MUNGUIA", door: "DOCK53" },
  { taskId: "TASK-5338695", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (58d 16h 33m) \u26a0 STALE", assignee: "ARNULFO MUNGUIA", door: "DOCK54" },
  { taskId: "TASK-5380820", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (5d 20h 55m)", assignee: "ARNULFO MUNGUIA", door: "DOCK54" },
  { taskId: "TASK-5382462", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (3d 23h 40m)", assignee: "ARNULFO MUNGUIA", door: "DOCK54" },
  { taskId: "TASK-5378787", dns: "RECEIVE IN_PROGRESS", customer: "KARAKA, LLC", pieces: "IN_PROGRESS (7d 0h 11m)", assignee: "ARNULFO MUNGUIA", door: "DOCK55" },
  { taskId: "TASK-5384550", dns: "RECEIVE IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (2d 19h 41m)", assignee: "CANDY MENDEZ", door: "DOCK56" },
  { taskId: "TASK-5385704", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (0h 6m)", assignee: "DANIEL BELTRAN", door: "DOCK56" },
  { taskId: "TASK-5384940", dns: "RECEIVE IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (2d 11h 16m)", assignee: "DANIELA GONZALEZ", door: "DOCK68" },
  { taskId: "TASK-5377286", dns: "RECEIVE IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (10d 0h 24m)", assignee: "Jorge Antonio Franco", door: "DOCK69" },
  { taskId: "TASK-5381972", dns: "RECEIVE NEW", customer: "GURUNANDA, LLC", pieces: "NEW \u2014 not started", assignee: "Jorge Antonio Franco", door: "DOCK69" },
];
