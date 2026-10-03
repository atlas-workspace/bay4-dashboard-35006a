/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 *
 * TASK DATA: Refreshed 2026-10-02 18:15 PT (live WISE/WMS APIs, read-only)
 *   Sources:
 *     - /wms-bam/wms-location/search-by-paging        — resolved DOCK50–DOCK72 → location IDs (23 doors, re-verified; unchanged)
 *     - /wms-bam/outbound/load-task/search-by-paging  — active load tasks (status NEW + IN_PROGRESS, dockId filter)
 *     - /wms-bam/inbound/receive-task/search-by-paging— active receive tasks (status NEW + IN_PROGRESS, dockId filter)
 *     - /wms-bam/inbound/receipt/search-by-paging     — scheduled inbounds (appointmentTime on the 2026-10-02 facility-local day)
 *     - /wms-bam/outbound/load/search-by-paging       — scheduled outbounds (bounded day = ≥ Oct 02 minus ≥ Oct 03 buckets)
 *     - /wms-bam/task/general-task/search-by-paging   — facility general-task sweep (118 tasks) for the named Assigned Activity
 *   item-time-zone: America/Los_Angeles → appointment-day buckets are the FACILITY-LOCAL (PT) day.
 *
 *   SNAPSHOT INSTANT: 2026-10-03T01:15:00Z (2026-10-02 18:15 PT).
 *   Scope: tenant LT, facility LT_F1 (x-facility-id: LT_F1).
 *   Open / active = NEW + IN_PROGRESS. Door duration = snapshot instant − earliest IN_PROGRESS startTime on the door.
 *
 *   NOTE on timestamps: load-task/receive-task return task start/end timestamps in UTC; durations below are
 *   aged from those UTC start times to the UTC snapshot instant above.
 *
 *   Door-id map (re-verified this pull): DOCK50=570 DOCK51=554 DOCK52=556 DOCK53=552 DOCK54=564 DOCK55=560 DOCK56=575
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
// Duration = as-of 2026-10-03T01:15:00Z minus the earliest IN_PROGRESS task startTime on the door.
// anomaly = the door carries an IN_PROGRESS task whose endTime is already set (ended but never closed).
export const doors: DoorRecord[] = [
  // ─── OCCUPIED — doors with IN_PROGRESS tasks (7 doors) ───
  { door: "DOCK50", status: "Occupied", assignee: "ARNULFO MUNGUIA / daira gonzalez", customer: "GURUNANDA, LLC", taskIds: ["TASK-5381269", "TASK-5090739"], duration: "346d 4h 53m", anomaly: true },
  { door: "DOCK51", status: "Occupied", assignee: "ARNULFO MUNGUIA", customer: "GURUNANDA, LLC", taskIds: ["TASK-5381268"], duration: "3d 2h 48m", anomaly: false },
  { door: "DOCK53", status: "Occupied", assignee: "ARNULFO MUNGUIA", customer: "GURUNANDA, LLC", taskIds: ["TASK-5382457"], duration: "2d 2h 26m", anomaly: false },
  { door: "DOCK54", status: "Occupied", assignee: "ARNULFO MUNGUIA", customer: "GURUNANDA, LLC", taskIds: ["TASK-5382462", "TASK-5380820", "TASK-5338695"], duration: "56d 1h 45m", anomaly: true },
  { door: "DOCK55", status: "Occupied", assignee: "ARNULFO MUNGUIA", customer: "KARAKA, LLC", taskIds: ["TASK-5378787"], duration: "4d 9h 23m", anomaly: false },
  { door: "DOCK56", status: "Occupied", assignee: "CANDY MENDEZ", customer: "GURUNANDA, LLC", taskIds: ["TASK-5384550"], duration: "4h 53m", anomaly: false },
  { door: "DOCK69", status: "Occupied", assignee: "Jorge Antonio Franco", customer: "GURUNANDA, LLC", taskIds: ["TASK-5381972", "TASK-5377286"], duration: "7d 9h 36m", anomaly: false },

  // ─── RESERVED — doors with only NEW tasks (1 door) ───
  { door: "DOCK63", status: "Reserved", assignee: "DANIELA GONZALEZ", customer: "GURUNANDA, LLC", taskIds: ["TASK-5384803"], duration: null, anomaly: false },

  // ─── AVAILABLE — no active tasks (15 doors) ───
  { door: "DOCK52", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK57", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK58", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK59", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK60", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK61", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK62", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
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

// Active assignee task counts - Bay 4 DOCK50-DOCK72, task-level assignee mapping (12 tasks)
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 7 },
  { name: "Jorge Antonio Franco", taskCount: 2 },
  { name: "CANDY MENDEZ", taskCount: 1 },
  { name: "DANIELA GONZALEZ", taskCount: 1 },
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

// Mix: 6 LOAD (outbound) + 6 RECEIVE (inbound) = 12 active tasks at Bay 4 doors
export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 6, total: 12 },
  { label: "Inbound", count: 6, total: 12 },
];

