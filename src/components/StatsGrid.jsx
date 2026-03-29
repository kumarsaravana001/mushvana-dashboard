import { STATUS_COLORS } from "../constants";
import { formatMinutes } from "../hooks/useActiveTimer";

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
            {(key === "waiting" || key === "blocked") && stats.stale > 0 && key === "waiting" && null}
          </div>
          <div className="stat-card__label">{label}</div>
        </div>
      ))}
      {stats.stale > 0 && (
        <div className="stat-card stat-card--stale">
          <div className="stat-card__value stat-card__value--stale">
            {"\u26A0\uFE0F"} {stats.stale}
          </div>
          <div className="stat-card__label">Stale</div>
        </div>
      )}
      {stats.totalMinutes > 0 && (
        <div className="stat-card">
          <div className="stat-card__value" style={{ color: "var(--accent)" }}>
            {"\u23F0"} {formatMinutes(stats.totalMinutes)}
          </div>
          <div className="stat-card__label">Tracked</div>
        </div>
      )}
    </div>
  );
}
