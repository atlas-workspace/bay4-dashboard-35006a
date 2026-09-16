/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 *
 * TASK DATA: Refreshed 2026-09-16 ~10:05 PDT (live WISE/WMS APIs)
 *   Sources:
 *     - /wms-bam/outbound/load-task/search — active load tasks (status IN_PROGRESS + NEW)
 *     - /wms-bam/inbound/receive-task/search — active receive tasks (status IN_PROGRESS + NEW)
 *     - Assignee mapping resolved per-task via load-task + receive-task APIs
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

export interface KpiMetric {
  label: string;
  value: string;
  numerator: number;
  denominator: number;
  percentage: number;
}

export interface AssigneeSummary {
  name: string;
  taskCount: number;
}

export interface MixMetric {
  label: string;
  count: number;
  total: number;
}

export interface TaskRecord {
  taskId: string;
  dns: string;
  customer: string;
  pieces: string;
  assignee: string;
  door: string;
}

export const TOTAL_DOORS = 23;

// ─── Graza Dispatch Types (preserved for GrazaDispatchSummary component) ───
export interface GrazaDispatchRun {
  runLabel: string;
  time: string;
  runInfo: {
    date: string;
    facility: string;
    customer: string;
    assignee: string;
    totalOrdersFound: number;
  };
  plans: {
    planId: string;
    taskId: string;
    status: string;
    method: string;
    skipPackingScan: boolean;
    orderCount: number;
  }[];
  labelNoteOrders: {
    dn: string;
    planId: string;
    status: string;
    note: string;
  }[];
  exceptions: {
    dn: string;
    reason: string;
    action: string;
  }[];
  summary: {
    totalPlans: number;
    totalTasks: number;
    exceptions: number;
    issues: string[];
  };
}

export interface GrazaCombinedDispatchData {
  combinedSummary: {
    totalOrdersCovered: number;
    coveragePct: number;
    totalPlans: number;
    wavePlans: number;
    batchPlans: number;
    labelNotePlans: number;
    released: number;
    inProgress: number;
    failures: number;
    stuckPlans: number;
    unassignedTasks: number;
    exceptions: number;
  };
  runs: GrazaDispatchRun[];
}

export const doors: DoorRecord[] = [
  // ═══════════════════════════════════════════════════════════════
  // OCCUPIED — doors with IN_PROGRESS tasks (7 doors)
  // ═══════════════════════════════════════════════════════════════
  {
    door: "DOCK50",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA / daira gonzalez",
    customer: "KARAKA, LLC / GURUNANDA, LLC",
    taskIds: ["TASK-5368207", "TASK-5090739"],
    duration: "330d 03h 43m",
    anomaly: true,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5368697"],
    duration: "1d 01h 43m",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA / CANDY MENDEZ / JEROME ARANDA",
    customer: "GURUNANDA, LLC / KARAKA, LLC",
    taskIds: ["TASK-5338695", "TASK-5364490", "TASK-5369031", "TASK-5369275"],
    duration: "40d 00h 35m",
    anomaly: true,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA / CANDY MENDEZ",
    customer: "KARAKA, LLC / GURUNANDA, LLC",
    taskIds: ["TASK-5369135", "TASK-5369120", "TASK-5369057"],
    duration: "8h 07m",
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: "DANIELA GONZALEZ / CANDY MENDEZ",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5368714", "TASK-5369091"],
    duration: "23h 12m",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Occupied",
    assignee: "DANIEL BELTRAN",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5369265"],
    duration: "7h 04m",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: "JORGE ANTONIO FRANCO",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5365814"],
    duration: "2d 02h 20m",
    anomaly: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // RESERVED — doors with only NEW tasks (2 doors)
  // ═══════════════════════════════════════════════════════════════
  {
    door: "DOCK55",
    status: "Reserved",
    assignee: "JEROME ARANDA",
    customer: "KARAKA, LLC",
    taskIds: ["TASK-5368665"],
    duration: null,
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Reserved",
    assignee: "CANDY MENDEZ",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5369084"],
    duration: null,
    anomaly: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // AVAILABLE — no active tasks (14 doors)
  // ═══════════════════════════════════════════════════════════════
  { door: "DOCK51", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK52", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
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

const occupied = doors.filter((d) => d.status === "Occupied").length;
const reserved = doors.filter((d) => d.status === "Reserved").length;
const available = doors.filter((d) => d.status === "Available").length;
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length;

export const kpiMetrics: KpiMetric[] = [
  {
    label: "Doors w/ Active Tasks",
    value: `${doorsWithTasks}/23`,
    numerator: doorsWithTasks,
    denominator: TOTAL_DOORS,
    percentage: (doorsWithTasks / TOTAL_DOORS) * 100,
  },
  {
    label: "In Progress (Occupied)",
    value: `${occupied}`,
    numerator: occupied,
    denominator: TOTAL_DOORS,
    percentage: (occupied / TOTAL_DOORS) * 100,
  },
  {
    label: "Doors Available",
    value: `${available}`,
    numerator: available,
    denominator: TOTAL_DOORS,
    percentage: (available / TOTAL_DOORS) * 100,
  },
  {
    label: "Task Occupancy Rate",
    value: `${((doorsWithTasks / TOTAL_DOORS) * 100).toFixed(1)}%`,
    numerator: doorsWithTasks,
    denominator: TOTAL_DOORS,
    percentage: (doorsWithTasks / TOTAL_DOORS) * 100,
  },
];

// Active assignee task counts — based on Bay 4 DOCK50-DOCK72 task-level assignee mapping
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 6 },
  { name: "CANDY MENDEZ", taskCount: 4 },
  { name: "JEROME ARANDA", taskCount: 2 },
  { name: "DANIELA GONZALEZ", taskCount: 1 },
  { name: "DANIEL BELTRAN", taskCount: 1 },
  { name: "daira gonzalez", taskCount: 1 },
  { name: "JORGE ANTONIO FRANCO", taskCount: 1 },
];

// All-time assignment counts — preserved from prior baseline
export const allTimeAssigneeSummaries: AssigneeSummary[] = [
  { name: "Arnulfo Munguia (89)", taskCount: 110 },
  { name: "Daniel Beltran", taskCount: 90 },
  { name: "Caren Cubides", taskCount: 3 },
  { name: "Daniela Gonzalez", taskCount: 1 },
  { name: "Fatima Ponce", taskCount: 1 },
  { name: "Nanci Viviana Rosas", taskCount: 1 },
  { name: "Rufino Munguia", taskCount: 1 },
];

// Mix: 4 LOAD (outbound) + 12 RECEIVE (inbound) = 16 active tasks at Bay 4 doors
export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 4, total: 16 },
  { label: "Inbound", count: 12, total: 16 },
];

