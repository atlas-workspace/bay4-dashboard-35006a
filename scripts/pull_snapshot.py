#!/usr/bin/env python3
"""Pull fresh WISE/WMS data for the Bay 4 Assignments dashboard (LT_F1, DOCK50-DOCK72).

Read-only. Computes every value the dashboard renders and writes wise_snapshot.json.
"""
import os, json, time, urllib.request
from datetime import datetime, timezone, timedelta

BASE = os.environ["WMS_BASE_URL"].rstrip("/")
HDRS = {
    "Authorization": os.environ["WMS_AUTHORIZATION"],
    "x-tenant-id": os.environ["WMS_TENANT_ID"],
    "x-facility-id": os.environ["WMS_FACILITY_ID"],
    "Content-Type": "application/json",
}
PAGE_CAP = 200
BOOT = "2026-10-03"                       # facility-local operating day (America/Los_Angeles)
LA = timezone(timedelta(hours=-7))        # PDT


def post(path, body, tries=4):
    data = json.dumps(body).encode()
    last = None
    for i in range(tries):
        try:
            req = urllib.request.Request(BASE + path, data=data, headers=HDRS, method="POST")
            return json.loads(urllib.request.urlopen(req, timeout=60).read().decode())
        except Exception as e:
            last = e
            time.sleep(1.5 * (i + 1))
    raise RuntimeError(f"POST {path}: {last}")


def paged(path, body):
    out, page = [], 1
    while True:
        b = dict(body); b["currentPage"] = page; b["pageSize"] = PAGE_CAP
        d = post(path, b).get("data") or {}
        rows = d.get("list") or []
        out.extend(rows)
        if page >= (d.get("totalPage") or 1) or not rows:
            return out, d.get("totalCount")
        page += 1


BAY4 = {"570": "DOCK50", "554": "DOCK51", "556": "DOCK52", "552": "DOCK53", "564": "DOCK54", "560": "DOCK55",
        "575": "DOCK56", "563": "DOCK57", "572": "DOCK58", "571": "DOCK59", "565": "DOCK60", "567": "DOCK61",
        "566": "DOCK62", "568": "DOCK63", "559": "DOCK64", "573": "DOCK65", "576": "DOCK66", "577": "DOCK67",
        "574": "DOCK68", "578": "DOCK69", "579": "DOCK70", "580": "DOCK71", "587": "DOCK72"}
BAY4_IDS = set(BAY4)
CUST = {"ORG-655875": "GURUNANDA, LLC", "ORG-585450": "KARAKA, LLC"}

NOW = datetime.now(timezone.utc).replace(microsecond=0)
ISO = NOW.strftime("%Y-%m-%dT%H:%M:%SZ")
LA_NOW = NOW.astimezone(LA)


def dur(start_iso):
    if not start_iso:
        return None
    s = datetime.strptime(start_iso, "%Y-%m-%dT%H:%M:%S").replace(tzinfo=timezone.utc)
    secs = int((NOW - s).total_seconds())
    d, r = divmod(secs, 86400); h, r = divmod(r, 3600); m = r // 60
    if d > 0:
        return f"{d}d {h}h {m}m"
    return f"{h}h {m}m"


# 1) door locations
loc, loc_total = paged("/wms-bam/wms-location/search-by-paging", {"names": list(BAY4.values())})
loc_by_name = {r["name"]: r for r in loc}

# 2) open load + receive tasks (facility sweep) -> Bay4 subset
oload, oload_total = paged("/wms-bam/outbound/load-task/search-by-paging", {"statuses": ["NEW", "IN_PROGRESS", "EXCEPTION"]})
orecv, orecv_total = paged("/wms-bam/inbound/receive-task/search-by-paging", {"statuses": ["NEW", "IN_PROGRESS", "EXCEPTION"]})

open_rows = []
for r in oload:
    if str(r.get("dockId")) in BAY4_IDS:
        open_rows.append({**r, "_kind": "LOAD"})
for r in orecv:
    if str(r.get("dockId")) in BAY4_IDS:
        open_rows.append({**r, "_kind": "RECEIVE"})

# 3) today's schedule
sloads, sload_total = paged("/wms-bam/outbound/load/search-by-paging",
                            {"appointmentTimePeriod": [f"{BOOT}T00:00:00", f"{BOOT}T23:59:59"]})
srecv, srecv_total = paged("/wms-bam/inbound/receipt/search-by-paging",
                           {"appointmentTimeFrom": f"{BOOT}T00:00:00", "appointmentTimeTo": f"{BOOT}T23:59:59"})
# cumulative load buckets to isolate the day
cum_from, cum_from_total = paged("/wms-bam/outbound/load/search-by-paging",
                                 {"appointmentTimePeriod": [f"{BOOT}T00:00:00", f"{BOOT}T00:00:00"]})
cum_next, cum_next_total = paged("/wms-bam/outbound/load/search-by-paging",
                                 {"appointmentTimePeriod": [f"2026-10-04T00:00:00", f"2026-10-04T00:00:00"]})

