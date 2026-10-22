/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 *
 * TASK DATA: Refreshed Oct 22 07:22 PT (live WISE/WMS APIs, read-only)
 *   Sources:
 *     - /wms-bam/wms-location/search-by-paging        — resolved DOCK50–DOCK72 → location IDs (23 doors, re-verified)
 *     - /wms-bam/outbound/load-task/search-by-paging  — active load tasks (status NEW + IN_PROGRESS + EXCEPTION, dockId filter)
 *     - /wms-bam/inbound/receive-task/search-by-paging— active receive tasks (status NEW + IN_PROGRESS + EXCEPTION, dockId filter)
 *     - /wms-bam/inbound/receipt/search-by-paging     — scheduled inbounds (appointmentTime on the 2026-10-22 facility-local PT day)
 *     - /wms-bam/outbound/load/search-by-paging       — scheduled outbounds (appointmentTime bucket for the 2026-10-22 PT day)
 *     - /wms-bam/task/general-task/search-by-paging   — facility general-task sweep (123 tasks) for the named Assigned Activity
 *   item-time-zone: America/Los_Angeles → appointment-day buckets are the FACILITY-LOCAL (PT) day.
 *
 *   SNAPSHOT INSTANT: 2026-10-22T14:22:39Z (Oct 22 07:22 PT).
 *   Scope: tenant LT, facility LT_F1 (x-facility-id: LT_F1).
 *   Open / active = NEW + IN_PROGRESS. Door duration = snapshot instant − earliest IN_PROGRESS startTime on the door.
 *
 *   NOTE on timestamps: load-task/receive-task return task start/end timestamps in UTC; durations below are
 *   aged from those UTC start times to the UTC snapshot instant above.
 *
 *   Door-id map (re-verified this pull): 570=DOCK50 554=DOCK51 556=DOCK52 552=DOCK53 564=DOCK54 560=DOCK55 575=DOCK56 563=DOCK57 572=DOCK58 571=DOCK59 565=DOCK60 567=DOCK61 566=DOCK62 568=DOCK63 559=DOCK64 573=DOCK65 576=DOCK66 577=DOCK67 574=DOCK68 578=DOCK69 579=DOCK70 580=DOCK71 587=DOCK72.
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
// Duration = as-of 2026-10-22T14:22:39Z minus the earliest IN_PROGRESS task startTime on the door.
// anomaly = the door carries an IN_PROGRESS task whose endTime is already set (ended but never closed).
export const doors: DoorRecord[] = [
  // ─── OCCUPIED — doors with IN_PROGRESS tasks (6 doors) ───
  { door: "DOCK50", status: "Occupied", assignee: "daira gonzalez", customer: "GURUNANDA, LLC", taskIds: ["TASK-5090739"], duration: "365d 18h 1m", anomaly: true },
  { door: "DOCK51", status: "Occupied", assignee: "ARNULFO MUNGUIA", customer: "GURUNANDA, LLC", taskIds: ["TASK-5400283"], duration: "15h 56m", anomaly: false },
  { door: "DOCK52", status: "Occupied", assignee: "ARNULFO MUNGUIA", customer: "GURUNANDA, LLC", taskIds: ["TASK-5400327"], duration: "15h 8m", anomaly: false },
  { door: "DOCK54", status: "Occupied", assignee: "ARNULFO MUNGUIA", customer: "GURUNANDA, LLC / KARAKA, LLC", taskIds: ["TASK-5338695", "TASK-5399772", "TASK-5400183"], duration: "75d 14h 53m", anomaly: true },
  { door: "DOCK55", status: "Occupied", assignee: "ARNULFO MUNGUIA", customer: "KARAKA, LLC", taskIds: ["TASK-5399134"], duration: "1d 17h 13m", anomaly: false },
  { door: "DOCK66", status: "Occupied", assignee: "Jorge Antonio Franco", customer: "GURUNANDA, LLC", taskIds: ["TASK-5400090"], duration: "18h 35m", anomaly: false },

  // ─── RESERVED / AVAILABLE — no IN_PROGRESS task (17 doors) ───
  { door: "DOCK53", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK56", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK57", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK58", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK59", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK60", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK61", status: "Reserved", assignee: "DANIELA GONZALEZ", customer: "GURUNANDA, LLC", taskIds: ["TASK-5400354"], duration: null, anomaly: false },
  { door: "DOCK62", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK63", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK64", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK65", status: "Reserved", assignee: "ARNULFO MUNGUIA", customer: "KARAKA, LLC", taskIds: ["TASK-5396301"], duration: null, anomaly: false },
  { door: "DOCK67", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK68", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK69", status: "Reserved", assignee: "Jorge Antonio Franco", customer: "GURUNANDA, LLC", taskIds: ["TASK-5381972"], duration: null, anomaly: false },
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
  { name: "Jorge Antonio Franco", taskCount: 2 },
  { name: "DANIELA GONZALEZ", taskCount: 1 },
  { name: "daira gonzalez", taskCount: 1 },
];

// All-time CLOSED LOAD + RECEIVE task counts at Bay 4 doors, by assignee.
// Live WISE sweep (per-door, statuses CLOSED + FORCE_CLOSED): 4166 closed tasks
// (3056 LOAD / 1110 RECEIVE), 84 distinct assignees.
export const allTimeAssigneeSummaries: AssigneeSummary[] = [
  { name: "DANIEL BELTRAN", taskCount: 1083 },
  { name: "ARNULFO MUNGUIA", taskCount: 1076 },
  { name: "DANIELA GONZALEZ", taskCount: 449 },
  { name: "GEORGE LC BROWN", taskCount: 151 },
  { name: "RENATO ROSALES GARCIA", taskCount: 151 },
  { name: "Caren Cubides", taskCount: 147 },
  { name: "Fatima Ponce", taskCount: 141 },
  { name: "JULIO CESAR Alvarado", taskCount: 113 },
  { name: "MARTIN MUNGUIA", taskCount: 106 },
  { name: "David Ramirez Selva", taskCount: 76 },
];

// Mix: 4 LOAD (outbound) + 7 RECEIVE (inbound) = 11 active tasks at Bay 4 doors
export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 4, total: 11 },
  { label: "Inbound", count: 7, total: 11 },
];