export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 4, total: 16 },
  { label: "Inbound", count: 12, total: 16 },
];

// Schedule: facility-local 2026-09-16 day. Outbound load search binds
// appointmentTimePeriod as ["2026-09-16T00:00:00", "2026-09-16T23:59:59"].
export const scheduleAvailable = true;
export const scheduledInboundOrders = 41;
export const scheduledOutboundOrders = 131;
export const scheduledInboundReceived = 0;
export const scheduledOutboundLoaded = 16;
export const pctScheduledInboundReceived = (0 / 41) * 100;
export const pctScheduledOutboundLoaded = (16 / 131) * 100;

// Facility-wide appointment context — unavailable
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 0;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime
export const doorDurationsAvailable = true;

// Active task records from fresh WISE data (September 16, 2026 ~10:05 PDT)
// 16 active tasks: 4 LOAD (outbound) + 12 RECEIVE (inbound)
export const assignments: TaskRecord[] = [
  { taskId: "TASK-5368207", dns: "RECEIVE IN_PROGRESS", customer: "KARAKA, LLC", pieces: "IN_PROGRESS (1d 05h 39m)", assignee: "ARNULFO MUNGUIA", door: "DOCK50" },
  { taskId: "TASK-5090739", dns: "RECEIVE IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (330d 03h 43m) ⚠ STALE", assignee: "daira gonzalez", door: "DOCK50" },
  { taskId: "TASK-5368697", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (1d 01h 43m)", assignee: "ARNULFO MUNGUIA", door: "DOCK53" },
  { taskId: "TASK-5338695", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (40d 00h 35m) ⚠ STALE", assignee: "ARNULFO MUNGUIA", door: "DOCK54" },
  { taskId: "TASK-5364490", dns: "RECEIVE IN_PROGRESS", customer: "KARAKA, LLC", pieces: "IN_PROGRESS (1d 00h 41m)", assignee: "ARNULFO MUNGUIA", door: "DOCK54" },
  { taskId: "TASK-5369031", dns: "RECEIVE NEW", customer: "GURUNANDA, LLC", pieces: "NEW — not started", assignee: "CANDY MENDEZ", door: "DOCK54" },
  { taskId: "TASK-5369275", dns: "LOAD NEW", customer: "KARAKA, LLC", pieces: "NEW — not started", assignee: "JEROME ARANDA", door: "DOCK54" },
  { taskId: "TASK-5368665", dns: "RECEIVE NEW", customer: "KARAKA, LLC", pieces: "NEW — not started", assignee: "JEROME ARANDA", door: "DOCK55" },
  { taskId: "TASK-5369135", dns: "RECEIVE IN_PROGRESS", customer: "KARAKA, LLC", pieces: "IN_PROGRESS (8h 07m)", assignee: "ARNULFO MUNGUIA", door: "DOCK56" },
  { taskId: "TASK-5369120", dns: "RECEIVE NEW", customer: "KARAKA, LLC", pieces: "NEW — not started", assignee: "ARNULFO MUNGUIA", door: "DOCK56" },
  { taskId: "TASK-5369057", dns: "RECEIVE NEW", customer: "GURUNANDA, LLC", pieces: "NEW — not started", assignee: "CANDY MENDEZ", door: "DOCK56" },
  { taskId: "TASK-5369084", dns: "RECEIVE NEW", customer: "GURUNANDA, LLC", pieces: "NEW — not started", assignee: "CANDY MENDEZ", door: "DOCK57" },
  { taskId: "TASK-5369091", dns: "RECEIVE NEW", customer: "GURUNANDA, LLC", pieces: "NEW — not started", assignee: "CANDY MENDEZ", door: "DOCK58" },
  { taskId: "TASK-5368714", dns: "RECEIVE IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (23h 12m)", assignee: "DANIELA GONZALEZ", door: "DOCK58" },
  { taskId: "TASK-5369265", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (7h 04m)", assignee: "DANIEL BELTRAN", door: "DOCK59" },
  { taskId: "TASK-5365814", dns: "RECEIVE IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (2d 02h 20m)", assignee: "JORGE ANTONIO FRANCO", door: "DOCK62" },
];
