/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 *
 * TASK DATA: Refreshed Oct 14 09:10 PT (live WISE/WMS APIs, read-only)
 *   Sources:
 *     - /wms-bam/wms-location/search-by-paging        — resolved DOCK50–DOCK72 → location IDs (23 doors, re-verified)
 *     - /wms-bam/outbound/load-task/search-by-paging  — active load tasks (status NEW + IN_PROGRESS + EXCEPTION, dockId filter)
 *     - /wms-bam/inbound/receive-task/search-by-paging— active receive tasks (status NEW + IN_PROGRESS + EXCEPTION, dockId filter)
 *     - /wms-bam/inbound/receipt/search-by-paging     — scheduled inbounds (appointmentTime on the 2026-10-14 facility-local PT day)
 *     - /wms-bam/outbound/load/search-by-paging       — scheduled outbounds (appointmentTime bucket for the 2026-10-14 PT day)
 *     - /wms-bam/task/general-task/search-by-paging   — facility general-task sweep (120 tasks) for the named Assigned Activity
 *   item-time-zone: America/Los_Angeles → appointment-day buckets are the FACILITY-LOCAL (PT) day.
 *
 *   SNAPSHOT INSTANT: 2026-10-14T16:10:58Z (Oct 14 09:10 PT).
 *   Scope: tenant LT, facility LT_F1 (x-facility-id: LT_F1).
 *   Open / active = NEW + IN_PROGRESS. Door duration = snapshot instant − earliest task startTime on the door.
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
// Duration = as-of 2026-10-14T16:10:58Z minus the earliest task startTime on the door.
// anomaly = the door carries an IN_PROGRESS task whose endTime is already set (ended but never closed).
export const doors: DoorRecord[] = [
  // ─── OCCUPIED — doors with IN_PROGRESS tasks (12 doors) ───
  { door: "DOCK50", status: "Occupied", assignee: "daira gonzalez / ARNULFO MUNGUIA", customer: "GURUNANDA, LLC / KARAKA, LLC", taskIds: ["TASK-5090739", "TASK-5391985"], duration: "357d 19h 49m", anomaly: true },
  { door: "DOCK51", status: "Occupied", assignee: "ARNULFO MUNGUIA", customer: "GURUNANDA, LLC", taskIds: ["TASK-5393782"], duration: "17h 36m", anomaly: false },
  { door: "DOCK52", status: "Occupied", assignee: "JESUS ESPINOZA", customer: "GURUNANDA, LLC", taskIds: ["TASK-5392751"], duration: "1d 12h 5m", anomaly: false },
  { door: "DOCK53", status: "Occupied", assignee: "RUFINO MUNGUIA / EDUARDO MEJIA", customer: "GURUNANDA, LLC", taskIds: ["TASK-5389637", "TASK-5393918"], duration: "5d 22h 16m", anomaly: false },
  { door: "DOCK54", status: "Occupied", assignee: "ARNULFO MUNGUIA / EDUARDO MEJIA", customer: "GURUNANDA, LLC", taskIds: ["TASK-5338695", "TASK-5393866"], duration: "67d 16h 41m", anomaly: true },
  { door: "DOCK56", status: "Occupied", assignee: "JESUS ESPINOZA", customer: "GURUNANDA, LLC", taskIds: ["TASK-5392752"], duration: "1d 11h 24m", anomaly: false },
  { door: "DOCK57", status: "Occupied", assignee: "EDUARDO MEJIA", customer: "GURUNANDA, LLC", taskIds: ["TASK-5392753"], duration: "1d 11h 22m", anomaly: false },
  { door: "DOCK58", status: "Occupied", assignee: "EDUARDO MEJIA", customer: "GURUNANDA, LLC", taskIds: ["TASK-5393812"], duration: "15h 3m", anomaly: false },
  { door: "DOCK60", status: "Occupied", assignee: "EDUARDO MEJIA / DANIEL BELTRAN", customer: "GURUNANDA, LLC", taskIds: ["TASK-5393915", "TASK-5394178"], duration: "14h 30m", anomaly: false },
  { door: "DOCK62", status: "Occupied", assignee: "JORGE ARMANDO DUENAS", customer: "GURUNANDA, LLC", taskIds: ["TASK-5393820"], duration: "17h 9m", anomaly: false },
  { door: "DOCK69", status: "Occupied", assignee: "EDUARDO MEJIA / Jorge Antonio Franco", customer: "GURUNANDA, LLC", taskIds: ["TASK-5381972", "TASK-5393920"], duration: "14h 0m", anomaly: false },
  { door: "DOCK70", status: "Occupied", assignee: "EDUARDO MEJIA", customer: "GURUNANDA, LLC", taskIds: ["TASK-5393921"], duration: "14h 2m", anomaly: false },

  // ─── RESERVED — NEW task only, not started (1 door) ───
  { door: "DOCK55", status: "Reserved", assignee: "ARNULFO MUNGUIA", customer: "KARAKA, LLC", taskIds: ["TASK-5393281"], duration: null, anomaly: false },

  // ─── AVAILABLE — no active tasks (10 doors) ───
  { door: "DOCK59", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK61", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK63", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK64", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK65", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK66", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK67", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK68", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
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

// Active assignee task counts - Bay 4 DOCK50-DOCK72, task-level assignee mapping (18 tasks)
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "EDUARDO MEJIA", taskCount: 7 },
  { name: "ARNULFO MUNGUIA", taskCount: 4 },
  { name: "JESUS ESPINOZA", taskCount: 2 },
  { name: "DANIEL BELTRAN", taskCount: 1 },
  { name: "JORGE ARMANDO DUENAS", taskCount: 1 },
  { name: "RUFINO MUNGUIA", taskCount: 1 },
  { name: "Jorge Antonio Franco", taskCount: 1 },
  { name: "daira gonzalez", taskCount: 1 },
];

