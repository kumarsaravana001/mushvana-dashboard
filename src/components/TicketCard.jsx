import { useState } from "react";
import { PROJECTS, STATUS_COLORS, STATUSES } from "../constants";
import { useTickets } from "../context/TicketContext";

export default function TicketCard({ ticket }) {
  const [expanded, setExpanded] = useState(false);
  const { tickets, updateStatus } = useTickets();
  const projConfig = PROJECTS[ticket.project];
  const statusColor = STATUS_COLORS[ticket.status];

  const depNames = (ticket.depends_on || [])
    .map((id) => {
      const dep = tickets.find((t) => t.id === id);
      return dep ? dep.task : id;
    })
    .filter(Boolean);

  return (
    <>
      <div className="ticket-row" onClick={() => setExpanded(!expanded)}>
        <div className="ticket-row__dot" style={{ background: statusColor }} />
        <div className="ticket-row__content">
          <div className="ticket-row__title">{ticket.task}</div>
          <div className="ticket-row__meta">
            <span
              className="ticket-row__project-pill"
              style={{ background: projConfig.color + "18", color: projConfig.color }}
            >
              {projConfig.icon} {ticket.project}
            </span>
            <span className="ticket-row__energy">{ticket.energy}</span>
            {ticket.note && (
              <span className="ticket-row__note">{"\u2014"} {ticket.note}</span>
            )}
          </div>
        </div>
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
