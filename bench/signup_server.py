#!/usr/bin/env python3
"""Publiczny serwis zapisów do zespołu Bielik Slayer.
GET  /signups  -> {"count":N,"people":[{name,roles,about,date}]}  (kontakt NIE jest publiczny)
POST /signups  -> body JSON {name,roles[],contact,about,website?}  (website = honeypot)
Storage: JSON file. CORS dla slayer.fabryka.ai. Anty-spam: limity długości, honeypot, cooldown/IP.
"""
import json, os, re, time, html
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

STORE = "/root/slayer-signups/signups.json"
ORIGIN = "https://slayer.fabryka.ai"
MAXLEN = {"name": 60, "contact": 120, "about": 400}
COOLDOWN = 20          # sekundy między zapisami z jednego IP
last_ip = {}

os.makedirs(os.path.dirname(STORE), exist_ok=True)
if not os.path.exists(STORE):
    json.dump([], open(STORE, "w"))

def load():
    try: return json.load(open(STORE))
    except Exception: return []
def save(d): json.dump(d, open(STORE, "w"), ensure_ascii=False, indent=2)
def clean(s, n): return html.escape(str(s or "").strip())[:n]

class H(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", ORIGIN)
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
    def _json(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(code); self.send_header("Content-Type", "application/json; charset=utf-8")
        self._cors(); self.send_header("Content-Length", str(len(body))); self.end_headers(); self.wfile.write(body)
    def log_message(self, *a): pass
    def do_OPTIONS(self):
        self.send_response(204); self._cors(); self.send_header("Content-Length", "0"); self.end_headers()
    def do_GET(self):
        if self.path.split("?")[0] != "/signups": return self._json(404, {"error": "not found"})
        people = [{"name": p["name"], "roles": p.get("roles", []), "about": p.get("about", ""),
                   "date": p.get("date", "")} for p in load()]
        self._json(200, {"count": len(people), "people": people})
    def do_POST(self):
        if self.path.split("?")[0] != "/signups": return self._json(404, {"error": "not found"})
        ip = self.headers.get("X-Forwarded-For", self.client_address[0]).split(",")[0].strip()
        now = time.time()
        if now - last_ip.get(ip, 0) < COOLDOWN: return self._json(429, {"error": "zwolnij — spróbuj za chwilę"})
        try:
            n = int(self.headers.get("Content-Length", 0))
            if n > 4000: return self._json(413, {"error": "za duże"})
            data = json.loads(self.rfile.read(n) or b"{}")
        except Exception: return self._json(400, {"error": "zły JSON"})
        if clean(data.get("website"), 10): return self._json(200, {"ok": True})  # honeypot -> cicho odrzuć
        name = clean(data.get("name"), MAXLEN["name"])
        contact = clean(data.get("contact"), MAXLEN["contact"])
        about = clean(data.get("about"), MAXLEN["about"])
        roles = [clean(r, 30) for r in (data.get("roles") or [])][:8]
        if not name or not contact: return self._json(400, {"error": "podaj imię i kontakt"})
        people = load()
        if len(people) >= 2000: return self._json(507, {"error": "limit"})
        people.append({"name": name, "roles": roles, "about": about, "contact": contact,
                       "date": time.strftime("%Y-%m-%d"), "ip": ip, "ts": int(now)})
        save(people); last_ip[ip] = now
        self._json(201, {"ok": True, "count": len(people)})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8090"))
    print(f"signup server on :{port}, store={STORE}", flush=True)
    ThreadingHTTPServer(("127.0.0.1", port), H).serve_forever()
