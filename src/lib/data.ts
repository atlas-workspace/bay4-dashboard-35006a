/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 *
 * TASK DATA: Refreshed Oct 10 08:01 PT (live WISE/WMS APIs, read-only)
 *   Sources:
 *     - /wms-bam/wms-location/search-by-paging        — resolved DOCK50–DOCK72 → location IDs (23 doors, re-verified)
 *     - /wms-bam/outbound/load-task/search-by-paging  — active load tasks (status NEW + IN_PROGRESS, dockId filter)
 *     - /wms-bam/inbound/receive-task/search-by-paging— active receive tasks (status NEW + IN_PROGRESS, dockId filter)
 *     - /wms-bam/inbound/receipt/search-by-paging     — scheduled inbounds (appointmentTime on the 2026-10-10 facility-local PT day)
 *     - /wms-bam/outbound/load/search-by-paging       — scheduled outbounds (appointmentTime bucket for the 2026-10-10 PT day)
 *     - /wms-bam/task/general-task/search-by-paging   — facility general-task sweep (120 tasks) for the named Assigned Activity
 *   item-time-zone: America/Los_Angeles → appointment-day buckets are the FACILITY-LOCAL (PT) day.
 *
 *   SNAPSHOT INSTANT: 2026-10-10T15:01:55Z (Oct 10 08:01 PT).
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
// Duration = as-of 2026-10-10T15:01:55Z minus the earliest IN_PROGRESS task startTime on the door.
// anomaly = the door carries an IN_PROGRESS task whose endTime is already set (ended but never closed).
export const doors: DoorRecord[] = [
  // ─── OCCUPIED — doors with IN_PROGRESS tasks (8 doors) ───
  { door: "DOCK50", status: "Occupied", assignee: "ARNULFO MUNGUIA / daira gonzalez", customer: "GURUNANDA, LLC", taskIds: ["TASK-5090739", "TASK-5389467", "TASK-5390717"], duration: "353d 18h 40m", anomaly: true },
  { door: "DOCK51", status: "Occupied", assignee: "ARNULFO MUNGUIA / DANIEL BELTRAN", customer: "GURUNANDA, LLC", taskIds: ["TASK-5381268", "TASK-5389973"], duration: "10d 16h 35m", anomaly: false },
  { door: "DOCK52", status: "Occupied", assignee: "DANIEL BELTRAN / JULIO CESAR Alvarado", customer: "GURUNANDA, LLC / ORG-40858", taskIds: ["TASK-5389140", "TASK-5390984"], duration: "17h 38m", anomaly: false },
  { door: "DOCK53", status: "Occupied", assignee: "ARNULFO MUNGUIA / EDUARDO MEJIA / RUFINO MUNGUIA", customer: "GURUNANDA, LLC", taskIds: ["TASK-5389422", "TASK-5389637", "TASK-5390119"], duration: "1d 23h 24m", anomaly: false },
  { door: "DOCK54", status: "Occupied", assignee: "ARNULFO MUNGUIA", customer: "GURUNANDA, LLC", taskIds: ["TASK-5338695"], duration: "63d 15h 32m", anomaly: true },
  { door: "DOCK56", status: "Occupied", assignee: "EDUARDO MEJIA", customer: "GURUNANDA, LLC", taskIds: ["TASK-5390124"], duration: "1d 11h 54m", anomaly: false },
  { door: "DOCK57", status: "Occupied", assignee: "PEDRO AVILA", customer: "GURUNANDA, LLC", taskIds: ["TASK-5390129"], duration: "1d 11h 39m", anomaly: false },
  { door: "DOCK58", status: "Occupied", assignee: "ARNULFO MUNGUIA", customer: "GURUNANDA, LLC", taskIds: ["TASK-5390995"], duration: "16h 58m", anomaly: false },

  // ─── AVAILABLE — no active tasks (15 doors) ───
  { door: "DOCK55", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK59", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK60", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK61", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK62", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK63", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK64", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK65", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK66", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK67", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK68", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK69", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
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

// Active assignee task counts - Bay 4 DOCK50-DOCK72, task-level assignee mapping (16 tasks)
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 6 },
  { name: "DANIEL BELTRAN", taskCount: 2 },
  { name: "EDUARDO MEJIA", taskCount: 2 },
  { name: "JEROME ARANDA", taskCount: 1 },
  { name: "JULIO CESAR Alvarado", taskCount: 1 },
  { name: "Jorge Antonio Franco", taskCount: 1 },
  { name: "PEDRO AVILA", taskCount: 1 },
  { name: "RUFINO MUNGUIA", taskCount: 1 },
  { name: "daira gonzalez", taskCount: 1 },
];

