/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 *
 * TASK DATA: Refreshed 2026-09-22 15:07 PT (live WISE/WMS APIs, read-only)
 *   Sources:
 *     - /wms-bam/wms-location/search-by-paging        — resolved DOCK50–DOCK72 → location IDs (23 doors, verified)
 *     - /wms-bam/outbound/load-task/search-by-paging  — active load tasks (statuses NEW + IN_PROGRESS, dockId filter, per door)
 *     - /wms-bam/inbound/receive-task/search-by-paging— active receive tasks (statuses NEW + IN_PROGRESS, dockId filter, per door)
 *     - /wms-bam/inbound/receipt/search-by-paging     — scheduled inbounds (appointmentTime 2026-09-22 facility-local day)
 *     - /wms-bam/outbound/load/search-by-paging       — scheduled outbounds (appointmentTime 2026-09-22 facility-local day)
 *     - /wms-bam/task/general-task/search-by-paging   — facility general-task sweep (115 tasks) for the named Assigned Activity
 *   item-time-zone: America/Los_Angeles → appointment day + returned times are FACILITY-LOCAL (PT).
 *   Customer names resolved live from org master: ORG-655875 → GURUNANDA, LLC / ORG-585450 → KARAKA, LLC.
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

export const TOTAL_DOORS = 23;

export interface GrazaDispatchRun { runLabel: string; time: string; runInfo: { date: string; facility: string; customer: string; assignee: string; totalOrdersFound: number; }; plans: { planId: string; taskId: string; status: string; method: string; skipPackingScan: boolean; orderCount: number; }[]; labelNoteOrders: { dn: string; planId: string; status: string; note: string; }[]; exceptions: { dn: string; reason: string; action: string; }[]; summary: { totalPlans: number; totalTasks: number; exceptions: number; issues: string[]; }; }
export interface GrazaCombinedDispatchData { combinedSummary: { totalOrdersCovered: number; coveragePct: number; totalPlans: number; wavePlans: number; batchPlans: number; labelNotePlans: number; released: number; inProgress: number; failures: number; stuckPlans: number; unassignedTasks: number; exceptions: number; }; runs: GrazaDispatchRun[]; }

// Door utilization — task-derived. "Occupied" = ≥1 IN_PROGRESS task;
// "Reserved" = only NEW tasks; "Available" = no active task.
// Duration = as-of 2026-09-22 15:07 PT minus the earliest IN_PROGRESS task startTime on the door.
// anomaly = the door carries an IN_PROGRESS task whose endTime is already set (ended but never closed).
export const doors: DoorRecord[] = [
  // ─── OCCUPIED — doors with IN_PROGRESS tasks (6 doors) ───
  { door: "DOCK50", status: "Occupied", assignee: "daira gonzalez", customer: "GURUNANDA, LLC", taskIds: ["TASK-5090739"], duration: "336d 1h 46m", anomaly: true },
  { door: "DOCK52", status: "Occupied", assignee: "DANIEL BELTRAN", customer: "GURUNANDA, LLC", taskIds: ["TASK-5374363"], duration: "0d 2h 41m", anomaly: false },
  { door: "DOCK53", status: "Occupied", assignee: "ARNULFO MUNGUIA", customer: "GURUNANDA, LLC", taskIds: ["TASK-5373472"], duration: "0d 23h 11m", anomaly: false },
  { door: "DOCK54", status: "Occupied", assignee: "JEROME ARANDA / ARNULFO MUNGUIA", customer: "GURUNANDA, LLC", taskIds: ["TASK-5374642", "TASK-5365421", "TASK-5338695"], duration: "45d 22h 37m", anomaly: true },
  { door: "DOCK59", status: "Occupied", assignee: "Fatima ponce", customer: "GURUNANDA, LLC", taskIds: ["TASK-5374092"], duration: "0d 0h 47m", anomaly: false },
  { door: "DOCK62", status: "Occupied", assignee: "ARNULFO MUNGUIA", customer: "GURUNANDA, LLC", taskIds: ["TASK-5365814"], duration: "8d 0h 22m", anomaly: false },

  // ─── RESERVED — doors with only NEW tasks (2 doors) ───
  { door: "DOCK55", status: "Reserved", assignee: "ARNULFO MUNGUIA", customer: "KARAKA, LLC", taskIds: ["TASK-5373122", "TASK-5368665"], duration: null, anomaly: false },
  { door: "DOCK56", status: "Reserved", assignee: "ARNULFO MUNGUIA", customer: "KARAKA, LLC", taskIds: ["TASK-5369120"], duration: null, anomaly: false },

  // ─── AVAILABLE — no active tasks (15 doors) ───
  { door: "DOCK51", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK57", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK58", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK60", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK61", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK63", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK64", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK65", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK66", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK67", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK68", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK69", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
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

// Active assignee task counts - Bay 4 DOCK50-DOCK72, task-level assignee mapping (11 tasks)
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 7 },
  { name: "daira gonzalez", taskCount: 1 },
  { name: "DANIEL BELTRAN", taskCount: 1 },
  { name: "JEROME ARANDA", taskCount: 1 },
  { name: "Fatima ponce", taskCount: 1 },
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

// Mix: 5 LOAD (outbound) + 6 RECEIVE (inbound) = 11 active tasks at Bay 4 doors
export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 5, total: 11 },
  { label: "Inbound", count: 6, total: 11 },
];

