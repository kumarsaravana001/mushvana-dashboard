import { useState, useMemo } from "react";
import { PROJECTS, STATUS_COLORS } from "../constants";
import { useTickets } from "../context/TicketContext";
import { topoLayers, getBlockerChain } from "../utils/depGraph";

const NODE_W = 180;
const NODE_H = 40;
const GAP_X = 20;
const GAP_Y = 60;
const PAD = 20;

export default function DependencyView() {
  const { tickets } = useTickets();
  const projectNames = Object.keys(PROJECTS);
  const [activeProject, setActiveProject] = useState(projectNames[0]);
  const [highlighted, setHighlighted] = useState(new Set());

  const projectTickets = useMemo(
    () => tickets.filter((t) => t.project === activeProject),
    [tickets, activeProject]
  );

  const { layers, ticketMap, rev } = useMemo(
    () => topoLayers(projectTickets),
    [projectTickets]
  );

  const maxCols = Math.max(...layers.map((l) => l.length), 1);
  const svgW = Math.max(maxCols * (NODE_W + GAP_X) + PAD, 300);
  const svgH = layers.length * (NODE_H + GAP_Y) + PAD * 2;

  const nodePositions = {};
  layers.forEach((layer, row) => {
    const totalW = layer.length * NODE_W + (layer.length - 1) * GAP_X;
    const startX = (svgW - totalW) / 2;
    layer.forEach((id, col) => {
      nodePositions[id] = {
        x: startX + col * (NODE_W + GAP_X),
        y: PAD + row * (NODE_H + GAP_Y),
      };
    });
  });

  const edges = [];
  projectTickets.forEach((t) => {
    (t.depends_on || []).forEach((depId) => {
      if (nodePositions[depId] && nodePositions[t.id]) {
        edges.push({ from: depId, to: t.id });
      }
    });
  });

  const handleNodeClick = (id) => {
    const ticket = ticketMap[id];
    if (ticket && (ticket.status === "Blocked" || ticket.status === "Waiting")) {
      const chain = getBlockerChain(id, rev);
      setHighlighted(chain);
    } else {
      setHighlighted(new Set());
    }
  };

  return (
    <div>
      <div className="dep-tabs">
        {projectNames.map((name) => (
          <button
            key={name}
            className={`dep-tabs__btn ${activeProject === name ? "dep-tabs__btn--active" : ""}`}
            onClick={() => { setActiveProject(name); setHighlighted(new Set()); }}
          >
            {PROJECTS[name].icon} {name.split(" ")[0]}
          </button>
        ))}
      </div>

      {projectTickets.length === 0 ? (
        <div className="empty-state">No tickets in this project.</div>
      ) : (
        <div className="dep-graph-wrapper">
          <svg className="dep-graph" width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" className="dep-arrow" />
              </marker>
              <marker id="arrow-hl" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
              </marker>
            </defs>

            {edges.map(({ from, to }, i) => {
              const f = nodePositions[from];
              const t = nodePositions[to];
              const isHl = highlighted.has(from) && highlighted.has(to);
              return (
                <line
                  key={i}
                  x1={f.x + NODE_W / 2} y1={f.y + NODE_H}
                  x2={t.x + NODE_W / 2} y2={t.y}
                  className={`dep-edge ${isHl ? "dep-edge--highlighted" : ""}`}
                  markerEnd={`url(#${isHl ? "arrow-hl" : "arrow"})`}
                />
              );
            })}

            {Object.entries(nodePositions).map(([id, pos]) => {
              const ticket = ticketMap[id];
              if (!ticket) return null;
              const color = STATUS_COLORS[ticket.status];
              const isHl = highlighted.has(id);
              const label = ticket.task.length > 22 ? ticket.task.slice(0, 20) + "\u2026" : ticket.task;
              return (
                <g key={id} onClick={() => handleNodeClick(id)} style={{ cursor: "pointer" }}>
                  <rect
                    x={pos.x} y={pos.y} width={NODE_W} height={NODE_H} rx={6}
                    className={`dep-node ${isHl ? "dep-node--highlighted" : ""}`}
                    style={{ fill: "var(--bg-card)", stroke: color, strokeWidth: isHl ? 2.5 : 1.5 }}
                  />
                  <line
                    x1={pos.x} y1={pos.y} x2={pos.x} y2={pos.y + NODE_H}
                    style={{ stroke: color, strokeWidth: 3 }}
                  />
                  <text x={pos.x + NODE_W / 2} y={pos.y + NODE_H / 2 + 1}
                    textAnchor="middle" dominantBaseline="middle"
                    style={{ fill: "var(--text-primary)" }}
                    fontSize={12} fontFamily="Inter, system-ui"
                  >
                    {label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      <div className="dep-legend">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <span key={status} className="dep-legend__item">
            <span className="dep-legend__dot" style={{ background: color }} />
            {status}
          </span>
        ))}
        <span className="dep-legend__hint">Tap a blocked ticket to highlight its chain</span>
      </div>
    </div>
  );
}
