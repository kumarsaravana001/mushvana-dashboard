import { useState, useEffect, useCallback } from "react";

const PROJECTS = {
  "MycoPacking": { color: "#2563eb", icon: "📦", priority: "70%" },
  "Mushroom Cultivation": { color: "#16a34a", icon: "🍄", priority: "Keep Alive" },
  "Spawn Lab": { color: "#9333ea", icon: "🧫", priority: "4-Day Burst" },
  "Functional Mushroom": { color: "#dc2626", icon: "💊", priority: "Setup April" },
  "Background": { color: "#6b7280", icon: "⚡", priority: "Running" },
};

const STATUS_CONFIG = {
  "Actionable": { bg: "#dcfce7", border: "#22c55e", text: "#166534", dot: "#22c55e" },
  "Waiting": { bg: "#fef9c3", border: "#eab308", text: "#854d0e", dot: "#eab308" },
  "Blocked": { bg: "#fce4ec", border: "#ef4444", text: "#991b1b", dot: "#ef4444" },
  "Done": { bg: "#f3f4f6", border: "#9ca3af", text: "#6b7280", dot: "#9ca3af" },
};

const ENERGY_ICONS = {
  "Deep Cognitive": "🧠",
  "Execution/Physical": "💪",
  "Shallow/Ops": "📱",
  "Exploratory": "🔍",
  "Any": "⭐",
};

