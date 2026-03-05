import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Brain, Search, PenSquare, ShieldCheck, Download, Sparkles, Loader2, Settings2, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'

// ─── Agent metadata ──────────────────────────────────────────────────────────
const AGENTS = [
  {
    key: 'research',
    name: 'Researcher',
    icon: <Search size={18} />,
    description: 'Gathering data & citations',
  },
  {
    key: 'architecture',
    name: 'Chief Architect',
    icon: <Brain size={18} />,
    description: 'Mapping to technical framework',
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

// ─── Defaults ───────────────────────────────────────────────────────────────
const DEFAULT_CONFIG = {
  domain: 'floods',
  year: '2025',
  regions: ['global', 'European', 'Bulgarian'],
  architectureName: 'I.S.E.E.',
  architectureDetails: [
    'Standard MLP (for major floods)',
    'Minor-Sensitive MLP (for nuisance floods)',
    'Spatial GNN (for topological flow)',
    'Physics-Informed Engine (modifies rain predictions based on slope, clay content, and river distance)',
    'Max-Wins safety logic (for conflict resolution between models)'
  ],
  forbiddenWords: ['ensemble']
}

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
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false)
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [newDetail, setNewDetail] = useState('')

  async function handleGenerate() {
    if (!topic.trim() || loading) return
    setLoading(true)
    setResult(null)
    setError(null)

    const agentKeys = AGENTS.map(a => a.key)
    let agentIdx = 0
    setActiveAgent(agentKeys[0])
    const progressInterval = setInterval(() => {
      agentIdx = Math.min(agentIdx + 1, agentKeys.length - 1)
      setActiveAgent(agentKeys[agentIdx])
    }, 15000)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, config }),
      })
      clearInterval(progressInterval)
      setActiveAgent(null)

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Unknown server error' }))
        throw new Error(error)
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

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleGenerate()
  }

  const addDetail = () => {
    if (!newDetail.trim()) return
    setConfig({ ...config, architectureDetails: [...config.architectureDetails, newDetail.trim()] })
    setNewDetail('')
  }

  const removeDetail = (index) => {
    const nextDetails = config.architectureDetails.filter((_, i) => i !== index)
    setConfig({ ...config, architectureDetails: nextDetails })
  }

  const tabs = AGENTS.filter(a => result?.[a.key]).map(a => ({ key: a.key, label: a.name }))

  return (
    <div className="app-wrapper">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-badge">
          <Sparkles size={12} />
          Multi-Agent Thesis System
        </div>
        <h1>Generate Custom<br />Thesis Chapters</h1>
        <p>
          Sequence specialized AI agents to write professional academic chapters for any research topic.
        </p>
      </header>

      {/* ── Settings Toggle ── */}
      <div className="settings-controls">
        <button 
          className={`settings-toggle-btn glass ${showSettings ? 'active' : ''}`}
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings2 size={16} />
          Project Settings
          {showSettings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* ── Settings Panel ── */}
      {showSettings && (
        <div className="glass settings-panel animate-in">
          <div className="settings-grid">
            <div className="settings-section">
              <h3>Research Context</h3>
              <div className="input-group">
                <label>Domain Topic</label>
                <input 
                  type="text" 
                  value={config.domain} 
                  onChange={e => setConfig({...config, domain: e.target.value})}
                  placeholder="e.g., floods, smart agriculture"
                />
              </div>
              <div className="input-group">
                <label>Target Year</label>
                <input 
                  type="text" 
                  value={config.year} 
                  onChange={e => setConfig({...config, year: e.target.value})}
                />
              </div>
            </div>

            <div className="settings-section">
              <h3>Architectural Framework</h3>
              <div className="input-group">
                <label>System Name</label>
                <input 
                  type="text" 
                  value={config.architectureName} 
                  onChange={e => setConfig({...config, architectureName: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label>Core Components</label>
                <div className="details-list">
                  {config.architectureDetails.map((detail, idx) => (
                    <div key={idx} className="detail-item glass">
                      <span>{detail}</span>
                      <button onClick={() => removeDetail(idx)}><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>
                <div className="add-detail">
                  <input 
                    type="text" 
                    value={newDetail} 
                    onChange={e => setNewDetail(e.target.value)}
                    placeholder="Add component..."
                    onKeyDown={e => e.key === 'Enter' && addDetail()}
                  />
                  <button onClick={addDetail}><Plus size={16} /></button>
                </div>
              </div>
            </div>
            
            <div className="settings-section">
              <h3>Constraints</h3>
              <div className="input-group">
                <label>Forbidden Words (comma separated)</label>
                <input 
                  type="text" 
                  value={config.forbiddenWords.join(', ')} 
                  onChange={e => setConfig({...config, forbiddenWords: e.target.value.split(',').map(s => s.trim())})}
                />
              </div>
            </div>
          </div>
        </div>
      )}

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
            placeholder={`Draft a chapter about ${config.domain}...`}
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
