import { useState } from "react";
import { PROJECTS } from "../constants";
import { useTickets } from "../context/TicketContext";

function getMonthSessions(tickets, project) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  let count = 0;
  tickets.forEach((t) => {
    if (t.project !== project) return;
    (t.time_sessions || []).forEach((s) => {
      if (new Date(s.end) >= start) count++;
    });
  });
  return count;
}

function getPace(target, current) {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const expected = Math.round((target / daysInMonth) * dayOfMonth);
  if (current >= expected) return "on-track";
  if (current >= expected * 0.6) return "behind";
  return "critical";
}

export default function QuotaSection() {
  const { tickets, quotas, setQuota } = useTickets();
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState("");

  const projectNames = Object.keys(PROJECTS);
  const hasQuotas = projectNames.some((p) => quotas[p] && quotas[p] > 0);

  const handleSave = (project) => {
    const val = parseInt(editValue, 10);
    if (val > 0) setQuota(project, val);
    else setQuota(project, 0);
    setEditing(null);
  };

  return (
    <div className="quota-section">
      <div className="mission-section__header">
        <span className="section-header" style={{ margin: 0 }}>MONTHLY QUOTAS</span>
      </div>

      {projectNames.map((name) => {
        const target = quotas[name] || 0;
        const current = getMonthSessions(tickets, name);
        const pace = target > 0 ? getPace(target, current) : null;
        const pct = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
        const config = PROJECTS[name];

        return (
          <div key={name} className="quota-row">
            <div className="quota-row__header">
              <span className="quota-row__name">{config.icon} {name.split(" ")[0]}</span>
              {target > 0 ? (
                <span className={`quota-row__count quota-row__count--${pace}`} onClick={() => { setEditing(name); setEditValue(String(target)); }}>
                  {current}/{target} sessions
                </span>
              ) : (
                <button className="quota-row__set" onClick={() => { setEditing(name); setEditValue("10"); }}>
                  Set quota
                </button>
              )}
            </div>
            {editing === name && (
              <div className="quota-row__edit">
                <input
                  className="ticket-form__input"
                  type="number"
                  min="0"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  style={{ width: 80 }}
                />
                <span className="quota-row__edit-label">sessions/month</span>
                <button className="ticket-form__btn ticket-form__btn--save" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => handleSave(name)}>Save</button>
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
      })}

      {!hasQuotas && (
        <div className="quota-empty">Set monthly session quotas per project to track your commitment.</div>
      )}
    </div>
  );
}
