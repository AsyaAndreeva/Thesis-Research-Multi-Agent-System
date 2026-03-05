import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Brain, Search, PenSquare, ShieldCheck, Download, Sparkles, Loader2 } from 'lucide-react'

// ─── Agent metadata ──────────────────────────────────────────────────────────
const AGENTS = [
  {
    key: 'research',
    name: 'Researcher',
    icon: <Search size={18} />,
    description: 'Gathering 2025 flood data & citations',
  },
  {
    key: 'architecture',
    name: 'Chief Architect',
    icon: <Brain size={18} />,
    description: 'Mapping to I.S.E.E. framework',
  },
  {
    key: 'draft',
    name: 'Academic Writer',
    icon: <PenSquare size={18} />,
    description: 'Drafting the thesis chapter',
  },
  {
    key: 'final',
    name: 'Peer Reviewer',
    icon: <ShieldCheck size={18} />,
    description: 'Verifying citations & tone',
  },
]

// ─── Helper: determine card status ───────────────────────────────────────────
function agentStatus(agentKey, activeAgent, result) {
  if (result?.[agentKey]) return 'done'
  if (activeAgent === agentKey) return 'active'
  return 'idle'
}

// ─── Download helper ──────────────────────────────────────────────────────────
function downloadMarkdown(text, filename) {
  const blob = new Blob([text], { type: 'text/markdown' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [topic, setTopic]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [activeAgent, setActiveAgent] = useState(null)
  const [result, setResult]         = useState(null)
  const [error, setError]           = useState(null)
  const [activeTab, setActiveTab]   = useState('final')

  async function handleGenerate() {
    if (!topic.trim() || loading) return
    setLoading(true)
    setResult(null)
    setError(null)

    // Simulate per-agent progress by advancing the indicator client-side.
    // The actual work is done server-side in one request; we just animate
    // through agent states in 4 approximately equal slices of elapsed time.
    const agentKeys = AGENTS.map(a => a.key)
    let agentIdx = 0
    setActiveAgent(agentKeys[0])
    const progressInterval = setInterval(() => {
      agentIdx = Math.min(agentIdx + 1, agentKeys.length - 1)
      setActiveAgent(agentKeys[agentIdx])
    }, 15000) // advance every ~15 s (pipeline usually takes 45-90 s total)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      })
      clearInterval(progressInterval)
      setActiveAgent(null)

      if (!res.ok) {
        const { detail } = await res.json().catch(() => ({ detail: 'Unknown error' }))
        throw new Error(detail)
      }

      const data = await res.json()
      setResult(data)
      setActiveTab('final')
    } catch (err) {
      clearInterval(progressInterval)
      setActiveAgent(null)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Allow Ctrl/Cmd+Enter to submit
  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleGenerate()
  }

  const tabs = AGENTS.filter(a => result?.[a.key]).map(a => ({ key: a.key, label: a.name }))

  return (
    <div className="app-wrapper">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-badge">
          <Sparkles size={12} />
          I.S.E.E. Multi-Agent Thesis System
        </div>
        <h1>Generate World-Class<br />Thesis Chapters</h1>
        <p>
          Powered by four specialized AI agents: Researcher, Chief Architect,
          Academic Writer, and Peer Reviewer — all working in sequence to write
          your Master's Thesis on the I.S.E.E. flood monitoring platform.
        </p>
      </header>

      {/* ── Input Card ── */}
      <div className="glass input-card">
        <label className="input-label" htmlFor="topic-input">
          Chapter / Topic Request
        </label>
        <div className="input-row">
          <textarea
            id="topic-input"
            className="topic-input"
            rows={2}
            placeholder="e.g., Draft Chapter 1: Introduction based on 2025 global and European flood data"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            className="generate-btn"
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
          >
            {loading
              ? <><Loader2 size={16} className="spin-icon" /> Generating…</>
              : <><Sparkles size={16} /> Generate</>
            }
          </button>
        </div>
      </div>

      {/* ── Agent Pipeline ── */}
      <div className="pipeline">
        {AGENTS.map(agent => {
          const status = agentStatus(agent.key, activeAgent, result)
          return (
            <div key={agent.key} className={`glass agent-card ${status}`}>
              <div className="agent-icon">{agent.icon}</div>
              <div className="agent-name">{agent.name}</div>
              <div className="agent-status-text">
                {status === 'active' && <><span className="spinner" /> Running…</>}
                {status === 'done'   && '✓ Complete'}
                {status === 'idle'   && agent.description}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="error-banner">
          ⚠ {error}
        </div>
      )}

      {/* ── Output ── */}
      {result && (
        <div className="glass output-card">
          <div className="output-toolbar">
            <div className="tabs">
              {tabs.map(t => (
                <button
                  key={t.key}
                  className={`tab-btn ${activeTab === t.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <button
              className="download-btn"
              onClick={() => downloadMarkdown(result.final, 'thesis_chapter.md')}
            >
              <Download size={14} /> Download .md
            </button>
          </div>

          <div className="markdown-body">
            <ReactMarkdown>{result[activeTab] ?? ''}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {!result && !loading && !error && (
        <div className="glass output-card empty-state">
          <Sparkles size={32} />
          <p>Your generated thesis chapter will appear here.</p>
        </div>
      )}
    </div>
  )
}
