import { useState } from "react";
import { PROJECTS, STATUS_CONFIG, ENERGY_ICONS, STATUSES } from "../constants";
import { useTickets } from "../context/TicketContext";

export default function TicketCard({ ticket }) {
  const [expanded, setExpanded] = useState(false);
  const { tickets, updateStatus } = useTickets();
  const projConfig = PROJECTS[ticket.project];
  const statusStyle = STATUS_CONFIG[ticket.status];

  const depNames = (ticket.depends_on || [])
    .map((id) => {
      const dep = tickets.find((t) => t.id === id);
      return dep ? dep.task : id;
    })
    .filter(Boolean);

  return (
    <div
      className="ticket"
      style={{ borderLeftColor: projConfig.color }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="ticket__row">
        <div className="ticket__body">
          <div className="ticket__meta">
            <span className="ticket__project" style={{ color: projConfig.color }}>
              {projConfig.icon} {ticket.project}
            </span>
            {ticket.priority === "High" && <span className="ticket__high">HIGH</span>}
            <span className="ticket__energy">
              {ENERGY_ICONS[ticket.energy]} {ticket.energy}
            </span>
          </div>
          <div className="ticket__task">{ticket.task}</div>
        </div>

        <div className="ticket__actions" onClick={(e) => e.stopPropagation()}>
          <select
            className="ticket__status-select"
            value={ticket.status}
            onChange={(e) => updateStatus(ticket.id, e.target.value)}
            style={{ background: statusStyle.bg, color: statusStyle.text }}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {expanded && (
        <div className="ticket__details">
          {depNames.length > 0 && (
            <div className="ticket__depends">
              {"⛓️"} Depends on: {depNames.join(", ")}
            </div>
          )}
          {ticket.blocker_note && (
            <div className="ticket__blocker">{"🚫"} {ticket.blocker_note}</div>
          )}
          {ticket.note && (
            <div className="ticket__note">{"📝"} {ticket.note}</div>
          )}
          {ticket.date_opened && (
            <div className="ticket__date">
              Opened: {ticket.date_opened}
              {ticket.date_closed ? ` · Closed: ${ticket.date_closed}` : ""}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
