/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 *
 * TASK DATA: Refreshed 2026-09-22 07:48 PT (live WISE/WMS APIs, read-only)
 *   Sources:
 *     - /wms-bam/wms-location/search-by-paging        — resolved DOCK50–DOCK72 → location IDs (23 doors)
 *     - /wms-bam/outbound/load-task/search-by-paging  — active load tasks (statuses NEW + IN_PROGRESS, dockId filter, per door)
 *     - /wms-bam/inbound/receive-task/search-by-paging— active receive tasks (statuses NEW + IN_PROGRESS, dockId filter, per door)
 *     - /wms-bam/inbound/receipt/search-by-paging     — scheduled inbounds (appointmentTime 2026-09-22 local day)
 *     - /wms-bam/outbound/load/search-by-paging       — scheduled outbounds (appointmentTime 2026-09-22 local day)
 *     - /wms-bam/task/general-task/search-by-paging   — facility general-task sweep (115 tasks) for the named Assigned Activity
 *     - assigneeUserName / dockName fields on task records — assignee + door labels
 *   Customer names resolved live from org master (customerName on load/receipt records):
 *     ORG-655875 → GURUNANDA, LLC / ORG-585450 → KARAKA, LLC / ORG-798965 → LIFEPRO FITNESS LLC.
 *
 *   Door-id map: DOCK50=570 DOCK51=554 DOCK52=556 DOCK53=552 DOCK54=564 DOCK55=560 DOCK56=575
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
// Duration = as-of 2026-09-22 07:48 PT minus the earliest IN_PROGRESS task startTime on the door.
// anomaly = the door carries an IN_PROGRESS task whose endTime is already set (ended but never closed).
export const doors: DoorRecord[] = [
  // ─── OCCUPIED — doors with IN_PROGRESS tasks (7 doors) ───
  { door: "DOCK50", status: "Occupied", assignee: "JOSE MORALES / daira gonzalez", customer: "GURUNANDA, LLC / ORG-798965", taskIds: ["TASK-5373019", "TASK-5090739"], duration: "336d 1h 26m", anomaly: true },
  { door: "DOCK51", status: "Occupied", assignee: "ARNULFO MUNGUIA", customer: "GURUNANDA, LLC", taskIds: ["TASK-5373035"], duration: "1d 1h 25m", anomaly: false },
  { door: "DOCK52", status: "Occupied", assignee: "ARNULFO MUNGUIA", customer: "GURUNANDA, LLC", taskIds: ["TASK-5372912"], duration: "1d 3h 53m", anomaly: false },
  { door: "DOCK53", status: "Occupied", assignee: "DANIEL BELTRAN", customer: "GURUNANDA, LLC", taskIds: ["TASK-5373472"], duration: "0d 22h 52m", anomaly: false },
  { door: "DOCK54", status: "Occupied", assignee: "ARNULFO MUNGUIA", customer: "GURUNANDA, LLC", taskIds: ["TASK-5365421", "TASK-5338695"], duration: "45d 22h 18m", anomaly: true },
  { door: "DOCK62", status: "Occupied", assignee: "ARNULFO MUNGUIA", customer: "GURUNANDA, LLC", taskIds: ["TASK-5365814"], duration: "8d 0h 3m", anomaly: false },
  { door: "DOCK72", status: "Occupied", assignee: "DANIELA GONZALEZ", customer: "GURUNANDA, LLC", taskIds: ["TASK-5373531"], duration: "0d 20h 46m", anomaly: false },

  // ─── RESERVED — doors with only NEW tasks (2 doors) ───
  { door: "DOCK55", status: "Reserved", assignee: "ARNULFO MUNGUIA / RUFINO MUNGUIA", customer: "GURUNANDA, LLC / KARAKA, LLC", taskIds: ["TASK-5373122", "TASK-5371830", "TASK-5368665"], duration: null, anomaly: false },
  { door: "DOCK56", status: "Reserved", assignee: "ARNULFO MUNGUIA", customer: "KARAKA, LLC", taskIds: ["TASK-5369120"], duration: null, anomaly: false },

  // ─── AVAILABLE — no active tasks (14 doors) ───
  { door: "DOCK57", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK58", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK59", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
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

// Active assignee task counts — Bay 4 DOCK50-DOCK72, task-level assignee mapping (13 tasks)
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 8 },
  { name: "JOSE MORALES", taskCount: 1 },
  { name: "daira gonzalez", taskCount: 1 },
  { name: "DANIEL BELTRAN", taskCount: 1 },
  { name: "RUFINO MUNGUIA", taskCount: 1 },
  { name: "DANIELA GONZALEZ", taskCount: 1 },
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

// Mix: 6 LOAD (outbound) + 7 RECEIVE (inbound) = 13 active tasks at Bay 4 doors
export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 6, total: 13 },
  { label: "Inbound", count: 7, total: 13 },
];

