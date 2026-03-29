import { useState } from "react";
import { useTickets } from "../context/TicketContext";
import { useActiveTimer, formatTimer } from "../hooks/useActiveTimer";

function getWeekSessions(lifeSessions, domainId) {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  return lifeSessions.filter((s) => s.domainId === domainId && new Date(s.end) >= weekStart);
}

function getPace(target, current) {
  const now = new Date();
  const dayOfWeek = now.getDay() || 7;
  const expected = Math.round((target / 7) * dayOfWeek);
  if (current >= expected) return "on-track";
  if (current >= expected * 0.5) return "behind";
  return "critical";
}

function DomainRow({ domain }) {
  const { lifeSessions, lifeTimer, startLifeTimer, stopLifeTimer, updateLifeDomain, deleteLifeDomain } = useTickets();
  const [editing, setEditing] = useState(false);
  const [editTarget, setEditTarget] = useState(String(domain.quota_target));

  const isActive = lifeTimer && lifeTimer.domainId === domain.id;
  const elapsed = useActiveTimer(isActive ? lifeTimer.start : null);
  const weekSessions = getWeekSessions(lifeSessions, domain.id);
  const current = weekSessions.length;
  const target = domain.quota_target || 0;
  const pace = target > 0 ? getPace(target, current) : null;
  const pct = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;

  const handleSave = () => {
    const val = parseInt(editTarget, 10);
    updateLifeDomain(domain.id, { quota_target: val > 0 ? val : 0 });
    setEditing(false);
  };

  return (
    <div className="life-domain-row">
      <div className="life-domain-row__main">
        <span className="life-domain-row__icon">{domain.icon}</span>
        <div className="life-domain-row__info">
          <span className="life-domain-row__name">{domain.name}</span>
          {target > 0 && (
            <span
              className={`life-domain-row__count life-domain-row__count--${pace}`}
              onClick={() => { setEditing(true); setEditTarget(String(target)); }}
            >
              {current}/{target} this week
            </span>
          )}
          {target === 0 && (
            <button
              className="quota-row__set"
              onClick={() => { setEditing(true); setEditTarget("7"); }}
            >
              Set quota
            </button>
          )}
        </div>
        <button
          className={`ticket-row__timer-btn ${isActive ? "ticket-row__timer-btn--active" : ""}`}
          onClick={() => isActive ? stopLifeTimer() : startLifeTimer(domain.id)}
          title={isActive ? "Stop" : "Start"}
        >
          {isActive ? "\u23F9" : "\u25B6"}
        </button>
        {isActive && <span className="ticket-row__timer-badge">{formatTimer(elapsed)}</span>}
      </div>

      {editing && (
        <div className="quota-row__edit">
          <input
            className="ticket-form__input"
            type="number"
            min="0"
            value={editTarget}
            onChange={(e) => setEditTarget(e.target.value)}
            style={{ width: 60 }}
          />
          <span className="quota-row__edit-label">/ week</span>
          <button className="ticket-form__btn ticket-form__btn--save" style={{ padding: "4px 10px", fontSize: 11 }} onClick={handleSave}>Save</button>
          <button
            className="ticket-form__btn ticket-form__btn--cancel"
            style={{ padding: "4px 8px", fontSize: 11, color: "#ef4444" }}
            onClick={() => { if (window.confirm(`Remove "${domain.name}"?`)) deleteLifeDomain(domain.id); }}
          >
            {"\u2715"}
          </button>
        </div>
      )}

      {target > 0 && (
        <div className="progress-bar" style={{ marginTop: 4 }}>
          <div
            className="progress-bar__segment"
            style={{
              width: `${pct}%`,
              background: pace === "on-track" ? "#22c55e" : pace === "behind" ? "#eab308" : "#ef4444",
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function LifeDomainSection() {
  const { lifeDomains, addLifeDomain } = useTickets();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("\u2B50");

  const handleAdd = () => {
    if (newName.trim()) {
      addLifeDomain({ name: newName.trim(), icon: newIcon });
      setNewName("");
      setNewIcon("\u2B50");
      setAdding(false);
    }
  };

  return (
    <div className="life-domain-section">
      <div className="mission-section__header">
        <span className="section-header" style={{ margin: 0 }}>LIFE DOMAINS</span>
        <button className="mission-section__add" onClick={() => setAdding(!adding)}>+</button>
      </div>

      {adding && (
        <div className="life-domain-add">
          <input
            className="ticket-form__input"
            placeholder="Domain name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={{ flex: 1 }}
          />
          <input
            className="ticket-form__input"
            placeholder="Icon"
            value={newIcon}
            onChange={(e) => setNewIcon(e.target.value)}
            style={{ width: 40, textAlign: "center" }}
          />
          <button className="ticket-form__btn ticket-form__btn--save" style={{ padding: "6px 12px", fontSize: 12 }} onClick={handleAdd}>Add</button>
        </div>
      )}

      {lifeDomains.map((domain) => (
        <DomainRow key={domain.id} domain={domain} />
      ))}
    </div>
  );
}
