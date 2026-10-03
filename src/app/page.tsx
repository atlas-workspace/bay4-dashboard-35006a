import {
  doors,
  kpiMetrics,
  assigneeSummaries,
  allTimeAssigneeSummaries,
  inboundOutboundMix,
  scheduleAvailable,
  scheduledInboundReceived,
  scheduledInboundOrders,
  scheduledOutboundLoaded,
  scheduledOutboundOrders,
  pctScheduledInboundReceived,
  pctScheduledOutboundLoaded,
  assignments,
} from "@/lib/data";
import KpiCard from "@/components/KpiCard";
import DoorGrid from "@/components/DoorGrid";
import AssigneeSummaryList from "@/components/AssigneeSummary";
import OperationalMetrics from "@/components/OperationalMetrics";
import AssignmentHistory from "@/components/AssignmentHistory";

const ACCENT_CLASSES = [
  "text-[#ef4444]",
  "text-[#22c55e]",
  "text-[#f59e0b]",
  "text-[#7c3aed]",
];

const GAUGE_CLASSES = [
  "#ef4444",
  "#22c55e",
  "#f59e0b",
  "#7c3aed",
];

const occupied = doors.filter((d) => d.status === "Occupied").length;
const reserved = doors.filter((d) => d.status === "Reserved").length;
const available = doors.filter((d) => d.status === "Available").length;
const anomalous = doors.filter((d) => d.anomaly).length;

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-[#1e1e2a] bg-[#0a0a0f] sticky top-0 z-10">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-lg font-bold text-[#f4f4f6] tracking-tight leading-tight">
              Bay 4 Assignments — Valley View
            </h1>
            <p className="text-xs text-[#71717a] tracking-wide">
              DOCK50-DOCK72 &nbsp;|&nbsp; October 2, 2026 &nbsp;|&nbsp; Last refreshed: Oct 2 18:15 PT
            </p>
          </div>
          {/* Facility badge */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#22c55e]"></span>
            <span className="text-xs text-[#a1a1aa] font-medium tracking-wide">
              LT_F1
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-6 py-6 flex flex-col gap-6">
        {/* ── Section: KPI Cards ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-5 w-1 rounded-full bg-[#7c3aed]" />
            <h2 className="text-sm font-semibold text-[#a1a1aa] uppercase tracking-widest">
              Summary
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiMetrics.map((metric, i) => (
              <KpiCard
                key={metric.label}
                metric={metric}
                accentClass={ACCENT_CLASSES[i]}
                gaugeClass={GAUGE_CLASSES[i]}
              />
            ))}
          </div>
        </section>

        {/* ── Section: Door Utilization Grid ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-5 w-1 rounded-full bg-[#7c3aed]" />
            <h2 className="text-sm font-semibold text-[#a1a1aa] uppercase tracking-widest">
              Door Utilization
            </h2>
            <span className="text-xs text-[#71717a] ml-auto">
              23 doors &nbsp;|&nbsp; {occupied} occupied / {reserved} reserved / {available} available / {anomalous} anomalies
            </span>
          </div>
          <DoorGrid doors={doors} />
        </section>

        {/* ── Section: Operational Metrics ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-5 w-1 rounded-full bg-[#7c3aed]" />
            <h2 className="text-sm font-semibold text-[#a1a1aa] uppercase tracking-widest">
              Operational Metrics
            </h2>
          </div>
          <OperationalMetrics
            mix={inboundOutboundMix}
            scheduleAvailable={scheduleAvailable}
            scheduledInboundReceived={scheduledInboundReceived}
            scheduledInboundOrders={scheduledInboundOrders}
            scheduledOutboundLoaded={scheduledOutboundLoaded}
            scheduledOutboundOrders={scheduledOutboundOrders}
            pctInboundReceived={pctScheduledInboundReceived}
            pctOutboundLoaded={pctScheduledOutboundLoaded}
          />
        </section>

        {/* ── Section: Assignments by Assignee ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-5 w-1 rounded-full bg-[#7c3aed]" />
            <h2 className="text-sm font-semibold text-[#a1a1aa] uppercase tracking-widest">
              Assignments by Assignee
            </h2>
            <span className="text-xs text-[#71717a] ml-auto">
              {assigneeSummaries.reduce((sum, a) => sum + a.taskCount, 0)} active tasks
            </span>
          </div>
          <AssigneeSummaryList summaries={assigneeSummaries} />

          {/* All-time counts */}
          <div className="mt-3 bg-[#141419] border border-[#1e1e2a] rounded-xl overflow-hidden">
            <div className="px-5 py-2.5 bg-[#0a0a0f] border-b border-[#1e1e2a]">
              <span className="text-xs font-semibold text-[#71717a] uppercase tracking-wider">
                All-Time Assignments (DOCK50–DOCK72) — prior baseline, not regenerated this refresh
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-5 py-3">
              {allTimeAssigneeSummaries.map((a) => (
                <div key={a.name} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-[#a1a1aa] truncate" title={a.name}>{a.name}</span>
                  <span className="text-sm font-bold text-[#7c3aed] tabular-nums">{a.taskCount}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section: Assignment History ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-5 w-1 rounded-full bg-[#7c3aed]" />
            <h2 className="text-sm font-semibold text-[#a1a1aa] uppercase tracking-widest">
              Assignment History
            </h2>
            <span className="text-xs text-[#71717a] ml-auto">
              {assignments.length} active transactions
            </span>
          </div>
          <AssignmentHistory assignments={assignments} />
        </section>

        {/* ── Section: "Guru live out / in assign to Arnulfo" ── */}
        <section>
          <div className="bg-[#141419] border border-[#1e1e2a] rounded-xl p-5 flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
              Assigned Activity — Bay 4 (GURUNANDA / Live Out &amp; In → Arnulfo)
            </span>

            {/* No exact match banner */}
            <div className="bg-[#7c3aed10] border border-[#7c3aed33] rounded-lg px-4 py-3 mt-1">
              <span className="text-xs text-[#7c3aed] font-semibold">
                ★ No task literally named &quot;Guru live out / in assign to Arnulfo&quot; exists in WISE
              </span>
              <span className="text-xs text-[#a1a1aa] block mt-0.5">
                Facility sweep of all 118 general tasks found 0 exact phrase matches (CLOSED 88 / NEEDS_APPROVAL 19 /
                NEW 9 / IN_PROGRESS 2), so every task note, job description, and task-line field was scanned.
                Closest real match - ARNULFO MUNGUIA&apos;s Bay 4 DOCK50-DOCK72 assigned activity: 7 active tasks
                (6 LOAD / 1 RECEIVE), across GURUNANDA and KARAKA pickups.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              {/* Column 1: Arnulfo Bay 4 Tasks */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#71717a] uppercase tracking-wider">
                  Arnulfo Active Bay 4 Tasks (7)
                </span>
                <span className="text-xs text-[#a1a1aa] mt-1">
                  <strong>DOCK50:</strong> TASK-5381269 (LOAD IN_PROGRESS)
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  <strong>DOCK51:</strong> TASK-5381268 (LOAD IN_PROGRESS)
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  <strong>DOCK53:</strong> TASK-5382457 (LOAD IN_PROGRESS)
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  <strong>DOCK54:</strong> TASK-5382462 + TASK-5380820 (LOAD IN_PROGRESS), TASK-5338695 (LOAD IN_PROGRESS, endTime 2026-08-10 but unclosed ⚠ STALE)
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  <strong>DOCK55:</strong> TASK-5378787 (RECEIVE IN_PROGRESS, KARAKA)
                </span>
                <span className="text-xs text-[#71717a] mt-1 italic">
                  Total: 7 open tasks (6 LOAD / 1 RECEIVE). Arnulfo also has 2 facility
                  general tasks, both NEEDS_APPROVAL; neither carries the queried description.
                </span>
              </div>

              {/* Column 2: Full Bay 4 Assignee Breakdown */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#71717a] uppercase tracking-wider">
                  Bay 4 Active Assignee Breakdown
                </span>
                <span className="text-xs text-[#a1a1aa] mt-1">
                  <span className="text-[#7c3aed] font-semibold">ARNULFO MUNGUIA:</span> 7 active
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  <span className="text-[#22c55e] font-semibold">Jorge Antonio Franco:</span> 2 active
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  <span className="text-[#22c55e] font-semibold">CANDY MENDEZ:</span> 1 active
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  <span className="text-[#22c55e] font-semibold">DANIELA GONZALEZ:</span> 1 active
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  <span className="text-[#f59e0b] font-semibold">daira gonzalez:</span> 1 active
                </span>
              </div>

              {/* Column 3: Customer Mix */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#71717a] uppercase tracking-wider">
                  Bay 4 Customer Mix &amp; Status
                </span>
                <span className="text-xs text-[#a1a1aa] mt-1">
                  <span className="text-[#7c3aed] font-semibold">GURUNANDA, LLC (ORG-655875):</span> 11 tasks (91.7% of active)
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  <span className="text-[#22c55e] font-semibold">KARAKA, LLC (ORG-585450):</span> 1 task (8.3% of active)
                </span>
                <div className="mt-2 pt-2 border-t border-[#1e1e2a]">
                  <span className="text-[10px] text-[#71717a] uppercase tracking-wider">Task Status</span>
                  <span className="text-xs text-[#a1a1aa] block mt-0.5">
                    11 IN_PROGRESS (91.7%) / 1 NEW (8.3%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Data Notes ── */}
        <section>
          <div className="bg-[#141419] border border-[#1e1e2a] rounded-xl p-5 flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
              Data Notes
            </span>
            <ul className="text-xs text-[#71717a] space-y-1 list-disc list-inside">
              <li><strong className="text-[#f4f4f6]">8 Occupied / 0 Reserved / 15 Available</strong> - occupied: DOCK50, DOCK51, DOCK53, DOCK54, DOCK55, DOCK56, DOCK68, DOCK69. No door holds only a NEW task this pull, so Reserved is 0; DOCK63 is now Available.</li>
              <li>Active tasks: <strong className="text-[#7c3aed]">6 outbound (LOAD)</strong> / <strong className="text-[#22c55e]">6 inbound (RECEIVE)</strong> = 12 total. 50.0% outbound / 50.0% inbound.</li>
              <li>8 doors with at least one active task. 34.8% task-based occupancy (8/23).</li>
              <li><strong className="text-[#22c55e]">★ Scheduled inbounds:</strong> 5 receipts with an appointmentTime on the October 3 facility-local (PT) day; 0 received (receipt status CLOSED) → 0.0% received so far (early Saturday; 98 further receipts are booked ≥ Oct 4).</li>
              <li><strong className="text-[#f59e0b]">⚠ Aged Anomalies:</strong> DOCK50 has been held 346d 18h 0m by an ended-but-unclosed RECEIVE task (TASK-5090739, endTime 2025-10-22). DOCK54 has been held 56d 14h 52m by an ended-but-unclosed LOAD task (TASK-5338695, endTime 2026-08-10).</li>
              <li><strong className="text-[#7c3aed]">★ Scheduled outbounds:</strong> 0 loads with an appointmentTime on the October 3 facility-local (PT) day (cumulative-load buckets: ≥ Oct 03 = 322, ≥ Oct 04 = 322 → day = 0; no loads are booked for the Saturday). Nothing scheduled → nothing loaded.</li>
              <li><strong className="text-[#7c3aed]">★ Customer mix:</strong> GURUNANDA, LLC has 11 of 12 active tasks (91.7%). KARAKA, LLC has 1 (8.3%).</li>
              <li>Door status is task-derived. The WMS native <em>dockStatus</em> field differs on this pull (native dockStatus OCCUPIED = 17; AVAILABLE = 4; RESERVED = 2 - while the grid keeps the same task-derived convention as the tracked activity).</li>
              <li>All core metrics sourced from live WISE/WMS queries, October 3, 2026 07:22 PT. Per-task assignee mapping resolved via load-task and receive-task APIs.</li>
            </ul>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e1e2a] bg-[#0a0a0f] mt-2">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between text-xs text-[#71717a]">
          <span>Valley View Warehouse — Bay 4 Operations</span>
          <span>Last refreshed: October 2, 2026 18:15 PT</span>
        </div>
      </footer>
    </div>
  );
}
