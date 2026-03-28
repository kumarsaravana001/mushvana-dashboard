import { STATUS_COLORS } from "../constants";

const STAT_ITEMS = [
  { key: "actionable", label: "Actionable" },
  { key: "waiting", label: "Waiting" },
  { key: "blocked", label: "Blocked" },
  { key: "done", label: "Done" },
];

export default function StatsGrid({ stats }) {
  return (
    <div className="stats-grid">
      {STAT_ITEMS.map(({ key, label }) => (
        <div key={key} className="stat-card">
          <div className="stat-card__value" style={{ color: STATUS_COLORS[label] }}>
            <span className="stat-card__dot" style={{ background: STATUS_COLORS[label] }} />
            {stats[key]}
          </div>
          <div className="stat-card__label">{label}</div>
        </div>
      ))}
    </div>
  );
}