# 4) all-time closed per Bay-4 door (for all-time assignee summary)
closed = []
for dock in sorted(BAY4_IDS):
    for kind, path in (("LOAD", "/wms-bam/outbound/load-task/search-by-paging"),
                       ("RECEIVE", "/wms-bam/inbound/receive-task/search-by-paging")):
        rows, _ = paged(path, {"statuses": ["CLOSED", "FORCE_CLOSED"], "dockId": dock})
        for r in rows:
            closed.append({"kind": kind, "taskId": r.get("id"), "customerId": r.get("customerId"),
                           "uid": str(r.get("assigneeUserId")), "name": r.get("assigneeUserName")})
seen = set(); dedup = []
for r in closed:
    k = (r["kind"], r["taskId"])
    if k in seen:
        continue
    seen.add(k); dedup.append(r)

# 5) facility general-task sweep
gtasks, gtotal = paged("/wms-bam/task/general-task/search-by-paging", {})
gt_status = {}
for t in gtasks:
    gt_status[t.get("status")] = gt_status.get(t.get("status"), 0) + 1
PHRASE = "guru live out / in assign to arnulfo"
def hay(t):
    parts = [t.get("note") or "", t.get("titleName") or "", t.get("projectCode") or "", t.get("customerName") or ""]
    for s in (t.get("taskSteps") or []):
        parts.append(s.get("note") or ""); parts.append(s.get("sysNote") or "")
    for ln in (t.get("generalTaskLines") or []):
        parts.append(ln.get("name") or ""); parts.append(ln.get("jobDesc") or "")
    return " ".join(parts).lower()
phrase_hits = [t["id"] for t in gtasks if PHRASE in hay(t)]
ARNULLFO_UID = "89"
arn_general = [{"id": t["id"], "status": t.get("status")} for t in gtasks if str(t.get("assigneeUserId")) == ARNULLFO_UID]

# ---- doors ----
doors = []
for name in [f"DOCK{n}" for n in range(50, 73)]:
    did = next(i for i, n in BAY4.items() if n == name)
    rows = [r for r in open_rows if str(r.get("dockId")) == did]
    rows.sort(key=lambda r: r.get("startTime") or "9999")
    inprog = [r for r in rows if r.get("status") == "IN_PROGRESS"]
    status = "Occupied" if inprog else ("Reserved" if rows else "Available")
    assignees = []
    for r in rows:
        nm = r.get("assigneeUserName")
        if nm and nm not in assignees:
            assignees.append(nm)
    custs = []
    for r in rows:
        nm = CUST.get(r.get("customerId"), r.get("customerId"))
        if nm not in custs:
            custs.append(nm)
    durs = [dur(r.get("startTime")) for r in rows if r.get("startTime")]
    dur_s = durs[0] if durs else None
    anomaly = any(r.get("endTime") for r in rows)
    native = (loc_by_name.get(name) or {}).get("dockStatus")
    doors.append({"door": name, "locationId": did, "status": status,
                  "assignees": assignees, "customers": custs,
                  "taskIds": [r.get("id") for r in rows],
                  "duration": dur_s, "anomaly": bool(anomaly), "nativeDockStatus": native,
                  "tasks": [{"id": r.get("id"), "type": r["_kind"], "status": r.get("status"),
                             "assignee": r.get("assigneeUserName"),
                             "customer": CUST.get(r.get("customerId"), r.get("customerId")),
                             "customerId": r.get("customerId"),
                             "start": r.get("startTime"), "end": r.get("endTime"),
                             "duration": dur(r.get("startTime"))} for r in rows]})

occupied = sum(1 for d in doors if d["status"] == "Occupied")
reserved = sum(1 for d in doors if d["status"] == "Reserved")
available = sum(1 for d in doors if d["status"] == "Available")
with_tasks = sum(1 for d in doors if d["taskIds"])
anomalous = sum(1 for d in doors if d["anomaly"])

# ---- assignees (active tasks) ----
ac = {}
for r in open_rows:
    nm = r.get("assigneeUserName") or "(unassigned)"
    ac[nm] = ac.get(nm, 0) + 1
assignee_summaries = [{"name": k, "taskCount": v} for k, v in sorted(ac.items(), key=lambda kv: -kv[1])]

# ---- mix / customer / status ----
outb = sum(1 for r in open_rows if r["_kind"] == "LOAD")
inb = sum(1 for r in open_rows if r["_kind"] == "RECEIVE")
cmix = {}
for r in open_rows:
    nm = CUST.get(r.get("customerId"), r.get("customerId")); cmix[nm] = cmix.get(nm, 0) + 1
smix = {}
for r in open_rows:
    smix[r.get("status")] = smix.get(r.get("status"), 0) + 1

# ---- all-time ----
an = {}
for r in dedup:
    nm = r.get("name") or "(unassigned)"; an[nm] = an.get(nm, 0) + 1
