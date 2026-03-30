import { useState, useMemo, useRef } from "react";
import { PROJECTS, STATUS_COLORS } from "../constants";
import { useTickets } from "../context/TicketContext";
import { WORKSTREAM_MAP, DEFAULT_MILESTONES } from "../data/timeline";

const ROW_H = 40;
const LEFT_W = 140;
const DAY_W = 22;
const NODE_R = 7;
const HEADER_H = 36;
const PROJECT_H = 30;

function daysBetween(a, b) {
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

function computeDepths(tickets) {
  const cache = {};
  function depth(id) {
    if (cache[id] !== undefined) return cache[id];
    const t = tickets.find((x) => x.id === id);
    if (!t || !t.depends_on || t.depends_on.length === 0) {
      cache[id] = 0;
      return 0;
    }
    cache[id] = Math.max(...t.depends_on.map((d) => depth(d))) + 1;
    return cache[id];
  }
  tickets.forEach((t) => depth(t.id));
  return cache;
}

export default function TimelineView() {
  const { tickets, milestones } = useTickets();
  const [filterProject, setFilterProject] = useState("All");
  const [tooltip, setTooltip] = useState(null);
  const scrollRef = useRef(null);

  const data = useMemo(() => {
    const depths = computeDepths(tickets);
    const baseDate = new Date("2026-03-28");
    const maxDepth = Math.max(...Object.values(depths), 0);
    const filtered = filterProject === "All" ? tickets : tickets.filter((t) => t.project === filterProject);

    // Group by project -> workstream
    const projectGroups = {};
    filtered.forEach((t) => {
      const ws = WORKSTREAM_MAP[t.id] || "General";
      if (!projectGroups[t.project]) projectGroups[t.project] = {};
      if (!projectGroups[t.project][ws]) projectGroups[t.project][ws] = [];
      projectGroups[t.project][ws].push({
        ...t,
        depth: depths[t.id] || 0,
      });
    });

    // Sort tasks within workstreams by depth
    Object.values(projectGroups).forEach((wss) => {
      Object.values(wss).forEach((tasks) => {
        tasks.sort((a, b) => a.depth - b.depth);
      });
    });

    // Build rows
    const rows = [];
    const projectOrder = Object.keys(PROJECTS);
    projectOrder.forEach((proj) => {
      if (!projectGroups[proj]) return;
      rows.push({ type: "project", project: proj });
      const workstreams = Object.keys(projectGroups[proj]).sort();
      workstreams.forEach((ws) => {
        rows.push({ type: "workstream", project: proj, workstream: ws, tasks: projectGroups[proj][ws] });
      });
    });

    // Milestones
    const ms = (milestones || DEFAULT_MILESTONES).filter(
      (m) => filterProject === "All" || m.project === filterProject
    );

    const totalDays = (maxDepth + 1) * 3 + 21;
    const weeks = Math.ceil(totalDays / 7);

    return { rows, milestones: ms, baseDate, totalDays, weeks };
  }, [tickets, milestones, filterProject]);

  // Compute node positions (including sub-offsets for same-depth tasks)
  const nodePositions = useMemo(() => {
    const pos = {};
    let y = HEADER_H;
    data.rows.forEach((row) => {
      if (row.type === "project") {
        y += PROJECT_H;
      } else {
        const rowY = y + ROW_H / 2;
        // Group by depth to offset same-depth tasks
        const byDepth = {};
        row.tasks.forEach((t) => {
          if (!byDepth[t.depth]) byDepth[t.depth] = [];
          byDepth[t.depth].push(t);
        });
        Object.values(byDepth).forEach((group) => {
          group.forEach((t, subIdx) => {
            const x = LEFT_W + t.depth * 3 * DAY_W + DAY_W + subIdx * DAY_W * 1.5;
            pos[t.id] = { x, y: rowY };
          });
        });
        y += ROW_H;
      }
    });
    return pos;
  }, [data.rows]);

  // Dimensions
  const contentH = data.rows.reduce((h, r) => h + (r.type === "project" ? PROJECT_H : ROW_H), 0) + HEADER_H + 20;
  const contentW = LEFT_W + data.totalDays * DAY_W + 60;

  // Today marker
  const today = new Date();
  const todayOffset = daysBetween(data.baseDate, today);
  const todayX = LEFT_W + todayOffset * DAY_W;

  return (
    <div className="timeline">
      <div className="timeline__top">
        <h2 className="timeline__title">Timeline</h2>
      </div>
      <div className="timeline__filters">
        {["All", ...Object.keys(PROJECTS)].map((p) => (
          <button
            key={p}
            className={`filter-pill ${filterProject === p ? "filter-pill--active" : ""}`}
            onClick={() => setFilterProject(p)}
          >
            {p === "All" ? "All" : (PROJECTS[p]?.icon || "") + " " + p.split(" ")[0]}
          </button>
        ))}
      </div>

      <div className="timeline__scroll" ref={scrollRef}>
        <svg width={contentW} height={contentH} className="timeline__svg">
          {/* Background for left labels */}
          <rect x={0} y={0} width={LEFT_W} height={contentH} fill="var(--bg-page)" />

          {/* Week grid lines + labels */}
          {Array.from({ length: data.weeks + 2 }, (_, i) => {
            const x = LEFT_W + i * 7 * DAY_W;
            const date = new Date(data.baseDate);
            date.setDate(date.getDate() + i * 7);
            const label = `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
            return (
              <g key={i}>
                <line x1={x} y1={HEADER_H} x2={x} y2={contentH} stroke="var(--border-sep)" strokeWidth="1" />
                <text x={x + 3} y={HEADER_H - 8} fill="var(--text-tertiary)" fontSize="10" fontFamily="inherit">{label}</text>
              </g>
            );
          })}

          {/* Today marker */}
          {todayOffset >= 0 && todayOffset <= data.totalDays && (
            <g>
              <line x1={todayX} y1={HEADER_H} x2={todayX} y2={contentH} stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" />
              <rect x={todayX - 18} y={HEADER_H - 18} width={36} height={14} rx={3} fill="#ef4444" />
              <text x={todayX} y={HEADER_H - 8} fill="#fff" fontSize="9" fontWeight="600" textAnchor="middle" fontFamily="inherit">Today</text>
            </g>
          )}

          {/* Milestone markers */}
          {data.milestones.map((m) => {
            const mDate = new Date(m.target_date);
            const offset = daysBetween(data.baseDate, mDate);
            const mx = LEFT_W + offset * DAY_W;
            if (mx < LEFT_W || mx > contentW) return null;
            return (
              <g key={m.id}>
                <line x1={mx} y1={HEADER_H} x2={mx} y2={contentH} stroke={m.color || "#eab308"} strokeWidth="1" strokeDasharray="6 3" opacity="0.4" />
                <polygon
                  points={`${mx},${HEADER_H + 2} ${mx + 7},${HEADER_H + 11} ${mx},${HEADER_H + 20} ${mx - 7},${HEADER_H + 11}`}
                  fill={m.color || "#eab308"}
                  opacity="0.8"
                />
                <text x={mx + 10} y={HEADER_H + 15} fill={m.color || "#eab308"} fontSize="9" fontWeight="500" fontFamily="inherit">{m.title}</text>
              </g>
            );
          })}

          {/* Dependency lines */}
          {data.rows.map((row) => {
            if (row.type !== "workstream") return null;
            return row.tasks.map((t) =>
              (t.depends_on || []).map((depId) => {
                const from = nodePositions[depId];
                const to = nodePositions[t.id];
                if (!from || !to) return null;
                // Curved path
                const dx = to.x - from.x;
                const dy = to.y - from.y;
                const cx1 = from.x + dx * 0.4;
                const cy1 = from.y;
                const cx2 = from.x + dx * 0.6;
                const cy2 = to.y;
                return (
                  <path
                    key={`${depId}-${t.id}`}
                    d={`M${from.x + NODE_R},${from.y} C${cx1},${cy1} ${cx2},${cy2} ${to.x - NODE_R},${to.y}`}
                    fill="none"
                    stroke="var(--border-input)"
                    strokeWidth="1.5"
                    opacity="0.4"
                  />
                );
              })
            );
          })}

          {/* Rows: project headers + workstream rows */}
          {(() => {
            let y = HEADER_H;
            return data.rows.map((row, i) => {
              if (row.type === "project") {
                const rowY = y;
                y += PROJECT_H;
                return (
                  <g key={`p-${i}`}>
                    <rect x={0} y={rowY} width={contentW} height={PROJECT_H} fill="var(--bg-surface)" opacity="0.6" />
                    <text x={12} y={rowY + 20} fill="var(--text-primary)" fontSize="12" fontWeight="600" fontFamily="inherit">
                      {PROJECTS[row.project]?.icon} {row.project}
                    </text>
                  </g>
                );
              }
              const rowY = y;
              y += ROW_H;
              return (
                <g key={`w-${i}`}>
                  {/* Alternating row background */}
                  {i % 2 === 0 && <rect x={LEFT_W} y={rowY} width={contentW - LEFT_W} height={ROW_H} fill="var(--bg-surface)" opacity="0.15" />}

                  {/* Workstream label */}
                  <text x={24} y={rowY + ROW_H / 2 + 4} fill="var(--text-secondary)" fontSize="11" fontFamily="inherit">
                    {row.workstream}
                  </text>

                  {/* Task nodes */}
                  {row.tasks.map((t) => {
                    const p = nodePositions[t.id];
                    if (!p) return null;
                    const color = STATUS_COLORS[t.status] || "#9b9a97";
                    const isDone = t.status === "Done";
                    return (
                      <g
                        key={t.id}
                        onMouseEnter={(e) => {
                          const rect = scrollRef.current?.getBoundingClientRect();
                          setTooltip({
                            text: t.task,
                            status: t.status,
                            x: e.clientX - (rect?.left || 0),
                            y: e.clientY - (rect?.top || 0) - 40,
                          });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        style={{ cursor: "pointer" }}
                      >
                        <circle
                          cx={p.x} cy={p.y} r={NODE_R}
                          fill={color}
                          opacity={isDone ? 0.35 : 0.9}
                        />
                        {t.priority === "High" && (
                          <circle
                            cx={p.x} cy={p.y} r={NODE_R + 2}
                            fill="none" stroke={color} strokeWidth="1.5" opacity="0.5"
                          />
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            });
          })()}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="timeline__tooltip"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <span className="timeline__tooltip-status" style={{ color: STATUS_COLORS[tooltip.status] }}>{tooltip.status}</span>
            {" "}{tooltip.text}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="timeline__legend">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <span key={status} className="dep-legend__item">
            <span className="dep-legend__dot" style={{ background: color }} />
            {status}
          </span>
        ))}
        <span className="dep-legend__item">
          <span style={{ width: 12, height: 2, background: "#ef4444", display: "inline-block", marginRight: 4 }} />
          Today
        </span>
        <span className="dep-legend__item">
          <span style={{ fontSize: 12 }}>{"\u25C6"}</span>
          {" "}Milestone
        </span>
      </div>
    </div>
  );
}
