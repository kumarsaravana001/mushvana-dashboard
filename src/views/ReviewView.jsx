import { useMemo } from "react";
import { PROJECTS, AFTER_FEELS } from "../constants";
import { useTickets } from "../context/TicketContext";
import { getDaysInStatus } from "../utils/stale";
import { formatMinutes } from "../hooks/useActiveTimer";

function getWeekRange(offset = 0) {
  const now = new Date();
  const day = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - day - (offset * 7));
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return { start, end, label: offset === 0 ? "This Week" : "Last Week" };
}

function getSessionsInRange(tickets, start, end) {
  const sessions = [];
  tickets.forEach((t) => {
    (t.time_sessions || []).forEach((s) => {
      const d = new Date(s.end);
      if (d >= start && d < end) {
        sessions.push({ ...s, ticketId: t.id, project: t.project, task: t.task });
      }
    });
  });
  return sessions;
}

export default function ReviewView() {
  const { tickets } = useTickets();

  const thisWeek = getWeekRange(0);
  const lastWeek = getWeekRange(1);

  const review = useMemo(() => {
    const sessions = getSessionsInRange(tickets, thisWeek.start, thisWeek.end);
    const lastSessions = getSessionsInRange(tickets, lastWeek.start, lastWeek.end);

    const completed = tickets.filter((t) => {
      if (t.status !== "Done" || !t.date_closed) return false;
      const d = new Date(t.date_closed);
      return d >= thisWeek.start && d < thisWeek.end;
    });

    const longestWaiting = tickets
      .filter((t) => t.status === "Waiting")
      .sort((a, b) => getDaysInStatus(b) - getDaysInStatus(a))
      .slice(0, 3);

    const longestBlocked = tickets
      .filter((t) => t.status === "Blocked")
      .sort((a, b) => getDaysInStatus(b) - getDaysInStatus(a))
      .slice(0, 3);

    const timeByProject = {};
    const lastTimeByProject = {};
    sessions.forEach((s) => {
      timeByProject[s.project] = (timeByProject[s.project] || 0) + s.duration_minutes;
    });
    lastSessions.forEach((s) => {
      lastTimeByProject[s.project] = (lastTimeByProject[s.project] || 0) + s.duration_minutes;
    });

    const energyDist = {};
    const feelDist = {};
    sessions.forEach((s) => {
      if (s.energy_used) energyDist[s.energy_used] = (energyDist[s.energy_used] || 0) + 1;
      if (s.after_feel) feelDist[s.after_feel] = (feelDist[s.after_feel] || 0) + 1;
    });

    const neglected = Object.keys(PROJECTS).filter((p) => !timeByProject[p]);

    const totalMin = sessions.reduce((s, x) => s + x.duration_minutes, 0);
    const lastTotalMin = lastSessions.reduce((s, x) => s + x.duration_minutes, 0);

    return {
      completed, longestWaiting, longestBlocked,
      timeByProject, lastTimeByProject,
      energyDist, feelDist, neglected,
      totalMin, lastTotalMin, sessionCount: sessions.length,
    };
  }, [tickets, thisWeek.start, thisWeek.end, lastWeek.start, lastWeek.end]);

  const maxTime = Math.max(...Object.values(review.timeByProject), 1);
  const totalFeels = Object.values(review.feelDist).reduce((s, v) => s + v, 0) || 1;

  return (
    <div className="review">
      <div className="review__header">
        <h2 className="review__title">Weekly Review</h2>
        <span className="review__period">{thisWeek.start.toLocaleDateString()} — {thisWeek.end.toLocaleDateString()}</span>
      </div>

      <div className="review__summary">
        <div className="review__stat">
          <div className="review__stat-value">{review.sessionCount}</div>
          <div className="review__stat-label">Sessions</div>
        </div>
        <div className="review__stat">
          <div className="review__stat-value">{review.totalMin > 0 ? formatMinutes(review.totalMin) : "—"}</div>
          <div className="review__stat-label">
            Total
            {review.lastTotalMin > 0 && (
              <span className={review.totalMin >= review.lastTotalMin ? "review__trend--up" : "review__trend--down"}>
                {review.totalMin >= review.lastTotalMin ? " \u2191" : " \u2193"}
              </span>
            )}
          </div>
        </div>
        <div className="review__stat">
          <div className="review__stat-value">{review.completed.length}</div>
          <div className="review__stat-label">Completed</div>
        </div>
      </div>

      {review.completed.length > 0 && (
        <div className="review__section">
          <div className="section-header">COMPLETED THIS WEEK</div>
          {review.completed.map((t) => {
            const mins = (t.time_sessions || []).reduce((s, x) => s + x.duration_minutes, 0);
            return (
              <div key={t.id} className="review__item">
                <span className="review__item-dot" style={{ background: PROJECTS[t.project]?.color }} />
                <span className="review__item-task">{t.task}</span>
                {mins > 0 && <span className="review__item-time">{formatMinutes(mins)}</span>}
              </div>
            );
          })}
        </div>
      )}

      {Object.keys(review.timeByProject).length > 0 && (
        <div className="review__section">
          <div className="section-header">TIME DISTRIBUTION</div>
          {Object.entries(review.timeByProject)
            .sort(([, a], [, b]) => b - a)
            .map(([project, mins]) => {
              const lastMins = review.lastTimeByProject[project] || 0;
              const pct = Math.round((mins / maxTime) * 100);
              return (
                <div key={project} className="review__bar-row">
                  <span className="review__bar-label">{PROJECTS[project]?.icon} {project.split(" ")[0]}</span>
                  <div className="review__bar-track">
                    <div
                      className="review__bar-fill"
                      style={{ width: `${pct}%`, background: PROJECTS[project]?.color }}
                    />
                  </div>
                  <span className="review__bar-value">
                    {formatMinutes(mins)}
                    {lastMins > 0 && (
                      <span className={mins >= lastMins ? "review__trend--up" : "review__trend--down"}>
                        {mins >= lastMins ? "\u2191" : "\u2193"}
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
        </div>
      )}

      {Object.keys(review.energyDist).length > 0 && (
        <div className="review__section">
          <div className="section-header">ENERGY DISTRIBUTION</div>
          <div className="review__pills">
            {Object.entries(review.energyDist)
              .sort(([, a], [, b]) => b - a)
              .map(([energy, count]) => (
                <span key={energy} className="review__energy-pill">{energy.split("/")[0]}: {count}</span>
              ))}
          </div>
        </div>
      )}

      {Object.keys(review.feelDist).length > 0 && (
        <div className="review__section">
          <div className="section-header">AFTER-FEEL PATTERNS</div>
          <div className="review__feels">
            {AFTER_FEELS.map((f) => {
              const count = review.feelDist[f.key] || 0;
              const pct = Math.round((count / totalFeels) * 100);
              return (
                <div key={f.key} className="review__feel-row">
                  <span className="review__feel-icon">{f.icon} {f.label}</span>
                  <div className="review__bar-track">
                    <div className="review__bar-fill review__bar-fill--feel" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="review__bar-value">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(review.longestWaiting.length > 0 || review.longestBlocked.length > 0) && (
        <div className="review__section">
          <div className="section-header">STALLED TICKETS</div>
          {review.longestWaiting.map((t) => (
            <div key={t.id} className="review__item">
              <span className="review__item-dot" style={{ background: "#eab308" }} />
              <span className="review__item-task">{t.task}</span>
              <span className="review__item-days">Waiting {getDaysInStatus(t)}d</span>
            </div>
          ))}
          {review.longestBlocked.map((t) => (
            <div key={t.id} className="review__item">
              <span className="review__item-dot" style={{ background: "#ef4444" }} />
              <span className="review__item-task">{t.task}</span>
              <span className="review__item-days">Blocked {getDaysInStatus(t)}d</span>
            </div>
          ))}
        </div>
      )}

      {review.neglected.length > 0 && (
        <div className="review__section">
          <div className="section-header">NEGLECTED PROJECTS</div>
          <div className="review__neglected">
            {review.neglected.map((p) => (
              <span key={p} className="review__neglected-pill">
                {PROJECTS[p]?.icon} {p.split(" ")[0]} — 0 hours
              </span>
            ))}
          </div>
        </div>
      )}

      {review.sessionCount === 0 && (
        <div className="empty-state">
          No sessions logged this week. Start a timer on an Actionable ticket to begin tracking.
        </div>
      )}
    </div>
  );
}
