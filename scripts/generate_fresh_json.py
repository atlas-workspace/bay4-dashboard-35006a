#!/usr/bin/env python3
"""Emit bay4-fresh-data.json (and src/ mirror) from the live WISE snapshot."""
import json
from datetime import datetime, timezone, timedelta

S = json.load(open("wise_snapshot.json"))
_snap = datetime.strptime(S["snapshotUtc"], "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
_la = _snap.astimezone(timezone(timedelta(hours=-7)))
PULLED_PT = f"{_la.strftime('%Y-%m-%d')} {_la.strftime('%H:%M')} PT"
PULLED_UTC = f"{_snap.strftime('%Y-%m-%d %H:%M')} UTC"
doors = S["doors"]
kpi = S["kpi"]
mix = S["mix"]
sch = S["schedule"]
nat = {}
for d in doors:
    nat[d["nativeDockStatus"]] = nat.get(d["nativeDockStatus"], 0) + 1
pct_in = (sch["inboundReceived"] / len(sch["receiptRows"])) * 100 if sch["receiptRows"] else 0.0

out = {
    "pulledAtPT": PULLED_PT,
    "pulledAtUTC": PULLED_UTC,
    "snapshotUTC": S["snapshotUtc"],
    "localDay": S["bootDay"],
    "facility": "Valley View (LT_F1)",
    "tenant": "LT",
    "scope": "Bay 4 DOCK50-DOCK72",
    "note": (f"All values are live WISE/WMS reads (read-only) for the {S['bootDay']} facility-local "
             "(America/Los_Angeles) day. load-task/receive-task return task start/end timestamps in UTC; "
             f"door durations are elapsed as-of the {S['snapshotUtc']} snapshot instant."),
    "doorIdMap": S["doorIdMap"],
    "summary": {
        "totalDoors": kpi["total"],
        "occupied": kpi["occupied"],
        "reserved": kpi["reserved"],
        "available": kpi["available"],
        "doorsWithActiveTasks": kpi["withTasks"],
        "anomalyDoors": [d["door"] for d in doors if d["anomaly"]],
        "activeTasks": mix["total"],
        "activeLoad": mix["outbound"],
        "activeReceive": mix["inbound"],
        "scheduledInboundOrders": len(sch["receiptRows"]),
        "scheduledInboundReceived": sch["inboundReceived"],
        "pctScheduledInboundReceived": round(pct_in, 1),
        "scheduledOutboundOrders": len(sch["loadRowsPreview"]),
        "scheduledOutboundLoaded": sch["outboundLoaded"],
        "pctScheduledOutboundLoaded": None,
        "nativeDockStatus": nat,
    },
    "assigneeCounts": [{"assignee": a["name"], "taskCount": a["taskCount"]} for a in S["assigneeSummaries"]],
    "allTimeAssigneeCounts": {
        "closedTotal": S["allTime"]["closedTotal"],
        "distinct": S["allTime"]["distinct"],
        "top": [{"assignee": a["name"], "taskCount": a["count"]} for a in S["allTime"]["top"]],
    },
    "doors": [{
        "door": d["door"], "locationId": d["locationId"], "status": d["status"],
        "assignees": d["assignees"], "customers": sorted(set(d["customers"])),
        "taskIds": sorted(d["taskIds"]), "duration": d["duration"], "anomaly": d["anomaly"],
        "nativeDockStatus": d["nativeDockStatus"],
        "tasks": [{"id": t["id"], "type": t["type"], "status": t["status"], "assignee": t["assignee"],
                   "customer": t["customer"], "customerId": t["customerId"],
                   "start": t["start"], "end": t["end"], "duration": t["duration"]} for t in d["tasks"]],
    } for d in doors],
    "activeTasks": [{
        "taskId": t["id"], "type": t["type"], "status": t["status"], "dockName": d["door"],
        "assigneeUserName": t["assignee"], "customerId": t["customerId"], "customerName": t["customer"],
        "startTime": t["start"], "endTime": t["end"],
    } for d in doors for t in d["tasks"]],
    "assignedActivity": {
        "query": "Guru live out / in assign to Arnulfo",
        "exactMatchCount": len(S["assignedActivity"]["exactPhraseHits"]),
        "facilityGeneralTaskSweep": {
            "total": S["assignedActivity"]["facilityGeneralTaskTotal"],
            **S["assignedActivity"]["statusMix"],
        },
        "arnulfoGeneralTasks": S["assignedActivity"]["arnulfoGeneralTasks"],
        "arnulfoBay4Active": S["arnulfo"],
        "result": ("No task literally named 'Guru live out / in assign to Arnulfo' exists in WISE - 0 exact matches "
                   f"across all {S['assignedActivity']['facilityGeneralTaskTotal']} facility general tasks; every task note, job description, "
                   "and task-line field was scanned. Closest real match - ARNULFO MUNGUIA's Bay 4 DOCK50-DOCK72 assigned activity: "
                   f"{S['arnulfo']['count']} active tasks ({S['arnulfo']['load']} LOAD / {S['arnulfo']['receive']} RECEIVE) across GURUNANDA and KARAKA."),
    },
    "schedule": {
        "window": f"{S['bootDay']} 00:00:00 - {S['bootDay']} 23:59:59 (facility-local America/Los_Angeles)",
        "inbound": {
            "scheduled": len(sch["receiptRows"]), "received": sch["inboundReceived"],
            "pctReceived": round(pct_in, 1),
            "definition": "receipts with appointmentTime on the day; received = receipts with receivedTime set",
            "rows": sch["receiptRows"],
        },
        "outbound": {
            "scheduled": len(sch["loadRowsPreview"]), "loaded": sch["outboundLoaded"],
            "pctLoaded": None,
            "definition": (f"loads with appointmentTime in the {S['bootDay']} facility-local (PT) day bucket; loaded = load status LOADED or SHIPPED."),
        },
    },
}
for path in ("bay4-fresh-data.json", "src/bay4-fresh-data.json"):
    with open(path, "w") as f:
        json.dump(out, f, indent=2)
        f.write("\n")
    print("wrote", path)
print("summary:", json.dumps(out["summary"]))
