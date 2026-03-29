import { useState } from "react";
import { PROJECTS } from "../constants";
import { useTickets } from "../context/TicketContext";
import Modal from "./Modal";

export default function MissionSection() {
  const { missions, tickets, addMission, updateMission, deleteMission } = useTickets();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [linkedProjects, setLinkedProjects] = useState([]);

  const activeMissions = missions.filter((m) => m.status === "active");
  const archivedMissions = missions.filter((m) => m.status !== "active");

  const getMissionProgress = (mission) => {
    if (!mission.projects || mission.projects.length === 0) return 0;
    let total = 0, done = 0;
    tickets.forEach((t) => {
      if (mission.projects.includes(t.project)) {
        total++;
        if (t.status === "Done") done++;
      }
    });
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  const openAdd = () => {
    setEditId(null);
    setTitle("");
    setDescription("");
    setTargetDate("");
    setLinkedProjects([]);
    setShowForm(true);
  };

  const openEdit = (m) => {
    setEditId(m.id);
    setTitle(m.title);
    setDescription(m.description || "");
    setTargetDate(m.target_date || "");
    setLinkedProjects(m.projects || []);
    setShowForm(true);
  };

  const handleSave = () => {
    const data = { title, description, target_date: targetDate, projects: linkedProjects };
    if (editId) updateMission(editId, data);
    else addMission(data);
    setShowForm(false);
  };

  const toggleProject = (name) => {
    setLinkedProjects((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  };

  return (
    <div className="mission-section">
      <div className="mission-section__header">
        <span className="section-header" style={{ margin: 0 }}>MISSIONS</span>
        <button className="mission-section__add" onClick={openAdd}>+</button>
      </div>

      {activeMissions.length === 0 && (
        <div className="mission-empty">No active missions. Add one to connect daily work to your goals.</div>
      )}

      {activeMissions.map((m) => {
        const pct = getMissionProgress(m);
        return (
          <div key={m.id} className="mission-card" onClick={() => openEdit(m)}>
            <div className="mission-card__top">
              <div className="mission-card__title">{m.title}</div>
              <span className="mission-card__pct">{pct}%</span>
            </div>
            {m.description && <div className="mission-card__desc">{m.description}</div>}
            <div className="mission-card__meta">
              {(m.projects || []).map((p) => (
                <span key={p} className="mission-card__proj" style={{ color: PROJECTS[p]?.color }}>
                  {PROJECTS[p]?.icon} {p.split(" ")[0]}
                </span>
              ))}
              {m.target_date && <span className="mission-card__date">{m.target_date}</span>}
            </div>
            <div className="progress-bar" style={{ marginTop: 8 }}>
              <div className="progress-bar__segment" style={{ width: `${pct}%`, background: "var(--accent)" }} />
            </div>
            {pct >= 90 && (
              <button
                className="mission-card__complete"
                onClick={(e) => { e.stopPropagation(); updateMission(m.id, { status: "completed" }); }}
              >
                Mark Complete
              </button>
            )}
          </div>
        );
      })}

      {archivedMissions.length > 0 && (
        <details className="mission-archive">
          <summary className="mission-archive__toggle">{archivedMissions.length} completed mission{archivedMissions.length !== 1 ? "s" : ""}</summary>
          {archivedMissions.map((m) => (
            <div key={m.id} className="mission-card mission-card--done">
              <div className="mission-card__title">{m.title}</div>
            </div>
          ))}
        </details>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editId ? "Edit Mission" : "Add Mission"}>
        <div className="ticket-form">
          <div className="ticket-form__field">
            <label className="ticket-form__label">Title</label>
            <input className="ticket-form__input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. First B2B revenue by June" />
          </div>
          <div className="ticket-form__field">
            <label className="ticket-form__label">Description</label>
            <textarea className="ticket-form__input ticket-form__textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="ticket-form__field">
            <label className="ticket-form__label">Target Date</label>
            <input className="ticket-form__input" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
          </div>
          <div className="ticket-form__field">
            <label className="ticket-form__label">Linked Projects</label>
            <div className="mission-form__projects">
              {Object.entries(PROJECTS).map(([name, config]) => (
                <button
                  key={name}
                  type="button"
                  className={`filter-pill ${linkedProjects.includes(name) ? "filter-pill--active" : ""}`}
                  onClick={() => toggleProject(name)}
                >
                  {config.icon} {name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
          <div className="ticket-form__actions">
            {editId && (
              <button
                className="ticket-form__btn ticket-form__btn--cancel"
                style={{ color: "#ef4444" }}
                onClick={() => { deleteMission(editId); setShowForm(false); }}
              >
                Delete
              </button>
            )}
            <button className="ticket-form__btn ticket-form__btn--cancel" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="ticket-form__btn ticket-form__btn--save" onClick={handleSave} disabled={!title.trim()}>Save</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
