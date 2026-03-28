import { useTicketStats } from "../hooks/useTicketStats";
import { useTickets } from "../context/TicketContext";

const BAR_SEGMENTS = [
  { key: "done", color: "#6b7280" },
  { key: "actionable", color: "#22c55e" },
  { key: "waiting", color: "#eab308" },
  { key: "blocked", color: "#ef4444" },
];

const STAT_LABELS = [
  { key: "actionable", label: "Go", color: "#22c55e" },
  { key: "waiting", label: "Wait", color: "#eab308" },
  { key: "blocked", label: "Block", color: "#ef4444" },
  { key: "done", label: "Done", color: "#6b7280" },
];

export default function ProjectCard({ name, config, onClick }) {
  const { tickets } = useTickets();
  const stats = useTicketStats(tickets, name);
  const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div
      className="project-card"
      style={{ borderLeftColor: config.color, cursor: onClick ? "pointer" : "default" }}
      onClick={() => onClick?.(name)}
    >
      <div className="project-card__header">
        <div className="project-card__info">
          <span className="project-card__icon">{config.icon}</span>
          <span className="project-card__name">{name}</span>
          <span className="project-card__priority">{config.priority}</span>
        </div>
        <span className="project-card__pct" style={{ color: config.color }}>{pct}%</span>
      </div>

      <div className="progress-bar">
        {BAR_SEGMENTS.map(({ key, color }) => (
          <div
            key={key}
            className="progress-bar__segment"
            style={{
              width: stats.total > 0 ? `${(stats[key] / stats.total) * 100}%` : 0,
              background: color,
            }}
          />
        ))}
      </div>

      <div className="project-card__stats">
        {STAT_LABELS.map(({ key, label, color }) => (
          <span key={key} className="project-card__stat" style={{ color }}>
            <strong>{stats[key]}</strong> {label}
          </span>
        ))}
      </div>
    </div>
  );
}