const INITIAL_TICKETS = [
  { id: 1, project: "MycoPacking", task: "Call/WhatsApp IIP Chennai", depends: "", status: "Actionable", energy: "Shallow/Ops", priority: "High", note: "044-2496 0730 / 9382199089" },
  { id: 2, project: "MycoPacking", task: "Procure coco peat", depends: "", status: "Actionable", energy: "Execution/Physical", priority: "High", note: "Local agri supplier" },
  { id: 3, project: "MycoPacking", task: "Design mold #1 — 200ml bottle", depends: "", status: "Actionable", energy: "Deep Cognitive", priority: "High", note: "D50mm H150mm, two-part split" },
  { id: 4, project: "MycoPacking", task: "Design mold #2 — 500ml bottle", depends: "#1 done", status: "Waiting", energy: "Deep Cognitive", priority: "High", note: "D75mm H170mm" },
  { id: 5, project: "MycoPacking", task: "Design mold #3 — 750ml bottle", depends: "#2 done", status: "Waiting", energy: "Deep Cognitive", priority: "High", note: "D85mm H200mm" },
  { id: 6, project: "MycoPacking", task: "Design mold #4 — 1L bottle", depends: "#3 done", status: "Waiting", energy: "Deep Cognitive", priority: "High", note: "D90mm H250mm" },
  { id: 7, project: "MycoPacking", task: "Design mold #5 — 200ml wide jar", depends: "#4 done", status: "Waiting", energy: "Deep Cognitive", priority: "High", note: "D70mm H90mm" },
  { id: 8, project: "MycoPacking", task: "Design mold #6 — 50ml serum", depends: "#5 done", status: "Waiting", energy: "Deep Cognitive", priority: "Medium", note: "D35mm H90mm" },
  { id: 9, project: "MycoPacking", task: "Design mold #7 — 100ml lotion", depends: "#6 done", status: "Waiting", energy: "Deep Cognitive", priority: "Medium", note: "D40mm H110mm" },
  { id: 10, project: "MycoPacking", task: "Design mold #8 — 50ml cream jar", depends: "#7 done", status: "Waiting", energy: "Deep Cognitive", priority: "Medium", note: "D55mm H45mm" },
  { id: 11, project: "MycoPacking", task: "Design mold #9 — 30ml cosmetic jar", depends: "#8 done", status: "Waiting", energy: "Deep Cognitive", priority: "Medium", note: "D45mm H35mm" },
  { id: 12, project: "MycoPacking", task: "Design mold #10 — 250ml body wash", depends: "#9 done", status: "Waiting", energy: "Deep Cognitive", priority: "Medium", note: "D50mm H150mm" },
  { id: 13, project: "MycoPacking", task: "Print all 10 molds", depends: "All designs", status: "Blocked", energy: "Execution/Physical", priority: "High", note: "PLA filament" },
  { id: 14, project: "MycoPacking", task: "Prepare sawdust substrate", depends: "", status: "Actionable", energy: "Execution/Physical", priority: "High", note: "Material ready" },
  { id: 15, project: "MycoPacking", task: "Prepare rice husk substrate", depends: "", status: "Actionable", energy: "Execution/Physical", priority: "High", note: "Material ready" },
  { id: 16, project: "MycoPacking", task: "Prepare coco peat substrate", depends: "Coco peat bought", status: "Blocked", energy: "Execution/Physical", priority: "High", note: "" },
  { id: 17, project: "MycoPacking", task: "Inoculate all 30 combinations", depends: "Molds + substrates", status: "Blocked", energy: "Execution/Physical", priority: "High", note: "10 molds × 3 substrates" },
  { id: 18, project: "MycoPacking", task: "Contact patent agent", depends: "", status: "Actionable", energy: "Shallow/Ops", priority: "Medium", note: "₹5K provisional via TBI/EDII" },
  { id: 19, project: "MycoPacking", task: "Demold samples", depends: "Colonization 5-15d", status: "Blocked", energy: "Execution/Physical", priority: "High", note: "Biology timeline" },
  { id: 20, project: "MycoPacking", task: "Dry + heat-kill samples", depends: "Demolded", status: "Blocked", energy: "Execution/Physical", priority: "High", note: "" },
  { id: 21, project: "MycoPacking", task: "Weigh samples vs styrofoam", depends: "Dried", status: "Blocked", energy: "Deep Cognitive", priority: "High", note: "Must be lighter" },
  { id: 22, project: "MycoPacking", task: "Document results", depends: "Weighed", status: "Blocked", energy: "Shallow/Ops", priority: "Medium", note: "Photos + data" },
  { id: 23, project: "MycoPacking", task: "Submit to IIP Chennai", depends: "Documented", status: "Blocked", energy: "Shallow/Ops", priority: "High", note: "" },
  { id: 24, project: "MycoPacking", task: "Complete patent filing", depends: "Agent contacted", status: "Blocked", energy: "Deep Cognitive", priority: "Medium", note: "₹5K" },
  { id: 25, project: "MycoPacking", task: "Complete grant accounts", depends: "", status: "Actionable", energy: "Shallow/Ops", priority: "Medium", note: "" },
  { id: 26, project: "MycoPacking", task: "Present to TBI — D2C + B2B pivot", depends: "IIP results", status: "Blocked", energy: "Deep Cognitive", priority: "High", note: "Request extension" },
  { id: 27, project: "Mushroom Cultivation", task: "Fix electrical connection — Shed 1", depends: "", status: "Actionable", energy: "Shallow/Ops", priority: "High", note: "One call" },
  { id: 28, project: "Mushroom Cultivation", task: "Fix water connection — Shed 1", depends: "", status: "Actionable", energy: "Execution/Physical", priority: "High", note: "" },
  { id: 29, project: "Mushroom Cultivation", task: "Brief workers on plan", depends: "", status: "Actionable", energy: "Shallow/Ops", priority: "Medium", note: "" },
  { id: 30, project: "Mushroom Cultivation", task: "Check 40kg spawn viability", depends: "", status: "Actionable", energy: "Deep Cognitive", priority: "High", note: "In spawn lab" },
  { id: 31, project: "Mushroom Cultivation", task: "Start cultivation on Shed 1", depends: "Electric+water+spawn", status: "Blocked", energy: "Execution/Physical", priority: "High", note: "" },
  { id: 32, project: "Mushroom Cultivation", task: "Research polyhouse for Shed 2", depends: "", status: "Actionable", energy: "Deep Cognitive", priority: "Medium", note: "" },
  { id: 33, project: "Mushroom Cultivation", task: "Get quotes — polyhouse, honeycomb, fan", depends: "", status: "Actionable", energy: "Shallow/Ops", priority: "Medium", note: "IndiaMART" },
  { id: 34, project: "Mushroom Cultivation", task: "Plan sensor integration", depends: "Polyhouse research", status: "Waiting", energy: "Deep Cognitive", priority: "Low", note: "YC data" },
  { id: 35, project: "Mushroom Cultivation", task: "Create RKVY line-item budget", depends: "", status: "Actionable", energy: "Deep Cognitive", priority: "Medium", note: "" },
  { id: 36, project: "Spawn Lab", task: "Audit ALL cultures and plates", depends: "", status: "Actionable", energy: "Deep Cognitive", priority: "High", note: "Day 1-2" },
  { id: 37, project: "Spawn Lab", task: "Log into digital tracker", depends: "Audit", status: "Blocked", energy: "Shallow/Ops", priority: "High", note: "Spreadsheet ready" },
  { id: 38, project: "Spawn Lab", task: "Prepare fresh oyster spawn", depends: "Audit", status: "Blocked", energy: "Execution/Physical", priority: "High", note: "Day 3" },
  { id: 39, project: "Spawn Lab", task: "Organize new strains", depends: "Audit", status: "Blocked", energy: "Deep Cognitive", priority: "Medium", note: "Day 4" },
  { id: 40, project: "Spawn Lab", task: "Order liquid culture supplies", depends: "", status: "Actionable", energy: "Shallow/Ops", priority: "Low", note: "Procurement only" },
  { id: 41, project: "Functional Mushroom", task: "Clean 10x10 room", depends: "", status: "Actionable", energy: "Execution/Physical", priority: "Medium", note: "" },
  { id: 42, project: "Functional Mushroom", task: "Budget AC + humidifier", depends: "", status: "Actionable", energy: "Deep Cognitive", priority: "Medium", note: "~₹25-35K from RKVY" },
  { id: 43, project: "Functional Mushroom", task: "Confirm RKVY covers AC room", depends: "Budget", status: "Waiting", energy: "Shallow/Ops", priority: "Medium", note: "" },
  { id: 44, project: "Functional Mushroom", task: "Purchase + install AC", depends: "Confirmed", status: "Blocked", energy: "Execution/Physical", priority: "High", note: "" },
  { id: 45, project: "Functional Mushroom", task: "Prepare medicinal spawn", depends: "Lab audit", status: "Blocked", energy: "Execution/Physical", priority: "High", note: "Ready by end April" },
  { id: 46, project: "Functional Mushroom", task: "Inoculate 25 tubs", depends: "Room+spawn", status: "Blocked", energy: "Execution/Physical", priority: "High", note: "May start" },
  { id: 47, project: "Background", task: "Daily B2B validation — Shashank", depends: "", status: "Actionable", energy: "Shallow/Ops", priority: "High", note: "Ongoing daily" },
  { id: 48, project: "Background", task: "LinkedIn outreach", depends: "", status: "Actionable", energy: "Shallow/Ops", priority: "Medium", note: "B2B validation" },
  { id: 49, project: "Background", task: "Cosmetics — wait for chemist", depends: "", status: "Waiting", energy: "Any", priority: "Low", note: "Zero dependency on you" },
];