// All-time CLOSED LOAD + RECEIVE task counts at Bay 4 doors, by assignee.
// Live WISE sweep (per-door, statuses CLOSED + FORCE_CLOSED): 4002 closed tasks
// (2936 LOAD / 1066 RECEIVE), 83 distinct assignees.
export const allTimeAssigneeSummaries: AssigneeSummary[] = [
  { name: "DANIEL BELTRAN", taskCount: 1037 },
  { name: "ARNULFO MUNGUIA", taskCount: 1019 },
  { name: "DANIELA GONZALEZ", taskCount: 427 },
  { name: "GEORGE LC BROWN", taskCount: 151 },
  { name: "RENATO ROSALES GARCIA", taskCount: 151 },
  { name: "Caren Cubides", taskCount: 147 },
  { name: "Fatima Ponce", taskCount: 126 },
  { name: "JULIO CESAR Alvarado", taskCount: 113 },
  { name: "MARTIN MUNGUIA", taskCount: 106 },
  { name: "David Ramirez Selva", taskCount: 76 },
];

// Mix: 11 LOAD (outbound) + 5 RECEIVE (inbound) = 16 active tasks at Bay 4 doors
export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 11, total: 16 },
  { label: "Inbound", count: 5, total: 16 },
];

export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 11, total: 16 },
  { label: "Inbound", count: 5, total: 16 },
];

// Schedule: facility-local 2026-10-10 (Saturday).
// Inbound = receipts with appointmentTime on the day → 2 scheduled; received = receipts with receivedTime → 0 (0.0%).
// Outbound = loads with appointmentTime on the day bucket → 0 scheduled;
//     loaded = load status LOADED or SHIPPED → 0 (0.0%)
export const scheduleAvailable = true;
export const scheduledInboundOrders = 2;
export const scheduledInboundReceived = 0;
export const scheduledOutboundOrders = 0;
export const scheduledOutboundLoaded = 0;
export const pctScheduledInboundReceived = scheduledInboundOrders > 0 ? (scheduledInboundReceived / scheduledInboundOrders) * 100 : 0; // 0.0%
export const pctScheduledOutboundLoaded = scheduledOutboundOrders > 0 ? (scheduledOutboundLoaded / scheduledOutboundOrders) * 100 : 0;   // 0.0%

// Facility-wide appointment context — unavailable
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 0;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime
export const doorDurationsAvailable = true;

// Active task records from fresh WISE data (2026-10-10T15:01:55Z snapshot)
// 16 active tasks: 11 LOAD (outbound) + 5 RECEIVE (inbound)
export const assignments: TaskRecord[] = [
  { taskId: "TASK-5090739", dns: "RECEIVE IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (353d 18h 40m) \u26a0 STALE", assignee: "daira gonzalez", door: "DOCK50" },
  { taskId: "TASK-5389467", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (1d 22h 54m)", assignee: "ARNULFO MUNGUIA", door: "DOCK50" },
  { taskId: "TASK-5390717", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (20h 24m)", assignee: "ARNULFO MUNGUIA", door: "DOCK50" },
  { taskId: "TASK-5381268", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (10d 16h 35m)", assignee: "ARNULFO MUNGUIA", door: "DOCK51" },
  { taskId: "TASK-5389973", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (1d 17h 11m)", assignee: "DANIEL BELTRAN", door: "DOCK51" },
  { taskId: "TASK-5389140", dns: "RECEIVE NEW", customer: "ORG-40858", pieces: "NEW \u2014 not started", assignee: "JULIO CESAR Alvarado", door: "DOCK52" },
  { taskId: "TASK-5390984", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (17h 38m)", assignee: "DANIEL BELTRAN", door: "DOCK52" },
  { taskId: "TASK-5389422", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (1d 23h 24m)", assignee: "ARNULFO MUNGUIA", door: "DOCK53" },
  { taskId: "TASK-5389637", dns: "RECEIVE IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (1d 21h 7m)", assignee: "RUFINO MUNGUIA", door: "DOCK53" },
  { taskId: "TASK-5390119", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (1d 11h 45m)", assignee: "EDUARDO MEJIA", door: "DOCK53" },
  { taskId: "TASK-5338695", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (63d 15h 32m) \u26a0 STALE", assignee: "ARNULFO MUNGUIA", door: "DOCK54" },
  { taskId: "TASK-5390124", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (1d 11h 54m)", assignee: "EDUARDO MEJIA", door: "DOCK56" },
  { taskId: "TASK-5390129", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (1d 11h 39m)", assignee: "PEDRO AVILA", door: "DOCK57" },
  { taskId: "TASK-5390995", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (16h 58m)", assignee: "ARNULFO MUNGUIA", door: "DOCK58" },
  { taskId: "TASK-5390273", dns: "RECEIVE NEW", customer: "GURUNANDA, LLC", pieces: "NEW \u2014 not started", assignee: "JEROME ARANDA", door: "DOCK66" },
  { taskId: "TASK-5381972", dns: "RECEIVE NEW", customer: "GURUNANDA, LLC", pieces: "NEW \u2014 not started", assignee: "Jorge Antonio Franco", door: "DOCK69" },
];