export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 6, total: 13 },
  { label: "Inbound", count: 7, total: 13 },
];

// Schedule: facility-local 2026-09-22 (Tuesday). Inbound = receipts with appointmentTime on the day;
// received = receipt status CLOSED. Outbound = loads with appointmentTime on the day; loaded = LOADED or SHIPPED.
//
// Exact query contract (read-only):
//   receipts: POST /wms-bam/inbound/receipt/search-by-paging
//             { appointmentTimeFrom: "2026-09-22T00:00:00", appointmentTimeTo: "2026-09-22T23:59:59" }
//             → the server honors BOTH bounds; the day cohort is the returned totalCount (31).
//   loads:    POST /wms-bam/outbound/load/search-by-paging
//             { appointmentTimeFrom: "2026-09-22T00:00:00" }   // server honors the lower bound only
//             → the day cohort is derived by date-window subtraction (see below).
//   header:   item-time-zone: America/Los_Angeles  → the appointment day is the FACILITY-LOCAL (PT) day.
//
// Result: 31 receipts carry a Sep 22 facility-local appointment (received = 0 CLOSED → 0.0%).
//   Outbound day cohort = count(appointmentTime ≥ day 00:00) − count(appointmentTime ≥ next day 00:00)
//                       = 328 − 223 = 105 loads; loaded = 4 − 2 = 2 (LOADED + SHIPPED) → 1.9%.
export const scheduleAvailable = true;
export const scheduledInboundOrders = 31;
export const scheduledInboundReceived = 0;
export const scheduledOutboundOrders = 105;
export const scheduledOutboundLoaded = 2;
export const pctScheduledInboundReceived = (0 / 31) * 100;
export const pctScheduledOutboundLoaded = (2 / 105) * 100;

// Facility-wide appointment context — unavailable
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 0;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime
export const doorDurationsAvailable = true;

// Active task records from fresh WISE data (2026-09-22 07:48 PT)
// 13 active tasks: 6 LOAD (outbound) + 7 RECEIVE (inbound)
export const assignments: TaskRecord[] = [
  { taskId: "TASK-5373019", dns: "LOAD IN_PROGRESS", customer: "ORG-798965", pieces: "IN_PROGRESS (0d 20h 26m)", assignee: "JOSE MORALES", door: "DOCK50" },
  { taskId: "TASK-5090739", dns: "RECEIVE IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (335d 18h 26m) \u26a0 STALE", assignee: "daira gonzalez", door: "DOCK50" },
  { taskId: "TASK-5373035", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (0d 18h 25m)", assignee: "ARNULFO MUNGUIA", door: "DOCK51" },
  { taskId: "TASK-5372912", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (0d 20h 53m)", assignee: "ARNULFO MUNGUIA", door: "DOCK52" },
  { taskId: "TASK-5373472", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (0d 15h 51m)", assignee: "DANIEL BELTRAN", door: "DOCK53" },
  { taskId: "TASK-5365421", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (10d 22h 15m) \u26a0 STALE", assignee: "ARNULFO MUNGUIA", door: "DOCK54" },
  { taskId: "TASK-5338695", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (45d 15h 18m) \u26a0 STALE", assignee: "ARNULFO MUNGUIA", door: "DOCK54" },
  { taskId: "TASK-5373122", dns: "RECEIVE NEW", customer: "KARAKA, LLC", pieces: "NEW \u2014 not started", assignee: "ARNULFO MUNGUIA", door: "DOCK55" },
  { taskId: "TASK-5371830", dns: "RECEIVE NEW", customer: "GURUNANDA, LLC", pieces: "NEW \u2014 not started", assignee: "RUFINO MUNGUIA", door: "DOCK55" },
  { taskId: "TASK-5368665", dns: "RECEIVE NEW", customer: "KARAKA, LLC", pieces: "NEW \u2014 not started", assignee: "ARNULFO MUNGUIA", door: "DOCK55" },
  { taskId: "TASK-5369120", dns: "RECEIVE NEW", customer: "KARAKA, LLC", pieces: "NEW \u2014 not started", assignee: "ARNULFO MUNGUIA", door: "DOCK56" },
  { taskId: "TASK-5365814", dns: "RECEIVE IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (7d 17h 3m)", assignee: "ARNULFO MUNGUIA", door: "DOCK62" },
  { taskId: "TASK-5373531", dns: "RECEIVE IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (0d 13h 46m)", assignee: "DANIELA GONZALEZ", door: "DOCK72" },
];