export default function MushvanaDashboard() {
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [view, setView] = useState("overview");
  const [filterProject, setFilterProject] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterEnergy, setFilterEnergy] = useState("All");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get("mushvana-tickets");
        if (result && result.value) {
          setTickets(JSON.parse(result.value));
        }
      } catch (e) {}
      setLoaded(true);
    })();
  }, []);

  const saveTickets = useCallback(async (newTickets) => {
    setTickets(newTickets);
    try {
      await window.storage.set("mushvana-tickets", JSON.stringify(newTickets));
    } catch (e) {}
  }, []);

  const updateStatus = (id, newStatus) => {
    const updated = tickets.map(t => t.id === id ? { ...t, status: newStatus } : t);
    saveTickets(updated);
  };

  const getStats = (proj) => {
    const t = proj === "All" ? tickets : tickets.filter(t => t.project === proj);
    return {
      total: t.length,
      actionable: t.filter(x => x.status === "Actionable").length,
      waiting: t.filter(x => x.status === "Waiting").length,
      blocked: t.filter(x => x.status === "Blocked").length,
      done: t.filter(x => x.status === "Done").length,
    };
  };

  const filteredTickets = tickets.filter(t => {
    if (filterProject !== "All" && t.project !== filterProject) return false;
    if (filterStatus !== "All" && t.status !== filterStatus) return false;
    if (filterEnergy !== "All" && t.energy !== filterEnergy) return false;
    return true;
  });

  const actionableNow = tickets.filter(t => t.status === "Actionable");

  if (!loaded) return <div style={{ padding: 40, textAlign: "center", fontFamily: "system-ui", color: "#666" }}>Loading...</div>;

  return (
    <div style={{ fontFamily: "'Outfit', system-ui, sans-serif", background: "#0f172a", minHeight: "100vh", color: "#e2e8f0", padding: 0, margin: 0 }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: "#f8fafc", letterSpacing: "-0.5px" }}>MUSHVANA</h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>Open Tickets Dashboard — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>

        {/* View tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { key: "overview", label: "Overview" },
            { key: "actionable", label: `⚡ Do Now (${actionableNow.length})` },
            { key: "all", label: "All Tickets" },
          ].map(v => (
            <button key={v.key} onClick={() => setView(v.key)}
              style={{
                padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 500, fontFamily: "inherit", transition: "all 0.2s",
                background: view === v.key ? "#3b82f6" : "#1e293b",
                color: view === v.key ? "#fff" : "#94a3b8",
              }}>
              {v.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {view === "overview" && (
          <div>
            {/* Global stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>
              {[
                { label: "Actionable", val: getStats("All").actionable, color: "#22c55e" },
                { label: "Waiting", val: getStats("All").waiting, color: "#eab308" },
                { label: "Blocked", val: getStats("All").blocked, color: "#ef4444" },
                { label: "Done", val: getStats("All").done, color: "#6b7280" },
              ].map(s => (
                <div key={s.label} style={{ background: "#1e293b", borderRadius: 12, padding: "14px 12px", textAlign: "center", borderLeft: `3px solid ${s.color}` }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Per-project */}
            {Object.entries(PROJECTS).map(([name, config]) => {
              const stats = getStats(name);
              const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
              return (
                <div key={name} style={{ background: "#1e293b", borderRadius: 12, padding: 16, marginBottom: 10, borderLeft: `4px solid ${config.color}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div>
                      <span style={{ fontSize: 16 }}>{config.icon}</span>
                      <span style={{ fontSize: 15, fontWeight: 600, marginLeft: 8, color: "#f1f5f9" }}>{name}</span>
                      <span style={{ fontSize: 11, color: "#64748b", marginLeft: 10, background: "#0f172a", padding: "2px 8px", borderRadius: 4 }}>{config.priority}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: config.color }}>{pct}%</span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: 6, background: "#0f172a", borderRadius: 3, overflow: "hidden", display: "flex" }}>
                    <div style={{ width: `${stats.total > 0 ? (stats.done/stats.total)*100 : 0}%`, background: "#6b7280", transition: "width 0.3s" }} />
                    <div style={{ width: `${stats.total > 0 ? (stats.actionable/stats.total)*100 : 0}%`, background: "#22c55e", transition: "width 0.3s" }} />
                    <div style={{ width: `${stats.total > 0 ? (stats.waiting/stats.total)*100 : 0}%`, background: "#eab308", transition: "width 0.3s" }} />
                    <div style={{ width: `${stats.total > 0 ? (stats.blocked/stats.total)*100 : 0}%`, background: "#ef4444", transition: "width 0.3s" }} />
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                    {[
                      { l: "Go", v: stats.actionable, c: "#22c55e" },
                      { l: "Wait", v: stats.waiting, c: "#eab308" },
                      { l: "Block", v: stats.blocked, c: "#ef4444" },
                      { l: "Done", v: stats.done, c: "#6b7280" },
                    ].map(x => (
                      <span key={x.l} style={{ fontSize: 11, color: x.c }}>
                        <span style={{ fontWeight: 600 }}>{x.v}</span> {x.l}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ACTIONABLE NOW */}
        {view === "actionable" && (
          <div>
            <div style={{ background: "#1e293b", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
                🧠 Sharp & focused → pick <b>Deep Cognitive</b>&nbsp;&nbsp;
                💪 Physical energy → pick <b>Execution</b>&nbsp;&nbsp;
                📱 Tired → pick <b>Shallow/Ops</b>&nbsp;&nbsp;
                😴 Drained → <b style={{ color: "#ef4444" }}>STOP & REST</b>
              </p>
            </div>
            {actionableNow.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>
                Nothing actionable right now. Check if any Waiting/Blocked items have unblocked.
              </div>
            ) : (
              actionableNow.map(t => (
                <TicketCard key={t.id} ticket={t} onStatusChange={updateStatus} />
              ))
            )}
          </div>
        )}

        {/* ALL TICKETS */}
        {view === "all" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              <select value={filterProject} onChange={e => setFilterProject(e.target.value)}
                style={{ ...selectStyle }}>
                <option value="All">All Projects</option>
                {Object.keys(PROJECTS).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                style={{ ...selectStyle }}>
                <option value="All">All Status</option>
                {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={filterEnergy} onChange={e => setFilterEnergy(e.target.value)}
                style={{ ...selectStyle }}>
                <option value="All">All Energy</option>
                {Object.keys(ENERGY_ICONS).map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>{filteredTickets.length} tickets</div>
            {filteredTickets.map(t => (
              <TicketCard key={t.id} ticket={t} onStatusChange={updateStatus} />
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "24px 0 12px", color: "#334155", fontSize: 11 }}>
          Sorted March 28, 2026 — Update statuses as you complete work
        </div>
      </div>
    </div>
  );
}

const selectStyle = {
  padding: "7px 12px", borderRadius: 8, border: "1px solid #334155",
  background: "#1e293b", color: "#e2e8f0", fontSize: 12, fontFamily: "inherit",
  cursor: "pointer", outline: "none",
};

function TicketCard({ ticket, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const config = STATUS_CONFIG[ticket.status];
  const projConfig = PROJECTS[ticket.project];
  const statusCycle = ["Actionable", "Waiting", "Blocked", "Done"];

  return (
    <div onClick={() => setExpanded(!expanded)}
      style={{
        background: "#1e293b", borderRadius: 10, padding: "12px 14px",
        marginBottom: 6, cursor: "pointer", borderLeft: `3px solid ${projConfig.color}`,
        transition: "all 0.15s",
      }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: projConfig.color }}>{projConfig.icon} {ticket.project}</span>
            {ticket.priority === "High" && <span style={{ fontSize: 9, background: "#7f1d1d", color: "#fca5a5", padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>HIGH</span>}
            <span style={{ fontSize: 11, color: "#64748b" }}>{ENERGY_ICONS[ticket.energy]} {ticket.energy}</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#f1f5f9", lineHeight: 1.3 }}>{ticket.task}</div>
        </div>
        <div onClick={e => { e.stopPropagation(); }} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <select value={ticket.status}
            onChange={e => onStatusChange(ticket.id, e.target.value)}
            style={{
              padding: "4px 8px", borderRadius: 6, border: "none", fontSize: 11, fontWeight: 600,
              fontFamily: "inherit", cursor: "pointer",
              background: config.bg, color: config.text,
            }}>
            {statusCycle.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      {expanded && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #334155" }}>
          {ticket.depends && (
            <div style={{ fontSize: 12, color: "#f59e0b", marginBottom: 4 }}>
              ⛓️ Depends on: {ticket.depends}
            </div>
          )}
          {ticket.note && (
            <div style={{ fontSize: 12, color: "#94a3b8" }}>
              📝 {ticket.note}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