export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 6, total: 12 },
  { label: "Inbound", count: 6, total: 12 },
];

// Schedule: facility-local 2026-10-02 (Friday).
// Inbound = receipts with appointmentTime on the day → 30 scheduled; received = receipt status CLOSED → 11 (36.7%).
// Outbound = loads with appointmentTime on the day (bounded day, cross-checked by cumulative subtraction):
//     all   : 440 (≥ Oct 02) − 322 (≥ Oct 03) = 118 scheduled
//     loaded: SHIPPED 101−2 = 99 plus LOADED 7−0 = 7 → 106 (LOADED or SHIPPED) → 89.8% loaded
export const scheduleAvailable = true;
export const scheduledInboundOrders = 30;
export const scheduledInboundReceived = 11;
export const scheduledOutboundOrders = 118;
export const scheduledOutboundLoaded = 106;
export const pctScheduledInboundReceived = (scheduledInboundReceived / scheduledInboundOrders) * 100; // 36.7%
export const pctScheduledOutboundLoaded = (scheduledOutboundLoaded / scheduledOutboundOrders) * 100;   // 89.8%

// Facility-wide appointment context — unavailable
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 0;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime
export const doorDurationsAvailable = true;

// Active task records from fresh WISE data (2026-10-03T01:15:00Z snapshot)
// 12 active tasks: 6 LOAD (outbound) + 6 RECEIVE (inbound)
export const assignments: TaskRecord[] = [
  { taskId: "TASK-5381269", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (3d 2h 45m)", assignee: "ARNULFO MUNGUIA", door: "DOCK50" },
  { taskId: "TASK-5090739", dns: "RECEIVE IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (346d 4h 53m) ⚠ STALE", assignee: "daira gonzalez", door: "DOCK50" },
  { taskId: "TASK-5381268", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (3d 2h 48m)", assignee: "ARNULFO MUNGUIA", door: "DOCK51" },
  { taskId: "TASK-5382457", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (2d 2h 26m)", assignee: "ARNULFO MUNGUIA", door: "DOCK53" },
  { taskId: "TASK-5382462", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (1d 8h 52m)", assignee: "ARNULFO MUNGUIA", door: "DOCK54" },
  { taskId: "TASK-5380820", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (3d 6h 7m)", assignee: "ARNULFO MUNGUIA", door: "DOCK54" },
  { taskId: "TASK-5338695", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (56d 1h 45m) ⚠ STALE", assignee: "ARNULFO MUNGUIA", door: "DOCK54" },
  { taskId: "TASK-5378787", dns: "RECEIVE IN_PROGRESS", customer: "KARAKA, LLC", pieces: "IN_PROGRESS (4d 9h 23m)", assignee: "ARNULFO MUNGUIA", door: "DOCK55" },
  { taskId: "TASK-5384550", dns: "RECEIVE IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (4h 53m)", assignee: "CANDY MENDEZ", door: "DOCK56" },
  { taskId: "TASK-5384803", dns: "RECEIVE NEW", customer: "GURUNANDA, LLC", pieces: "NEW — not started", assignee: "DANIELA GONZALEZ", door: "DOCK63" },
  { taskId: "TASK-5381972", dns: "RECEIVE NEW", customer: "GURUNANDA, LLC", pieces: "NEW — not started", assignee: "Jorge Antonio Franco", door: "DOCK69" },
  { taskId: "TASK-5377286", dns: "RECEIVE IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (7d 9h 36m)", assignee: "Jorge Antonio Franco", door: "DOCK69" },
];
