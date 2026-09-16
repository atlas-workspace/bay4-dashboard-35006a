/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 *
 * TASK DATA: Refreshed 2026-09-16 14:57 PDT (live WISE/WMS APIs, read-only)
 *   Sources:
 *     - /wms-bam/wms-location/search          — resolved DOCK50–DOCK72 → location IDs (552–587)
 *     - /wms-bam/outbound/load-task/search    — active load tasks (status IN_PROGRESS + NEW) per dock
 *     - /wms-bam/inbound/receive-task/search  — active receive tasks (status IN_PROGRESS + NEW) per dock
 *     - /wms-bam/user/search-by-paging        — assignee names (assigneeUserId → firstName lastName)
 *     - /wms-bam/inbound/receipt/search-by-paging  — scheduled inbounds (appointmentTime = 2026-09-16)
 *     - /wms-bam/outbound/load/search-by-paging    — scheduled outbounds (appointmentTime = 2026-09-16)
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

// Door utilization — task-derived. "Occupied" = ≥1 IN_PROGRESS task;
// "Reserved" = only NEW tasks; "Available" = no active task.
// Duration = as-of 2026-09-16 14:57 PDT minus the earliest open IN_PROGRESS task startTime on the door.
export const doors: DoorRecord[] = [
  // ═══════════════════════════════════════════════════════════════
  // OCCUPIED — doors with IN_PROGRESS tasks (6 doors)
  // ═══════════════════════════════════════════════════════════════
  {
    door: "DOCK50",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA / daira gonzalez",
    customer: "GURUNANDA, LLC / KARAKA, LLC",
    taskIds: ["TASK-5368207", "TASK-5090739"],
    duration: "330d 01h 35m",
    anomaly: true,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5369859"],
    duration: "0h 06m",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA / CANDY MENDEZ",
    customer: "GURUNANDA, LLC / KARAKA, LLC",
    taskIds: ["TASK-5338695", "TASK-5364490", "TASK-5369031", "TASK-5369404"],
    duration: "39d 22h 27m",
    anomaly: true,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA / CANDY MENDEZ",
    customer: "GURUNANDA, LLC / KARAKA, LLC",
    taskIds: ["TASK-5369422", "TASK-5369120", "TASK-5369057"],
    duration: "3h 34m",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: "CANDY MENDEZ / EFREN SALVADOR",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5369743", "TASK-5369084"],
    duration: "1h 26m",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: "JORGE ANTONIO FRANCO",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5365814"],
    duration: "2d 00h 12m",
    anomaly: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // RESERVED — doors with only NEW tasks (3 doors)
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
    door: "DOCK58",
    status: "Reserved",
    assignee: "CANDY MENDEZ",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5369091"],
    duration: null,
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Reserved",
    assignee: "DANIEL BELTRAN",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5369826"],
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

// Active assignee task counts — Bay 4 DOCK50-DOCK72, task-level assignee mapping (16 tasks)
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 6 },
  { name: "CANDY MENDEZ", taskCount: 5 },
  { name: "EFREN SALVADOR", taskCount: 1 },
  { name: "DANIEL BELTRAN", taskCount: 1 },
  { name: "daira gonzalez", taskCount: 1 },
  { name: "JEROME ARANDA", taskCount: 1 },
  { name: "JORGE ANTONIO FRANCO", taskCount: 1 },
];

// PRIOR BASELINE — not regenerated in the 2026-09-16 refresh (no live all-time source pulled).
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

// Schedule: facility-local 2026-09-16. Inbound = receipts with appointmentTime on the day
// (/wms-bam/inbound/receipt/search-by-paging); received = receipt status CLOSED (receivedTime set).
// Outbound = loads with appointmentTime on the day (/wms-bam/outbound/load/search-by-paging);
// loaded = load status LOADED or SHIPPED.
export const scheduleAvailable = true;
export const scheduledInboundOrders = 49;
export const scheduledInboundReceived = 11;
export const scheduledOutboundOrders = 133;
export const scheduledOutboundLoaded = 65;
export const pctScheduledInboundReceived = (11 / 49) * 100;
export const pctScheduledOutboundLoaded = (65 / 133) * 100;

