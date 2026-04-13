"use client";

import { useState, useEffect } from "react";
import { getDummyData, STAGES, STAGE_MAP } from "../lib/data";
import { MVP_CATEGORIES } from "../lib/mvp-data";
import { STAGE_INFO } from "../lib/stage-info";
import Chatbot from "../components/chatbot";
import "./globals.css";

const RISK_LABELS = { high: "High", med: "Medium", low: "Low" };
const TICKETS_KEY = "mvp-tickets";
const STAGES_KEY = "parish-stages";
const ADMIN_KEY = "admin-unlocked";
const ADMIN_CODE = "cott2026";

// Reverse lookup: stage number → stage name
const STAGE_NAMES = Object.entries(STAGE_MAP).reduce((acc, [name, num]) => {
  if (num > 0) acc[num] = name;
  return acc;
}, {});

export default function Home() {
  const [view, setView] = useState("mvp");
  const [tickets, setTickets] = useState({});
  const [stageOverrides, setStageOverrides] = useState({});
  const [data, setData] = useState(getDummyData());
  const [dataSource, setDataSource] = useState("local");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { summary } = data;

  // Load from localStorage + try Notion
  useEffect(() => {
    try {
      if (localStorage.getItem(ADMIN_KEY) === "true") setIsAdmin(true);
    } catch { /* ignore */ }
    try {
      const saved = JSON.parse(localStorage.getItem(TICKETS_KEY));
      if (saved) setTickets(saved);
    } catch { /* ignore */ }
    try {
      const saved = JSON.parse(localStorage.getItem(STAGES_KEY));
      if (saved) setStageOverrides(saved);
    } catch { /* ignore */ }

    // Try fetching from Notion API
    fetch("/api/notion")
      .then((r) => {
        if (!r.ok) throw new Error("not configured");
        return r.json();
      })
      .then((notionData) => {
        if (notionData.parishes?.length > 0) {
          setData(notionData);
          setDataSource("notion");
        }
      })
      .catch(() => { /* Notion not configured, stay on dummy data */ });
  }, []);

  const setParishStage = (parishName, stageNum) => {
    const stageName = stageNum === 0 ? "Not Started" : STAGE_NAMES[stageNum];
    if (!stageName) return;
    const updated = { ...stageOverrides, [parishName]: stageName };
    localStorage.setItem(STAGES_KEY, JSON.stringify(updated));
    setStageOverrides(updated);
  };

  const saveTickets = (updated) => {
    localStorage.setItem(TICKETS_KEY, JSON.stringify(updated));
    setTickets(updated);
  };

  const addTicket = (catKey, featureIdx, description) => {
    const key = `${catKey}-${featureIdx}`;
    const list = tickets[key] || [];
    const ticket = { id: Date.now(), description, status: "working" };
    saveTickets({ ...tickets, [key]: [...list, ticket] });
  };

  const completeTicket = (catKey, featureIdx, ticketId) => {
    const key = `${catKey}-${featureIdx}`;
    const list = (tickets[key] || []).map((t) =>
      t.id === ticketId ? { ...t, status: "done" } : t
    );
    saveTickets({ ...tickets, [key]: list });
  };

  const getActiveTickets = (catKey, featureIdx) =>
    (tickets[`${catKey}-${featureIdx}`] || []).filter((t) => t.status !== "done");

  const getCompletedCount = (catKey, featureIdx) =>
    (tickets[`${catKey}-${featureIdx}`] || []).filter((t) => t.status === "done").length;

  return (
    <main className="tracker">
      <header className="header">
        <div className="header-top">
          <h1>Parish rollout tracker</h1>
          <div className="view-toggle" role="tablist" aria-label="Dashboard view">
            <button
              role="tab"
              id="tab-rollout"
              aria-selected={view === "parish"}
              aria-controls="panel-rollout"
              className={`toggle-btn ${view === "parish" ? "toggle-active" : ""}`}
              onClick={() => setView("parish")}
            >
              Rollout
            </button>
            <button
              role="tab"
              id="tab-mvp"
              aria-selected={view === "mvp"}
              aria-controls="panel-mvp"
              className={`toggle-btn ${view === "mvp" ? "toggle-active" : ""}`}
              onClick={() => setView("mvp")}
            >
              MVP
            </button>
          </div>
          <span className={`updated ${dataSource === "notion" ? "updated-live" : ""}`}>
            {dataSource === "notion" ? "Live from Notion" : "Local data"}
          </span>
          <AdminToggle
            isAdmin={isAdmin}
            showLogin={showLogin}
            onToggle={() => {
              if (isAdmin) {
                setIsAdmin(false);
                localStorage.removeItem(ADMIN_KEY);
              } else {
                setShowLogin(!showLogin);
              }
            }}
            onLogin={(code) => {
              if (code === ADMIN_CODE) {
                setIsAdmin(true);
                setShowLogin(false);
                localStorage.setItem(ADMIN_KEY, "true");
              }
            }}
            onCancel={() => setShowLogin(false)}
          />
        </div>
        {view === "parish" ? (
          <p className="subtitle">
            E-filing platform rollout across {summary.parishes} Louisiana
            parishes. Target: all live by {summary.targetCompletion}, 2026.
          </p>
        ) : (
          <p className="subtitle">
            Parish rollout blocked on Verdict CMS integration &mdash; tracking
            independent MVP feature progress across {MVP_CATEGORIES.length}{" "}
            categories.
          </p>
        )}
      </header>

      {view === "parish" ? (
        <div role="tabpanel" id="panel-rollout" aria-labelledby="tab-rollout">
          <ParishView data={data} stageOverrides={stageOverrides} onStageChange={setParishStage} isAdmin={isAdmin} />
        </div>
      ) : (
        <div role="tabpanel" id="panel-mvp" aria-labelledby="tab-mvp">
          <MvpView
            addTicket={addTicket}
            completeTicket={completeTicket}
            getActiveTickets={getActiveTickets}
            getCompletedCount={getCompletedCount}
            isAdmin={isAdmin}
          />
        </div>
      )}

      <footer className="footer">
        <p>
          Data source:{" "}
          <a
            href="https://www.notion.so/a136d7b502da4be8bd8242a53e9ce758"
            target="_blank"
            rel="noopener"
          >
            Notion Parish Rollout Tracker
            <span className="sr-only"> (opens in new tab)</span>
          </a>
          . Updates on page refresh.
        </p>
      </footer>

      <Chatbot
        parishes={data.parishes}
        mvpCategories={MVP_CATEGORIES}
        stories={tickets}
      />
    </main>
  );
}

