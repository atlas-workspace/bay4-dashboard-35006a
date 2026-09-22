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
              DOCK50-DOCK72 &nbsp;|&nbsp; September 22, 2026 &nbsp;|&nbsp; Last refreshed: Sep 22 11:38 PT
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
                Facility sweep of all 115 general tasks found 0 exact phrase matches (CLOSED 87 / NEEDS_APPROVAL 19 /
                NEW 7 / IN_PROGRESS 2), so every task note, job description, and task-line field was scanned.
                Closest real match - ARNULFO MUNGUIA&apos;s Bay 4 DOCK50-DOCK72 assigned activity: 7 active tasks
                (3 LOAD / 4 RECEIVE). 4 are GURUNANDA (&quot;Guru&quot;) tasks (3 LOAD + 1 RECEIVE); the other 3 are
                KARAKA RECEIVE tasks.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              {/* Column 1: Arnulfo Bay 4 Tasks */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#71717a] uppercase tracking-wider">
                  Arnulfo Active Bay 4 Tasks (7)
                </span>
                <span className="text-xs text-[#a1a1aa] mt-1">
                  <strong>DOCK53:</strong> TASK-5373472 (LOAD IN_PROGRESS)
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  <strong>DOCK54:</strong> TASK-5338695 (LOAD IN_PROGRESS, ended 08-10 but unclosed ⚠ STALE) / TASK-5365421 (LOAD IN_PROGRESS, ended 09-11 but unclosed ⚠ STALE)
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  <strong>DOCK55 / DOCK56 / DOCK62:</strong> TASK-5373122 (RECEIVE NEW) / TASK-5368665 (RECEIVE NEW) / TASK-5369120 (RECEIVE NEW) / TASK-5365814 (RECEIVE IN_PROGRESS)
                </span>
                <span className="text-xs text-[#71717a] mt-1 italic">
                  Total: 7 open tasks (3 LOAD / 4 RECEIVE). 4 GURUNANDA + 3 KARAKA. Arnulfo also has 2 facility
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
                  <span className="text-[#22c55e] font-semibold">DANIEL BELTRAN:</span> 2 active
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  <span className="text-[#f59e0b] font-semibold">RUFINO MUNGUIA / daira gonzalez / JEROME ARANDA:</span> 1 active each
                </span>
              </div>

              {/* Column 3: Customer Mix */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#71717a] uppercase tracking-wider">
                  Bay 4 Customer Mix &amp; Status
                </span>
                <span className="text-xs text-[#a1a1aa] mt-1">
                  <span className="text-[#7c3aed] font-semibold">GURUNANDA, LLC (ORG-655875):</span> 9 tasks (75.0% of active)
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  <span className="text-[#22c55e] font-semibold">KARAKA, LLC (ORG-585450):</span> 3 tasks (25.0% of active)
                </span>
                <div className="mt-2 pt-2 border-t border-[#1e1e2a]">
                  <span className="text-[10px] text-[#71717a] uppercase tracking-wider">Task Status</span>
                  <span className="text-xs text-[#a1a1aa] block mt-0.5">
                    7 IN_PROGRESS (58.3%) / 5 NEW (41.7%)
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
              <li><strong className="text-[#f4f4f6]">5 Occupied / 2 Reserved / 16 Available</strong> - occupied: DOCK50, DOCK53, DOCK54, DOCK55, DOCK62. Reserved (only NEW tasks): DOCK56, DOCK59.</li>
              <li>Active tasks: <strong className="text-[#7c3aed]">5 outbound (LOAD)</strong> / <strong className="text-[#22c55e]">7 inbound (RECEIVE)</strong> = 12 total. 41.7% outbound / 58.3% inbound.</li>
              <li>7 doors with at least one active task. 30.4% task-based occupancy (7/23).</li>
              <li><strong className="text-[#22c55e]">★ Scheduled inbounds:</strong> 33 receipts with an appointmentTime on the September 22 facility-local (PT) day. % received = 0 of 33 = 0.0% (receipts in CLOSED status).</li>
              <li><strong className="text-[#f59e0b]">⚠ Aged Anomalies:</strong> DOCK50 has been held 335d 22h 17m by an ended-but-unclosed RECEIVE task (TASK-5090739, endTime 2025-10-22). DOCK54 has been held 45d 19h 8m by an ended-but-unclosed LOAD task (TASK-5338695, endTime 2026-08-10); DOCK54 TASK-5365421 also ended 2026-09-11 without closing.</li>
              <li><strong className="text-[#7c3aed]">★ Scheduled outbounds:</strong> 111 loads with an appointmentTime on the September 22 facility-local (PT) day. % loaded = 37 of 111 = 33.3% (LOADED + SHIPPED).</li>
              <li><strong className="text-[#7c3aed]">★ Customer mix:</strong> GURUNANDA has 9 of 12 active tasks (75.0%). KARAKA has 3 (25.0%).</li>
              <li>Door status is task-derived. The WMS native <em>dockStatus</em> field differs on this pull (native dockStatus OCCUPIED = 14; AVAILABLE = 8; RESERVED = 1 - DOCK59 - while the grid keeps the same task-derived convention as the tracked activity).</li>
              <li>All core metrics sourced from live WISE/WMS queries, September 22, 2026 11:38 PT. Per-task assignee mapping resolved via load-task and receive-task APIs.</li>
            </ul>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e1e2a] bg-[#0a0a0f] mt-2">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between text-xs text-[#71717a]">
          <span>Valley View Warehouse — Bay 4 Operations</span>
          <span>Last refreshed: September 22, 2026 11:38 PT</span>
        </div>
      </footer>
    </div>
  );
}