export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 5, total: 11 },
  { label: "Inbound", count: 6, total: 11 },
];

// Schedule: facility-local 2026-09-22 (Tuesday). Inbound = receipts with appointmentTime on the day;
// received = receipt status CLOSED. Outbound = loads with appointmentTime on the day; loaded = LOADED or SHIPPED.
//
// Exact query contract (read-only):
//   receipts: POST /wms-bam/inbound/receipt/search-by-paging
//             { appointmentTimeFrom: "2026-09-22T00:00:00", appointmentTimeTo: "2026-09-22T23:59:59" }
//             → the server honors BOTH bounds; the day cohort is the returned totalCount (36).
//   loads:    POST /wms-bam/outbound/load/search-by-paging
//             { appointmentTimeFrom: "2026-09-22T00:00:00" }   // server honors the lower bound only
//             → the day cohort is derived by date-window subtraction (see below).
//   header:   item-time-zone: America/Los_Angeles  → the appointment day is the FACILITY-LOCAL (PT) day.
//
// 36 receipts carry a Sep 22 facility-local (PT) appointment (received = 7 CLOSED -> 19.4%); outbound day cohort = count(appointmentTime >= day 00:00) - count(appointmentTime >= next day 00:00) = 423 - 314 = 109 loads; loaded = 77 - 3 = 74 (LOADED + SHIPPED) -> 67.9%.
export const scheduleAvailable = true;
export const scheduledInboundOrders = 36;
export const scheduledInboundReceived = 7;
export const scheduledOutboundOrders = 109;
export const scheduledOutboundLoaded = 74;
export const pctScheduledInboundReceived = (7 / 36) * 100;
export const pctScheduledOutboundLoaded = (74 / 109) * 100;

// Facility-wide appointment context — unavailable
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 0;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime
export const doorDurationsAvailable = true;

// Active task records from fresh WISE data (2026-09-22 15:07 PT)
// 11 active tasks: 5 LOAD (outbound) + 6 RECEIVE (inbound)
export const assignments: TaskRecord[] = [
  { taskId: "TASK-5090739", dns: "RECEIVE IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (336d 1h 46m) ⚠ STALE", assignee: "daira gonzalez", door: "DOCK50" },
  { taskId: "TASK-5374363", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (0d 2h 41m)", assignee: "DANIEL BELTRAN", door: "DOCK52" },
  { taskId: "TASK-5373472", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (0d 23h 11m)", assignee: "ARNULFO MUNGUIA", door: "DOCK53" },
  { taskId: "TASK-5374642", dns: "LOAD NEW", customer: "GURUNANDA, LLC", pieces: "NEW — not started", assignee: "JEROME ARANDA", door: "DOCK54" },
  { taskId: "TASK-5365421", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (11d 5h 34m) ⚠ STALE", assignee: "ARNULFO MUNGUIA", door: "DOCK54" },
  { taskId: "TASK-5338695", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (45d 22h 37m) ⚠ STALE", assignee: "ARNULFO MUNGUIA", door: "DOCK54" },
  { taskId: "TASK-5373122", dns: "RECEIVE NEW", customer: "KARAKA, LLC", pieces: "NEW — not started", assignee: "ARNULFO MUNGUIA", door: "DOCK55" },
  { taskId: "TASK-5368665", dns: "RECEIVE NEW", customer: "KARAKA, LLC", pieces: "NEW — not started", assignee: "ARNULFO MUNGUIA", door: "DOCK55" },
  { taskId: "TASK-5369120", dns: "RECEIVE NEW", customer: "KARAKA, LLC", pieces: "NEW — not started", assignee: "ARNULFO MUNGUIA", door: "DOCK56" },
  { taskId: "TASK-5374092", dns: "RECEIVE IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (0d 0h 47m)", assignee: "Fatima ponce", door: "DOCK59" },
  { taskId: "TASK-5365814", dns: "RECEIVE IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (8d 0h 22m)", assignee: "ARNULFO MUNGUIA", door: "DOCK62" },
];
