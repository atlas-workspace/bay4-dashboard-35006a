/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 *
 * TASK DATA: Refreshed 2026-09-27 13:58 PT (live WISE/WMS APIs, read-only)
 *   Sources:
 *     - /wms-bam/wms-location/search-by-paging        — resolved DOCK50–DOCK72 → location IDs (23 doors, verified)
 *     - /wms-bam/outbound/load-task/search-by-paging  — active load tasks (statuses NEW + IN_PROGRESS, dockId filter, per door)
 *     - /wms-bam/inbound/receive-task/search-by-paging— active receive tasks (statuses NEW + IN_PROGRESS, dockId filter, per door)
 *     - /wms-bam/inbound/receipt/search-by-paging     — scheduled inbounds (appointmentTime 2026-09-27 facility-local day)
 *     - /wms-bam/outbound/load/search-by-paging       — scheduled outbounds (cumulative appointmentTime buckets, facility-local day)
 *     - /wms-bam/task/general-task/search-by-paging   — facility general-task sweep (116 tasks) for the named Assigned Activity
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
// Duration = as-of 2026-09-27 13:58 PT minus the earliest IN_PROGRESS task startTime on the door.
// anomaly = the door carries an IN_PROGRESS task whose endTime is already set (ended but never closed).
export const doors: DoorRecord[] = [
  // ─── OCCUPIED — doors with IN_PROGRESS tasks (5 doors) ───
  { door: "DOCK50", status: "Occupied", assignee: "daira gonzalez / ARNULFO MUNGUIA", customer: "GURUNANDA, LLC", taskIds: ["TASK-5090739", "TASK-5376774"], duration: "341d 0h 37m", anomaly: true },
  { door: "DOCK51", status: "Occupied", assignee: "DANIEL BELTRAN", customer: "GURUNANDA, LLC", taskIds: ["TASK-5377571"], duration: "2d 2h 3m", anomaly: false },
  { door: "DOCK53", status: "Occupied", assignee: "DANIEL BELTRAN", customer: "GURUNANDA, LLC", taskIds: ["TASK-5377822"], duration: "1d 22h 49m", anomaly: false },
  { door: "DOCK54", status: "Occupied", assignee: "ARNULFO MUNGUIA / RUFINO MUNGUIA", customer: "GURUNANDA, LLC", taskIds: ["TASK-5338695", "TASK-5377435"], duration: "50d 21h 29m", anomaly: true },
  { door: "DOCK69", status: "Occupied", assignee: "Jorge Antonio Franco", customer: "GURUNANDA, LLC", taskIds: ["TASK-5377286"], duration: "2d 5h 20m", anomaly: false },

  // ─── RESERVED — doors with only NEW tasks (1 door) ───
  { door: "DOCK56", status: "Reserved", assignee: "RUFINO MUNGUIA", customer: "GURUNANDA, LLC", taskIds: ["TASK-5377454"], duration: null, anomaly: false },

  // ─── AVAILABLE — no active tasks (17 doors) ───
  { door: "DOCK52", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK55", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
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

// Active assignee task counts - Bay 4 DOCK50-DOCK72, task-level assignee mapping (8 tasks)
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 2 },
  { name: "DANIEL BELTRAN", taskCount: 2 },
  { name: "RUFINO MUNGUIA", taskCount: 2 },
  { name: "daira gonzalez", taskCount: 1 },
  { name: "Jorge Antonio Franco", taskCount: 1 },
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

// Mix: 4 LOAD (outbound) + 4 RECEIVE (inbound) = 8 active tasks at Bay 4 doors
export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 4, total: 8 },
  { label: "Inbound", count: 4, total: 8 },
];

export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 4, total: 8 },
  { label: "Inbound", count: 4, total: 8 },
];

// Schedule: facility-local 2026-09-27 (Sunday). Inbound = receipts with appointmentTime on the day;
// received = receipt status CLOSED. Outbound = loads with appointmentTime on the day; loaded = LOADED or SHIPPED.
//
// Exact query contract (read-only):
//   receipts: POST /wms-bam/inbound/receipt/search-by-paging
//             { appointmentTimeFrom: "2026-09-27T00:00:00", appointmentTimeTo: "2026-09-27T23:59:59" }
//             → the server honors BOTH bounds; the returned totalCount for the day cohort is 0.
//   loads:    POST /wms-bam/outbound/load/search-by-paging
//             { appointmentTimeFrom: "<day>T00:00:00" }  → cumulative count of loads with appointmentTime >= bound
//             → the day cohort is derived by date-window subtraction (count(day) − count(next day)).
//   header:   item-time-zone: America/Los_Angeles  → the appointment day is the FACILITY-LOCAL (PT) day.
//
// 2026-09-27 is a Sunday: the facility has no scheduled inbound arrivals and no scheduled outbound loads
// with an appointment on that facility-local (PT) day (outbound cumulative buckets: Sep 27 = 314, Sep 28 = 314,
// Sep 29 = 182 → Sep 27 day cohort = 0). Both schedule KPIs are therefore N/A today.
export const scheduleAvailable = true;
export const scheduledInboundOrders = 0;
export const scheduledInboundReceived = 0;
export const scheduledOutboundOrders = 0;
export const scheduledOutboundLoaded = 0;
export const pctScheduledInboundReceived = 0;
export const pctScheduledOutboundLoaded = 0;

// Facility-wide appointment context — unavailable
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 0;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime
export const doorDurationsAvailable = true;

// Active task records from fresh WISE data (2026-09-27 13:58 PT)
// 8 active tasks: 4 LOAD (outbound) + 4 RECEIVE (inbound)
export const assignments: TaskRecord[] = [
  { taskId: "TASK-5090739", dns: "RECEIVE IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (341d 0h 37m) ⚠ STALE", assignee: "daira gonzalez", door: "DOCK50" },
  { taskId: "TASK-5376774", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (2d 22h 26m)", assignee: "ARNULFO MUNGUIA", door: "DOCK50" },
  { taskId: "TASK-5377571", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (2d 2h 3m)", assignee: "DANIEL BELTRAN", door: "DOCK51" },
  { taskId: "TASK-5377822", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (1d 22h 49m)", assignee: "DANIEL BELTRAN", door: "DOCK53" },
  { taskId: "TASK-5338695", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (50d 21h 29m) ⚠ STALE", assignee: "ARNULFO MUNGUIA", door: "DOCK54" },
  { taskId: "TASK-5377435", dns: "RECEIVE IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (2d 3h 52m)", assignee: "RUFINO MUNGUIA", door: "DOCK54" },
  { taskId: "TASK-5377454", dns: "RECEIVE NEW", customer: "GURUNANDA, LLC", pieces: "NEW — not started", assignee: "RUFINO MUNGUIA", door: "DOCK56" },
  { taskId: "TASK-5377286", dns: "RECEIVE IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (2d 5h 20m)", assignee: "Jorge Antonio Franco", door: "DOCK69" },
];