export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 4, total: 11 },
  { label: "Inbound", count: 7, total: 11 },
];

// Schedule: facility-local 2026-10-22.
// Inbound = receipts with appointmentTime on the day → 23 scheduled; received = receipts with receivedTime → 0 (0.0%).
// Outbound = loads with appointmentTime on the day bucket → 136 scheduled;
//     loaded = load status LOADED or SHIPPED → 0 (0.0%)
export const scheduleAvailable = true;
export const scheduledInboundOrders = 23;
export const scheduledInboundReceived = 0;
export const scheduledOutboundOrders = 136;
export const scheduledOutboundLoaded = 0;
export const pctScheduledInboundReceived = scheduledInboundOrders > 0 ? (scheduledInboundReceived / scheduledInboundOrders) * 100 : 0;
export const pctScheduledOutboundLoaded = scheduledOutboundOrders > 0 ? (scheduledOutboundLoaded / scheduledOutboundOrders) * 100 : 0;

// Facility-wide appointment context — unavailable
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 0;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime
export const doorDurationsAvailable = true;

// Active task records from fresh WISE data (2026-10-22T14:22:39Z snapshot)
// 11 active tasks: 4 LOAD (outbound) + 7 RECEIVE (inbound)
export const assignments: TaskRecord[] = [
  { taskId: "TASK-5090739", dns: "RECEIVE IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (365d 18h 1m) ⚠ STALE", assignee: "daira gonzalez", door: "DOCK50" },
  { taskId: "TASK-5400283", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (15h 56m)", assignee: "ARNULFO MUNGUIA", door: "DOCK51" },
  { taskId: "TASK-5400327", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (15h 8m)", assignee: "ARNULFO MUNGUIA", door: "DOCK52" },
  { taskId: "TASK-5338695", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (75d 14h 53m) ⚠ STALE", assignee: "ARNULFO MUNGUIA", door: "DOCK54" },
  { taskId: "TASK-5399772", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (21h 41m)", assignee: "ARNULFO MUNGUIA", door: "DOCK54" },
  { taskId: "TASK-5400183", dns: "RECEIVE NEW", customer: "KARAKA, LLC", pieces: "NEW — not started", assignee: "ARNULFO MUNGUIA", door: "DOCK54" },
  { taskId: "TASK-5399134", dns: "RECEIVE IN_PROGRESS", customer: "KARAKA, LLC", pieces: "IN_PROGRESS (1d 17h 13m)", assignee: "ARNULFO MUNGUIA", door: "DOCK55" },
  { taskId: "TASK-5400354", dns: "RECEIVE NEW", customer: "GURUNANDA, LLC", pieces: "NEW — not started", assignee: "DANIELA GONZALEZ", door: "DOCK61" },
  { taskId: "TASK-5396301", dns: "RECEIVE NEW", customer: "KARAKA, LLC", pieces: "NEW — not started", assignee: "ARNULFO MUNGUIA", door: "DOCK65" },
  { taskId: "TASK-5400090", dns: "RECEIVE IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (18h 35m)", assignee: "Jorge Antonio Franco", door: "DOCK66" },
  { taskId: "TASK-5381972", dns: "RECEIVE NEW", customer: "GURUNANDA, LLC", pieces: "NEW — not started", assignee: "Jorge Antonio Franco", door: "DOCK69" },
];