/* ─── Admin Toggle ─── */

function AdminToggle({ isAdmin, showLogin, onToggle, onLogin, onCancel }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    onLogin(code);
    if (code !== ADMIN_CODE) {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
    setCode("");
  };

  return (
    <div className="admin-toggle">
      <button
        className={`admin-btn ${isAdmin ? "admin-btn-active" : ""}`}
        onClick={onToggle}
        aria-label={isAdmin ? "Lock editing" : "Unlock editing"}
      >
        {isAdmin ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <rect x="2" y="6" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <rect x="2" y="6" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M4.5 6V4.5a2.5 2.5 0 015 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        )}
        {isAdmin ? "Admin" : "Viewer"}
      </button>
      {showLogin && !isAdmin && (
        <div className="admin-login">
          <input
            className={`admin-code-input ${error ? "admin-code-error" : ""}`}
            type="password"
            placeholder="Passcode"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
              if (e.key === "Escape") onCancel();
            }}
            ref={(el) => el?.focus()}
            aria-label="Admin passcode"
          />
          <button className="admin-code-go" onClick={handleSubmit}>
            Go
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Parish Rollout View ─── */

function ParishView({ data, stageOverrides, onStageChange, isAdmin }) {
  const { summary, parishes: rawParishes } = data;
  const [weekFilter, setWeekFilter] = useState(null);

  // Apply stage overrides
  const parishes = rawParishes.map((p) => {
    const override = stageOverrides[p.name];
    if (override) return { ...p, currentStage: override };
    return p;
  });

  const weeks = [...new Set(parishes.map((p) => p.wk))].sort((a, b) => a - b);
  const filtered = weekFilter
    ? parishes.filter((p) => p.wk === weekFilter)
    : parishes;

  const liveCount = filtered.filter(
    (p) => p.currentStage === "7 - Live"
  ).length;
  const blockedCount = filtered.filter(
    (p) => p.currentStage === "Blocked"
  ).length;
  const inProgress = filtered.filter((p) => {
    const s = STAGE_MAP[p.currentStage] || 0;
    return s > 0 && s < 7;
  }).length;

  return (
    <>
      <div className="kpi-row">
        <div className="kpi">
          <span className="kpi-label">Parishes</span>
          <span className="kpi-value">
            {weekFilter ? filtered.length : summary.parishes}
          </span>
        </div>
        <div className="kpi">
          <span className="kpi-label">Daily filings</span>
          <span className="kpi-value">
            {weekFilter
              ? filtered.reduce((s, p) => s + p.vol, 0)
              : summary.dailyFilings}
          </span>
        </div>
        <div className="kpi">
          <span className="kpi-label">Target</span>
          <span className="kpi-value">{summary.targetCompletion}</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">Live</span>
          <span className="kpi-value kpi-live">
            {liveCount}/{filtered.length}
          </span>
        </div>
        <div className="kpi">
          <span className="kpi-label">In progress</span>
          <span className="kpi-value kpi-progress">{inProgress}</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">Blocked</span>
          <span className="kpi-value kpi-blocked">
            {blockedCount > 0 ? blockedCount : "0"}
          </span>
        </div>
        {summary.currentBlocker && (
          <div className="kpi kpi-blocker-card">
            <span className="kpi-label">Current blocker</span>
            <span className="kpi-value kpi-blocked">
              {summary.currentBlocker}
            </span>
          </div>
        )}
      </div>

      <div className="week-filter" role="group" aria-label="Filter by week">
        <button
          className={`week-pill ${weekFilter === null ? "week-pill-active" : ""}`}
          onClick={() => setWeekFilter(null)}
        >
          All
        </button>
        {weeks.map((wk) => (
          <button
            key={wk}
            className={`week-pill ${weekFilter === wk ? "week-pill-active" : ""}`}
            onClick={() => setWeekFilter(weekFilter === wk ? null : wk)}
          >
            Wk {wk}
          </button>
        ))}
      </div>

      <div className="legend">
        {STAGES.map((s) => (
          <span key={s.key} className="legend-item">
            <span className="legend-swatch" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
        <span className="legend-sep" />
        <span className="legend-item">
          <span className="risk-dot risk-high" /> High
        </span>
        <span className="legend-item">
          <span className="risk-dot risk-med" /> Med
        </span>
        <span className="legend-item">
          <span className="risk-dot risk-low" /> Low
        </span>
      </div>

      <div className="table-wrap">
        <table className="rollout-table">
          <caption className="sr-only">Parish rollout progress by week</caption>
          <thead>
            <tr>
              <th scope="col" className="col-wk">Wk</th>
              <th scope="col" className="col-parish">Parish</th>
              <th scope="col" className="col-vol">Vol.</th>
              <th scope="col" className="col-type">Type</th>
              <th scope="col" className="col-date">Onboard</th>
              <th scope="col" className="col-date">Churn</th>
              <th scope="col" className="col-risk">Risk</th>
              <th scope="col" className="col-progress">Rollout progress</th>
              <th scope="col" className="col-pct">%</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => {
              const stageNum = STAGE_MAP[p.currentStage] || 0;
              const pct = Math.round((stageNum / 7) * 100);
              const isBlocked = p.currentStage === "Blocked";
              const riskLabel = RISK_LABELS[p.risk] || p.risk;

              return (
                <tr key={i} className={isBlocked ? "row-blocked" : ""}>
                  <td className="col-wk">{p.wk}</td>
                  <td className="col-parish">
                    <span className="parish-name">{p.name}</span>
                  </td>
                  <td className="col-vol">{p.vol}/d</td>
                  <td className="col-type">
                    <span
                      className={`ver-pill ${p.version === "Standalone" ? "ver-s" : "ver-v"}`}
                    >
                      {p.version === "Standalone" ? "Standalone" : "Verdict"}
                    </span>
                  </td>
                  <td className="col-date">{p.onboard}</td>
                  <td className="col-date">{p.churn}</td>
                  <td className="col-risk">
                    <span
                      className={`risk-dot risk-${p.risk}`}
                      role="img"
                      aria-label={`Risk: ${riskLabel}${p.blocker ? `. Blocker: ${p.blocker}` : ""}`}
                    />
                  </td>
                  <td className="col-progress">
                    <div className="bar-container">
                      <div className="bar-track">
                        {STAGES.map((stage, si) => {
                          const idx = si + 1;
                          let cls = "seg-future";
                          if (isBlocked) cls = "seg-blocked";
                          else if (idx < stageNum) cls = "seg-done";
                          else if (idx === stageNum) cls = "seg-active";

                          return isAdmin ? (
                            <button
                              key={stage.key}
                              className={`bar-seg bar-seg-btn ${cls}`}
                              style={{ background: stage.color }}
                              title={`Set ${p.name} to ${stage.label}`}
                              aria-label={`Set ${p.name} to stage ${stage.label}`}
                              onClick={() => onStageChange(p.name, idx === stageNum ? idx - 1 : idx)}
                            />
                          ) : (
                            <div
                              key={stage.key}
                              className={`bar-seg ${cls}`}
                              style={{ background: stage.color }}
                              title={stage.label}
                            />
                          );
                        })}
                      </div>
                      <div className="bar-labels">
                        {STAGES.map((stage) => (
                          <span key={stage.key}>{stage.label}</span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="col-pct">
                    <span
                      className={`pct ${pct === 100 ? "pct-done" : pct > 0 ? "pct-active" : ""}`}
                    >
                      {pct}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <StageGuide />
    </>
  );
}

/* ─── Stage Guide ─── */

function StageGuide() {
  const [open, setOpen] = useState(false);

  return (
    <div className="stage-guide">
      <button
        className="stage-guide-toggle"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span>Stage guide</span>
        <span className="stage-guide-arrow">{open ? "\u25B2" : "\u25BC"}</span>
      </button>
      {open && (
        <div className="stage-guide-body">
          <p className="stage-guide-intro">
            Minimum end-to-end per parish: <strong>~18 days</strong> (no blockers, Valpay parallel with Stages 1-2).
          </p>
          <div className="stage-guide-grid">
            {STAGE_INFO.map((s) => (
              <div key={s.num} className="stage-guide-card">
                <div className="stage-guide-card-header">
                  <span
                    className="stage-guide-num"
                    style={{ background: STAGES[s.num - 1]?.color }}
                  >
                    {s.num}
                  </span>
                  <div>
                    <div className="stage-guide-name">{s.name}</div>
                    <div className="stage-guide-meta">{s.duration} &middot; {s.owner}</div>
                  </div>
                </div>
                <p className="stage-guide-desc">{s.summary}</p>
                <div className="stage-guide-gate">
                  <span className="stage-guide-gate-label">Gate:</span> {s.gate}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── MVP Features View ─── */

const HURDLE_KEY = "mvp-hurdle";

function MvpView({ addTicket, completeTicket, getActiveTickets, getCompletedCount, isAdmin }) {
  const [hurdle, setHurdle] = useState("Verdict CMS API");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(HURDLE_KEY);
      if (saved) setHurdle(saved);
    } catch { /* ignore */ }
  }, []);

  const saveHurdle = (val) => {
    setHurdle(val);
    localStorage.setItem(HURDLE_KEY, val);
  };

  return (
    <>
      <div className="kpi-row">
        <div className="kpi kpi-blocker-card">
          <span className="kpi-label">Biggest hurdle</span>
          {isAdmin ? (
            <input
              className="hurdle-input"
              type="text"
              value={hurdle}
              onChange={(e) => saveHurdle(e.target.value)}
              aria-label="Biggest hurdle"
            />
          ) : (
            <span className="kpi-value kpi-blocked">{hurdle}</span>
          )}
        </div>
      </div>

      <div className="mvp-grid">
        {MVP_CATEGORIES.map((cat) => {
          const catCompleted = cat.features.reduce(
            (s, _, i) => s + getCompletedCount(cat.key, i),
            0
          );
          const catActive = cat.features.reduce(
            (s, _, i) => s + getActiveTickets(cat.key, i).length,
            0
          );
          return (
            <div key={cat.key} className="mvp-card">
              <div
                className="mvp-card-accent"
                style={{ background: cat.color }}
              />
              <div className="mvp-card-header">
                <div className="mvp-cat-name">
                  <span
                    className="mvp-color-dot"
                    style={{ background: cat.color }}
                  />
                  {cat.name}
                </div>
                <span className="mvp-card-count">
                  {cat.features.length} features &middot; {catCompleted} tickets completed
                </span>
              </div>
              <div className="mvp-col-header">
                <span>Feature</span>
                <span>Tickets</span>
              </div>
              <ul className="mvp-features">
                {cat.features.map((f, i) => (
                  <FeatureRow
                    key={i}
                    feature={f}
                    catKey={cat.key}
                    featureIdx={i}
                    activeTickets={getActiveTickets(cat.key, i)}
                    completedCount={getCompletedCount(cat.key, i)}
                    onComplete={completeTicket}
                    isAdmin={isAdmin}
                  />
                ))}
              </ul>
              {isAdmin && <CardAddTicket catKey={cat.key} categories={cat} onAdd={addTicket} />}
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ─── Feature Row with Tickets ─── */

function FeatureRow({ feature, catKey, featureIdx, activeTickets, completedCount, onComplete, isAdmin }) {
  return (
    <li className="mvp-feature-group">
      <div className="mvp-feature">
        <span className="mvp-feature-name">{feature.name}</span>
        <div className="mvp-ticket-summary">
          {completedCount > 0 && (
            <span className="mvp-completed-badge">{completedCount} done</span>
          )}
        </div>
      </div>

      {activeTickets.map((t) => (
        <div key={t.id} className="mvp-ticket">
          {isAdmin ? (
            <button
              className="mvp-ticket-check"
              onClick={() => onComplete(catKey, featureIdx, t.id)}
              aria-label={`Mark "${t.description}" as done`}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          ) : (
            <span className="mvp-ticket-dot" aria-hidden="true" />
          )}
          <span className="mvp-ticket-desc">{t.description}</span>
        </div>
      ))}
    </li>
  );
}

/* ─── Card-level Add Ticket ─── */

function CardAddTicket({ catKey, categories, onAdd }) {
  const [adding, setAdding] = useState(false);
  const [desc, setDesc] = useState("");
  const [featureIdx, setFeatureIdx] = useState(0);

  const handleAdd = () => {
    const trimmed = desc.trim();
    if (!trimmed) return;
    onAdd(catKey, featureIdx, trimmed);
    setDesc("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAdd();
    if (e.key === "Escape") { setAdding(false); setDesc(""); }
  };

  if (!adding) {
    return (
      <button
        className="mvp-card-add-btn"
        onClick={() => setAdding(true)}
        aria-label={`Add ticket to ${categories.name}`}
      >
        + Add ticket
      </button>
    );
  }

  return (
    <div className="mvp-card-add-row">
      <select
        className="mvp-ticket-select"
        value={featureIdx}
        onChange={(e) => setFeatureIdx(Number(e.target.value))}
        aria-label="Select feature for ticket"
      >
        {categories.features.map((f, i) => (
          <option key={i} value={i}>{f.name}</option>
        ))}
      </select>
      <div className="mvp-ticket-input-row">
        <input
          className="mvp-ticket-input"
          type="text"
          placeholder="Describe ticket..."
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          onKeyDown={handleKeyDown}
          ref={(el) => el?.focus()}
          aria-label="Ticket description"
        />
        <button className="mvp-ticket-save" onClick={handleAdd} disabled={!desc.trim()}>
          Add
        </button>
        <button
          className="mvp-ticket-cancel"
          onClick={() => { setAdding(false); setDesc(""); }}
          aria-label="Cancel adding ticket"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
