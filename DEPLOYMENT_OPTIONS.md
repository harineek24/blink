# Deployment Options for Blink

## Option 1: Streamlit (Streamlit Community Cloud)

### When to choose Streamlit
- Building a **Python-only** app (data dashboard, ML demo, internal tool)
- Want to go from idea to deployed app with **minimal frontend code**
- Don't need a custom UI — Streamlit's built-in widgets are sufficient
- Prototyping quickly or building for a small audience

### Pros
- Zero frontend code needed — pure Python
- Free hosting on Streamlit Community Cloud
- Auto-deploys from GitHub
- Built-in widgets for data viz, file uploads, forms, etc.
- Great for ML model demos and data exploration

### Cons
- Limited UI customization (looks like every other Streamlit app)
- Apps sleep after inactivity on free tier
- Not suitable for production-scale, user-facing apps
- Python only — no JavaScript/TypeScript support
- Performance degrades with many concurrent users

### Getting started
```bash
pip install streamlit
```

Minimal `app.py`:
```python
import streamlit as st

st.title("Blink")
st.write("Hello, world!")
```

Run locally: `streamlit run app.py`

Required file for deployment — `requirements.txt`:
```
streamlit
```

---

## Option 2: Vercel

### When to choose Vercel
- Building a **user-facing web application** with a polished UI
- Using **React, Next.js, Svelte, Vue**, or any modern frontend framework
- Need **API routes / serverless functions** (Node.js or Python)
- Want preview deployments for every pull request
- Need a CDN-backed, globally fast site

### Pros
- Excellent DX: push to deploy, preview URLs per PR
- Supports many frameworks (Next.js, React, Svelte, Vue, static sites)
- Serverless functions in Python or Node.js
- Generous free tier (100 GB bandwidth, unlimited deployments)
- Edge network for fast global delivery
- Custom domains with automatic HTTPS

### Cons
- Serverless function timeouts (10s free tier, 60s pro)
- Not ideal for long-running compute (ML inference, heavy data processing)
- More setup required compared to Streamlit
- Need to write frontend code (HTML/CSS/JS or a framework)

### Getting started (Next.js example)
```bash
npx create-next-app@latest blink
cd blink
```

Deploy: `npx vercel` or connect GitHub repo at vercel.com

### Getting started (Python API example)
Create `api/hello.py`:
```python
from http.server import BaseHTTPRequestHandler

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/plain")
        self.end_headers()
        self.wfile.write("Hello from Blink!".encode())
```

---

## Quick Comparison

| Feature               | Streamlit                  | Vercel                         |
|-----------------------|----------------------------|--------------------------------|
| **Language**          | Python only                | JS/TS/Python                   |
| **UI effort**         | Minimal (built-in widgets) | You build it (full control)    |
| **Free hosting**      | Yes (with sleep)           | Yes (generous limits)          |
| **Auto-deploy**       | Yes (GitHub)               | Yes (GitHub)                   |
| **Custom domain**     | No (free tier)             | Yes                            |
| **Serverless functions** | N/A                     | Yes (Node.js + Python)         |
| **Best for**          | Data apps, ML demos        | Web apps, APIs, static sites   |
| **Scalability**       | Limited                    | High (edge network)            |
| **Preview deploys**   | No                         | Yes (per PR)                   |

## Option 3: Chrome Extension (Implemented)

A Chrome extension version has been built in the `extension/` directory. This is the most practical deployment path for Blink because:

- **No server needed** — blink detection runs entirely in the browser via MediaPipe FaceMesh
- **Always available** — lives in the browser toolbar where users spend their screen time
- **Free distribution** — publish to the Chrome Web Store ($5 one-time fee)
- **Zero infrastructure** — no hosting, no backend, no costs

### Getting started
```bash
cd extension && ./setup.sh
```
Then load as an unpacked extension in Chrome.

## Recommendation

- **Chrome Extension** (recommended) — best fit for Blink's use case. No server, no hosting costs, always accessible in the browser.
- **Desktop App** (current) — keep for users who want the full dashboard experience or prefer Electron.
- **Streamlit** — not a good fit (can't do real-time webcam + CV processing).
- **Vercel** — not a good fit on its own (serverless timeout limits), but could host a static landing page for the extension.