// Facility-wide appointment context — unavailable
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 0;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime
export const doorDurationsAvailable = true;

// Active task records from fresh WISE data (September 16, 2026 14:57 PDT)
// 16 active tasks: 4 LOAD (outbound) + 12 RECEIVE (inbound)
export const assignments: TaskRecord[] = [
  { taskId: "TASK-5368207", dns: "RECEIVE IN_PROGRESS", customer: "KARAKA, LLC", pieces: "IN_PROGRESS", assignee: "ARNULFO MUNGUIA", door: "DOCK50" },
  { taskId: "TASK-5090739", dns: "RECEIVE IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (330d 01h 35m) ⚠ STALE", assignee: "daira gonzalez", door: "DOCK50" },
  { taskId: "TASK-5369859", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (0h 06m)", assignee: "ARNULFO MUNGUIA", door: "DOCK53" },
  { taskId: "TASK-5338695", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (39d 22h 27m) ⚠ STALE", assignee: "ARNULFO MUNGUIA", door: "DOCK54" },
  { taskId: "TASK-5364490", dns: "RECEIVE IN_PROGRESS", customer: "KARAKA, LLC", pieces: "IN_PROGRESS", assignee: "ARNULFO MUNGUIA", door: "DOCK54" },
  { taskId: "TASK-5369031", dns: "RECEIVE NEW", customer: "GURUNANDA, LLC", pieces: "NEW — not started", assignee: "CANDY MENDEZ", door: "DOCK54" },
  { taskId: "TASK-5369404", dns: "RECEIVE NEW", customer: "GURUNANDA, LLC", pieces: "NEW — not started", assignee: "CANDY MENDEZ", door: "DOCK54" },
  { taskId: "TASK-5368665", dns: "RECEIVE NEW", customer: "KARAKA, LLC", pieces: "NEW — not started", assignee: "JEROME ARANDA", door: "DOCK55" },
  { taskId: "TASK-5369422", dns: "RECEIVE IN_PROGRESS", customer: "KARAKA, LLC", pieces: "IN_PROGRESS (3h 34m)", assignee: "ARNULFO MUNGUIA", door: "DOCK56" },
  { taskId: "TASK-5369120", dns: "RECEIVE NEW", customer: "KARAKA, LLC", pieces: "NEW — not started", assignee: "ARNULFO MUNGUIA", door: "DOCK56" },
  { taskId: "TASK-5369057", dns: "RECEIVE NEW", customer: "GURUNANDA, LLC", pieces: "NEW — not started", assignee: "CANDY MENDEZ", door: "DOCK56" },
  { taskId: "TASK-5369743", dns: "LOAD IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (1h 26m)", assignee: "EFREN SALVADOR", door: "DOCK57" },
  { taskId: "TASK-5369084", dns: "RECEIVE NEW", customer: "GURUNANDA, LLC", pieces: "NEW — not started", assignee: "CANDY MENDEZ", door: "DOCK57" },
  { taskId: "TASK-5369091", dns: "RECEIVE NEW", customer: "GURUNANDA, LLC", pieces: "NEW — not started", assignee: "CANDY MENDEZ", door: "DOCK58" },
  { taskId: "TASK-5369826", dns: "LOAD NEW", customer: "GURUNANDA, LLC", pieces: "NEW — not started", assignee: "DANIEL BELTRAN", door: "DOCK59" },
  { taskId: "TASK-5365814", dns: "RECEIVE IN_PROGRESS", customer: "GURUNANDA, LLC", pieces: "IN_PROGRESS (2d 00h 12m)", assignee: "JORGE ANTONIO FRANCO", door: "DOCK62" },
];