// All-time CLOSED LOAD + RECEIVE task counts at Bay 4 doors, by assignee.
// Live WISE sweep (per-door, statuses CLOSED + FORCE_CLOSED): 4048 closed tasks
// (2971 LOAD / 1077 RECEIVE), 84 distinct assignees.
export const allTimeAssigneeSummaries: AssigneeSummary[] = [
  { name: "DANIEL BELTRAN", taskCount: 1050 },
  { name: "ARNULFO MUNGUIA", taskCount: 1037 },
  { name: "DANIELA GONZALEZ", taskCount: 430 },
  { name: "GEORGE LC BROWN", taskCount: 151 },
  { name: "Renato Rosales", taskCount: 151 },
  { name: "Caren Cubides", taskCount: 147 },
  { name: "Fatima Ponce", taskCount: 131 },
  { name: "JULIO CESAR ALVARADO", taskCount: 113 },
  { name: "MARTIN MUNGUIA", taskCount: 106 },
  { name: "David Ramirez Selva", taskCount: 76 },
];

// Mix: 12 LOAD (outbound) + 6 RECEIVE (inbound) = 18 active tasks at Bay 4 doors
export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 12, total: 18 },
  { label: "Inbound", count: 6, total: 18 },
];

export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 12, total: 18 },
  { label: "Inbound", count: 6, total: 18 },
];

// Schedule: facility-local 2026-10-14 (Wednesday).
// Inbound = receipts with appointmentTime on the day → 33 scheduled; received = receipts with receivedTime → 0 (0.0%).
// Outbound = loads with appointmentTime on the day bucket → 104 scheduled;
//     loaded = load status LOADED or SHIPPED → 11 (10.6%)
export const scheduleAvailable = true;
export const scheduledInboundOrders = 33;
export const scheduledInboundReceived = 0;
export const scheduledOutboundOrders = 104;
export const scheduledOutboundLoaded = 11;
export const pctScheduledInboundReceived = scheduledInboundOrders > 0 ? (scheduledInboundReceived / scheduledInboundOrders) * 100 : 0; // 0.0%
export const pctScheduledOutboundLoaded = scheduledOutboundOrders > 0 ? (scheduledOutboundLoaded / scheduledOutboundOrders) * 100 : 0;   // 10.6%

// Facility-wide appointment context — unavailable
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 0;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime
export const doorDurationsAvailable = true;

// Active task records from fresh WISE data (2026-10-14T16:10:58Z snapshot)
// 18 active tasks: 12 LOAD (outbound) + 6 RECEIVE (inbound)
export const assignments: TaskRecord[] = [
  { taskId: "TASK-5090739", dns: "RECEIVE IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (357d 19h 49m) \u26a0 STALE", assignee: "daira gonzalez", door: "DOCK50" },
  { taskId: "TASK-5391985", dns: "RECEIVE IN_PROGRESS", customer: "KARAKA, LLC", pieces: "IN_PROGRESS (1d 21h 51m)", assignee: "ARNULFO MUNGUIA", door: "DOCK50" },
  { taskId: "TASK-5393782", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (17h 36m)", assignee: "ARNULFO MUNGUIA", door: "DOCK51" },
  { taskId: "TASK-5392751", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (1d 12h 5m)", assignee: "JESUS ESPINOZA", door: "DOCK52" },
  { taskId: "TASK-5389637", dns: "RECEIVE IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (5d 22h 16m)", assignee: "RUFINO MUNGUIA", door: "DOCK53" },
  { taskId: "TASK-5393918", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (14h 8m)", assignee: "EDUARDO MEJIA", door: "DOCK53" },
  { taskId: "TASK-5338695", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (67d 16h 41m) \u26a0 STALE", assignee: "ARNULFO MUNGUIA", door: "DOCK54" },
  { taskId: "TASK-5393866", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (16h 30m)", assignee: "EDUARDO MEJIA", door: "DOCK54" },
  { taskId: "TASK-5393281", dns: "RECEIVE NEW", customer: "KARAKA, LLC", pieces: "NEW \u2014 not started", assignee: "ARNULFO MUNGUIA", door: "DOCK55" },
  { taskId: "TASK-5392752", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (1d 11h 24m)", assignee: "JESUS ESPINOZA", door: "DOCK56" },
  { taskId: "TASK-5392753", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (1d 11h 22m)", assignee: "EDUARDO MEJIA", door: "DOCK57" },
  { taskId: "TASK-5393812", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (15h 3m)", assignee: "EDUARDO MEJIA", door: "DOCK58" },
  { taskId: "TASK-5393915", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (14h 30m)", assignee: "EDUARDO MEJIA", door: "DOCK60" },
  { taskId: "TASK-5394178", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (0h 24m)", assignee: "DANIEL BELTRAN", door: "DOCK60" },
  { taskId: "TASK-5393820", dns: "RECEIVE IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (17h 9m)", assignee: "JORGE ARMANDO DUENAS", door: "DOCK62" },
  { taskId: "TASK-5381972", dns: "RECEIVE NEW", customer: "GURUNANDA, LLC", pieces: "NEW \u2014 not started", assignee: "Jorge Antonio Franco", door: "DOCK69" },
  { taskId: "TASK-5393920", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (14h 0m)", assignee: "EDUARDO MEJIA", door: "DOCK69" },
  { taskId: "TASK-5393921", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (14h 2m)", assignee: "EDUARDO MEJIA", door: "DOCK70" },
];