guru = [r for r in dedup if r.get("customerId") == "ORG-655875" and r.get("uid") == ARNULLFO_UID]

# ---- schedule ----
sr_received = sum(1 for x in srecv if x.get("receivedTime"))
sr_started = sum(1 for x in srecv if x.get("receivedStartTime"))
sl_loaded = sum(1 for l in sloads if l.get("status") in ("LOADED", "SHIPPED"))
sl_shipped = sum(1 for l in sloads if l.get("status") == "SHIPPED")
sr_stat = {}
for x in srecv:
    sr_stat[x.get("status")] = sr_stat.get(x.get("status"), 0) + 1

# ---- Arnulfo active Bay-4 ----
arn = [r for r in open_rows if str(r.get("assigneeUserId")) == ARNULLFO_UID]
arn_guru = sum(1 for r in arn if r.get("customerId") == "ORG-655875")
arn_karaka = sum(1 for r in arn if r.get("customerId") == "ORG-585450")

out = {
    "snapshotUtc": ISO,
    "refreshStampLA": LA_NOW.strftime("%b %d ~%H:%M PDT"),
    "refreshDateLong": LA_NOW.strftime("%B %d, %Y"),
    "bootDay": BOOT,
    "doors": doors,
    "kpi": {"occupied": occupied, "reserved": reserved, "available": available,
            "withTasks": with_tasks, "anomalous": anomalous, "total": len(doors)},
    "assigneeSummaries": assignee_summaries,
    "mix": {"outbound": outb, "inbound": inb, "total": outb + inb},
    "customerMix": [{"name": k, "count": v} for k, v in sorted(cmix.items(), key=lambda kv: -kv[1])],
    "statusMix": [{"name": k, "count": v} for k, v in sorted(smix.items(), key=lambda kv: -kv[1])],
    "allTime": {"closedTotal": len(dedup),
                "load": sum(1 for r in dedup if r["kind"] == "LOAD"),
                "receive": sum(1 for r in dedup if r["kind"] == "RECEIVE"),
                "distinct": len(an),
                "top": [{"name": k, "count": v} for k, v in sorted(an.items(), key=lambda kv: -kv[1])[:10]],
                "guruArnulfo": {"total": len(guru), "load": sum(1 for r in guru if r["kind"] == "LOAD"),
                                "receive": sum(1 for r in guru if r["kind"] == "RECEIVE")}},
    "schedule": {"inboundOrders": len(srecv), "outboundOrders": len(sloads),
                 "inboundReceived": sr_received, "inboundStarted": sr_started,
                 "outboundLoaded": sl_loaded, "outboundShipped": sl_shipped,
                 "receiptStatus": sr_stat,
                 "loadCumFrom": cum_from_total, "loadCumNext": cum_next_total,
                 "dayBucketLoads": (cum_from_total or 0) - (cum_next_total or 0),
                 "loadRowsPreview": [{"id": l.get("id"), "status": l.get("status"),
                                      "appointmentTime": l.get("appointmentTime")} for l in sloads[:8]],
                 "receiptRows": [{"id": x.get("id"), "status": x.get("status"),
                                  "appointmentTime": x.get("appointmentTime"),
                                  "receivedTime": x.get("receivedTime"),
                                  "customer": CUST.get(x.get("customerId"), x.get("customerId"))} for x in srecv]},
    "assignedActivity": {"query": "Guru live out / in assign to Arnulfo",
                         "facilityGeneralTaskTotal": gtotal,
                         "statusMix": gt_status,
                         "exactPhraseHits": phrase_hits,
                         "arnulfoGeneralTasks": arn_general},
    "arnulfo": {"count": len(arn), "load": sum(1 for r in arn if r["_kind"] == "LOAD"),
                "receive": sum(1 for r in arn if r["_kind"] == "RECEIVE"),
                "guru": arn_guru, "karaka": arn_karaka},
    "facilityOpen": {"load": oload_total, "receive": orecv_total},
    "doorIdMap": {v: k for k, v in BAY4.items()},
    "locationApi": [{"name": r["name"], "dockStatus": r.get("dockStatus"), "spaceStatus": r.get("spaceStatus")} for r in loc],
}
with open("wise_snapshot.json", "w") as f:
    json.dump(out, f, indent=2)

print(json.dumps({k: out[k] for k in ("snapshotUtc", "refreshStampLA", "kpi", "assigneeSummaries", "mix",
                                      "customerMix", "statusMix", "allTime", "schedule", "assignedActivity",
                                      "arnulfo", "facilityOpen")}, indent=2))
# native dock status tally
nt = {}
for d in doors:
    nt[d["nativeDockStatus"]] = nt.get(d["nativeDockStatus"], 0) + 1
print("NATIVE_DOCK_STATUS:", nt)
print("ARNULFO_ACTIVE_TASKS:", json.dumps([{"door": BAY4[str(r.get('dockId'))], "id": r.get("id"), "kind": r["_kind"],
      "status": r.get("status"), "cust": r.get("customerId")} for r in arn], indent=1))
