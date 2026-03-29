import { useState } from "react";
import { PROJECTS, STATUS_COLORS, STATUSES } from "../constants";
import { useTickets } from "../context/TicketContext";
import { getStaleLevel, getStaleText } from "../utils/stale";
import { useActiveTimer, formatTimer, formatMinutes } from "../hooks/useActiveTimer";

export default function TicketCard({ ticket }) {
  const [expanded, setExpanded] = useState(false);
  const { tickets, updateStatus, activeTimer, startTimer, stopTimer } = useTickets();
  const projConfig = PROJECTS[ticket.project];
  const statusColor = STATUS_COLORS[ticket.status];
  const staleLevel = getStaleLevel(ticket);
  const staleText = getStaleText(ticket);
  const isTimerActive = activeTimer && activeTimer.ticketId === ticket.id;
  const elapsed = useActiveTimer(isTimerActive ? activeTimer.start : null);

  const totalMinutes = (ticket.time_sessions || []).reduce((sum, s) => sum + s.duration_minutes, 0);

  const depNames = (ticket.depends_on || [])
    .map((id) => {
      const dep = tickets.find((t) => t.id === id);
      return dep ? dep.task : id;
    })
    .filter(Boolean);

  const handleTimer = (e) => {
    e.stopPropagation();
    if (isTimerActive) stopTimer();
    else startTimer(ticket.id);
  };

  return (
    <>
      <div className="ticket-row" onClick={() => setExpanded(!expanded)}>
        <div className="ticket-row__dot" style={{ background: statusColor }} />
        <div className="ticket-row__content">
          <div className="ticket-row__title">
            {ticket.task}
            {isTimerActive && (
              <span className="ticket-row__timer-badge">{"\u23F1"} {formatTimer(elapsed)}</span>
            )}
          </div>
          <div className="ticket-row__meta">
            <span
              className="ticket-row__project-pill"
              style={{ background: projConfig.color + "18", color: projConfig.color }}
            >
              {projConfig.icon} {ticket.project}
            </span>
            <span className="ticket-row__energy">{ticket.energy}</span>
            {totalMinutes > 0 && (
              <span className="ticket-row__time">{"\u23F0"} {formatMinutes(totalMinutes)}</span>
            )}
            {staleLevel && (
              <span className={`ticket-row__stale ticket-row__stale--${staleLevel}`}>
                {"\u26A0\uFE0F"} {staleText}
              </span>
            )}
            {ticket.note && (
              <span className="ticket-row__note">{"\u2014"} {ticket.note}</span>
            )}
          </div>
        </div>
        {ticket.status === "Actionable" && (
          <button
            className={`ticket-row__timer-btn ${isTimerActive ? "ticket-row__timer-btn--active" : ""}`}
            onClick={handleTimer}
            title={isTimerActive ? "Stop timer" : "Start timer"}
          >
            {isTimerActive ? "\u23F9" : "\u25B6"}
          </button>
        )}
        <select
          className="ticket-row__inline-status"
          value={ticket.status}
          onChange={(e) => { e.stopPropagation(); updateStatus(ticket.id, e.target.value); }}
          onClick={(e) => e.stopPropagation()}
          style={{ color: statusColor }}
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {ticket.priority === "High" && <span className="ticket-row__high">HIGH</span>}
      </div>

      {expanded && (
        <div className="ticket-row__details">
          {totalMinutes > 0 && (
            <div className="ticket-row__time-detail">
              Total time: {formatMinutes(totalMinutes)} across {(ticket.time_sessions || []).length} session{(ticket.time_sessions || []).length !== 1 ? "s" : ""}
            </div>
          )}
          {depNames.length > 0 && (
            <div className="ticket-row__depends">
              Depends on: {depNames.join(", ")}
            </div>
          )}
          {ticket.blocker_note && (
            <div className="ticket-row__blocker">{ticket.blocker_note}</div>
          )}
          {ticket.note && (
            <div className="ticket-row__note-detail">{ticket.note}</div>
          )}
          {ticket.date_opened && (
            <div className="ticket-row__date">
              Opened {ticket.date_opened}
              {ticket.date_closed ? ` \u00B7 Closed ${ticket.date_closed}` : ""}
            </div>
          )}
        </div>
      )}
    </>
  );
}
