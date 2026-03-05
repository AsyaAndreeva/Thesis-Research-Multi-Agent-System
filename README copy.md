# 🌊 I.S.E.E. Thesis Agent

> A **multi-agent AI system** for generating world-class Master's Thesis chapters on the I.S.E.E. (Intelligent Sensor-based Event Evaluator) flood monitoring platform.

Built with **React + Vite** (frontend), **Node.js Serverless Functions** (backend), and powered by **Google Gemini**.

---

## 🤖 The Agent Pipeline

```
User Input → [1] Researcher → [2] Chief Architect → [3] Academic Writer → [4] Peer Reviewer → Thesis Chapter
```

| Agent | Role |
|---|---|
| 🕵️ **Researcher** | Gathers 2025 global, European and Bulgarian flood statistics with cited sources & links |
| 🏗️ **Chief Architect** | Connects the problem to the I.S.E.E. multi-modal architecture (Standard MLP, Minor-Sensitive MLP, Spatial GNN, Physics-Informed Engine, Max-Wins logic) |
| ✍️ **Academic Writer** | Drafts formal, world-class thesis chapters |
| 🧐 **Peer Reviewer** | Verifies academic tone, ensures all citations have links, and enforces architectural terminology rules |

---

## 📁 Project Structure

```
isee-thesis-agent/
├── api/
│   └── generate.js          # Node.js serverless function (4 agents + Gemini)
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # React UI — glassmorphic dark theme
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Premium styling
│   ├── package.json
│   └── vite.config.js       # Dev proxy: /api → localhost:3000
├── agents.py                # Python CLI agents (local use)
├── prompts.py               # Python agent prompts (local use)
├── main.py                  # Python CLI orchestrator
├── requirements.txt         # Python dependencies (local use)
├── vercel.json              # Vercel routing + 300s function timeout
├── package.json             # Root Node.js dependencies
└── .env                     # Local API keys (NOT committed to git)
```

---

## 🚀 Deployment (Vercel)

### 1. Push to GitHub
```bash
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/isee-thesis-agent.git
git push -u origin main
```

### 2. Import to Vercel
Go to [vercel.com](https://vercel.com) → **Add New Project** → Import your repo.

### 3. Set Environment Variable
In **Project Settings → Environment Variables**, add:

| Name | Value |
|---|---|
| `GEMINI_API_KEY` | `your-gemini-api-key` |

Click **Deploy**. Your friends can now use the app at `https://your-project.vercel.app` 🎉

---

## 💻 Running Locally

### Frontend + API (Development)

**Terminal 1 — Node.js API:**
```bash
# Install root dependencies (first time only)
npm install

# (No separate server needed — Vite proxies /api to vercel dev)
# OR test the API with vercel dev:
npx vercel dev
```

**Terminal 2 — React:**
```bash
cd frontend
npm install   # first time only
npm run dev
```

Open **http://localhost:5173**

### Python CLI (Optional — local generation without the web UI)
```bash
pip install -r requirements.txt
cp .env.example .env   # add your GEMINI_API_KEY
python main.py "Draft Chapter 1: Introduction based on 2025 flood data"
```

---

## ⚙️ Architecture Rules (enforced by prompts)

- ❌ The word **"ensemble"** is **forbidden** — the Reviewer agent will remove it
- ✅ All statistics must have a **source name + clickable URL**
- ✅ I.S.E.E. architecture always referred to as **"multi-modal architecture"** or **"tripartite framework"**

---

## 📄 License

MIT — use freely for your thesis!
