"""Chameleon Adaptive Honeypot – Backend API tests."""
import json
import os
import time
import asyncio

import pytest
import requests

try:
    import websockets
except ImportError:
    websockets = None

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://adaptive-threat-hub.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Stats ----------
class TestStats:
    def test_stats_shape(self, client):
        r = client.get(f"{API}/stats", timeout=15)
        assert r.status_code == 200
        data = r.json()
        for key in ["active_intruders", "total_sessions", "critical_alerts", "mutation_rate"]:
            assert key in data
            assert isinstance(data[key], (int, float))


# ---------- Sessions ----------
class TestSessions:
    def test_sessions_list(self, client):
        r = client.get(f"{API}/sessions", timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert len(items) >= 1
        s = items[0]
        for key in ["id", "ip", "country", "flag", "src_lat", "src_lng",
                    "dst_lat", "dst_lng", "risk_score", "stage", "status",
                    "intent_tags", "techniques", "commands"]:
            assert key in s, f"missing key {key}"

    def test_session_by_id_ok(self, client):
        items = client.get(f"{API}/sessions", timeout=15).json()
        sid = items[0]["id"]
        r = client.get(f"{API}/sessions/{sid}", timeout=15)
        assert r.status_code == 200
        assert r.json()["id"] == sid

    def test_session_by_id_404(self, client):
        r = client.get(f"{API}/sessions/does-not-exist-xyz", timeout=15)
        assert r.status_code == 404


# ---------- Events / Honeypots / Mutations / Honeytokens ----------
class TestEventStreams:
    def test_events(self, client):
        r = client.get(f"{API}/events", timeout=15)
        assert r.status_code == 200
        arr = r.json()
        assert isinstance(arr, list)
        if arr:
            ev = arr[0]
            for k in ["id", "ts", "message", "severity"]:
                assert k in ev

    def test_honeypots(self, client):
        r = client.get(f"{API}/honeypots", timeout=15)
        assert r.status_code == 200
        arr = r.json()
        assert isinstance(arr, list)
        assert len(arr) == 6
        for hp in arr:
            assert hp["policy"] in ("aggressive_lure", "passive_monitor")
            assert "active_sessions" in hp
            assert isinstance(hp["active_sessions"], int)

    def test_mutations(self, client):
        r = client.get(f"{API}/mutations", timeout=15)
        assert r.status_code == 200
        arr = r.json()
        assert isinstance(arr, list)
        for m in arr:
            assert "description" in m
            assert "ts" in m

    def test_honeytokens(self, client):
        r = client.get(f"{API}/honeytokens", timeout=15)
        assert r.status_code == 200
        arr = r.json()
        assert isinstance(arr, list)


# ---------- MITRE ----------
class TestMitre:
    def test_mitre_sorted(self, client):
        r = client.get(f"{API}/mitre", timeout=15)
        assert r.status_code == 200
        arr = r.json()
        assert isinstance(arr, list) and len(arr) > 0
        counts = [x["count"] for x in arr]
        assert counts == sorted(counts, reverse=True)
        for x in arr:
            for k in ["id", "name", "count", "intensity"]:
                assert k in x


# ---------- Predict ----------
class TestPredict:
    def test_predict_ok(self, client):
        items = client.get(f"{API}/sessions", timeout=15).json()
        sid = items[0]["id"]
        r = client.get(f"{API}/predict/{sid}", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert len(data["predictions"]) == 5
        assert "next_likely_stage" in data

    def test_predict_404(self, client):
        r = client.get(f"{API}/predict/unknown-session", timeout=15)
        assert r.status_code == 404


# ---------- LLM: Chat ----------
class TestChat:
    def test_chat_and_history(self, client):
        sid = "test-sess-chat-1"
        r = client.post(f"{API}/chat", json={"session_id": sid, "message": "What is happening right now?"}, timeout=60)
        assert r.status_code == 200
        data = r.json()
        assert "reply" in data
        assert isinstance(data["reply"], str)
        assert len(data["reply"]) > 10
        assert not data["reply"].startswith("[LLM error") and not data["reply"].startswith("[LLM unavailable")

        # History
        h = client.get(f"{API}/chat/{sid}", timeout=15)
        assert h.status_code == 200
        hist = h.json()
        assert len(hist) >= 2
        for m in hist:
            assert "_id" not in m
            assert m["role"] in ("user", "assistant")


# ---------- LLM: Lure ----------
class TestLure:
    def test_lure_generate(self, client):
        r = client.post(f"{API}/lure/generate", json={"behavior": "scanning /etc for keys", "target_os": "linux"}, timeout=60)
        assert r.status_code == 200
        data = r.json()
        for k in ["id", "ts", "behavior", "lure"]:
            assert k in data
        assert len(data["lure"]) > 20
        assert not data["lure"].startswith("[LLM error") and not data["lure"].startswith("[LLM unavailable")


# ---------- LLM: Report ----------
class TestReport:
    def test_report_generate(self, client):
        r = client.post(f"{API}/report/generate", json={"range_minutes": 60}, timeout=90)
        assert r.status_code == 200
        data = r.json()
        for k in ["id", "generated_at", "range_minutes", "snapshot", "body"]:
            assert k in data
        snap = data["snapshot"]
        for k in ["stats", "session_count", "top_countries", "top_techniques", "critical_sessions"]:
            assert k in snap
        assert isinstance(data["body"], str)
        assert len(data["body"]) > 50
        assert not data["body"].startswith("[LLM error") and not data["body"].startswith("[LLM unavailable")


# ---------- CTF ----------
class TestCTF:
    def test_ctf_submit_and_accumulate(self, client):
        handle = f"TEST_tester_{int(time.time())}"
        r1 = client.post(f"{API}/ctf/score", json={"handle": handle, "points": 50, "achievement": "First Blood"}, timeout=15)
        assert r1.status_code == 200
        d1 = r1.json()
        assert d1["handle"] == handle
        assert d1["points"] == 50
        assert "First Blood" in d1["achievements"]

        r2 = client.post(f"{API}/ctf/score", json={"handle": handle, "points": 25, "achievement": "Second Strike"}, timeout=15)
        assert r2.status_code == 200
        d2 = r2.json()
        assert d2["points"] == 75  # accumulated
        assert "First Blood" in d2["achievements"]
        assert "Second Strike" in d2["achievements"]

        lb = client.get(f"{API}/ctf/leaderboard", timeout=15).json()
        handles = [x["handle"] for x in lb]
        assert handles.count(handle) == 1  # no dup
        for row in lb:
            assert "_id" not in row
        # sorted desc
        pts = [x["points"] for x in lb]
        assert pts == sorted(pts, reverse=True)


# ---------- WebSocket ----------
class TestWebSocket:
    def test_ws_snapshot_and_stats(self):
        if websockets is None:
            pytest.skip("websockets not installed")
        ws_url = BASE_URL.replace("https://", "wss://").replace("http://", "ws://") + "/api/ws"

        async def run():
            events_seen = []
            async with websockets.connect(ws_url, open_timeout=15) as ws:
                try:
                    end = time.time() + 8
                    while time.time() < end:
                        raw = await asyncio.wait_for(ws.recv(), timeout=6)
                        msg = json.loads(raw)
                        events_seen.append(msg.get("event"))
                        if "snapshot" in events_seen and "stats" in events_seen:
                            break
                except asyncio.TimeoutError:
                    pass
            return events_seen

        events = asyncio.get_event_loop().run_until_complete(run()) if False else asyncio.run(run())
        assert "snapshot" in events, f"no snapshot event; got={events}"
        assert "stats" in events, f"no stats event; got={events}"
