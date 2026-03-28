import { useState } from "react";
import { PROJECTS, STATUSES, ENERGIES, PRIORITIES } from "../constants";
import { useTickets } from "../context/TicketContext";

export default function TicketForm({ ticket, onSave, onCancel }) {
  const { tickets } = useTickets();
  const [form, setForm] = useState({
    project: ticket?.project || Object.keys(PROJECTS)[0],
    task: ticket?.task || "",
    status: ticket?.status || "Actionable",
    energy: ticket?.energy || "Deep Cognitive",
    priority: ticket?.priority || "Medium",
    depends_on: ticket?.depends_on || [],
    blocker_note: ticket?.blocker_note || "",
    note: ticket?.note || "",
  });
  const [depSearch, setDepSearch] = useState("");

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const toggleDep = (id) => {
    set("depends_on",
      form.depends_on.includes(id)
        ? form.depends_on.filter((d) => d !== id)
        : [...form.depends_on, id]
    );
  };

  const otherTickets = tickets.filter((t) => t.id !== ticket?.id);
  const filteredDeps = depSearch
    ? otherTickets.filter((t) => t.task.toLowerCase().includes(depSearch.toLowerCase()))
    : otherTickets;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.task.trim()) return;
    onSave(form);
  };

  return (
    <form className="ticket-form" onSubmit={handleSubmit}>
      <div className="ticket-form__field">
        <label className="ticket-form__label">Project</label>
        <select className="ticket-form__input" value={form.project} onChange={(e) => set("project", e.target.value)}>
          {Object.keys(PROJECTS).map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="ticket-form__field">
        <label className="ticket-form__label">Task *</label>
        <input className="ticket-form__input" type="text" value={form.task} onChange={(e) => set("task", e.target.value)} placeholder="Task description" required />
      </div>

      <div className="ticket-form__row">
        <div className="ticket-form__field">
          <label className="ticket-form__label">Status</label>
          <select className="ticket-form__input" value={form.status} onChange={(e) => set("status", e.target.value)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="ticket-form__field">
          <label className="ticket-form__label">Energy</label>
          <select className="ticket-form__input" value={form.energy} onChange={(e) => set("energy", e.target.value)}>
            {ENERGIES.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div className="ticket-form__field">
          <label className="ticket-form__label">Priority</label>
          <select className="ticket-form__input" value={form.priority} onChange={(e) => set("priority", e.target.value)}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="ticket-form__field">
        <label className="ticket-form__label">Depends On ({form.depends_on.length})</label>
        <input className="ticket-form__input" type="text" value={depSearch} onChange={(e) => setDepSearch(e.target.value)} placeholder="Search tickets..." />
        <div className="ticket-form__deps">
          {filteredDeps.slice(0, 20).map((t) => (
            <label key={t.id} className="ticket-form__dep-item">
              <input type="checkbox" checked={form.depends_on.includes(t.id)} onChange={() => toggleDep(t.id)} />
              <span className="ticket-form__dep-project" style={{ color: PROJECTS[t.project]?.color }}>{PROJECTS[t.project]?.icon}</span>
              <span>{t.task}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="ticket-form__field">
        <label className="ticket-form__label">Blocker Note</label>
        <textarea className="ticket-form__input ticket-form__textarea" value={form.blocker_note} onChange={(e) => set("blocker_note", e.target.value)} placeholder="Why is this blocked?" rows={2} />
      </div>

      <div className="ticket-form__field">
        <label className="ticket-form__label">Note</label>
        <textarea className="ticket-form__input ticket-form__textarea" value={form.note} onChange={(e) => set("note", e.target.value)} placeholder="Additional notes" rows={2} />
      </div>

      <div className="ticket-form__actions">
        <button type="button" className="ticket-form__btn ticket-form__btn--cancel" onClick={onCancel}>Cancel</button>
        <button type="submit" className="ticket-form__btn ticket-form__btn--save">
          {ticket ? "Update" : "Add Ticket"}
        </button>
      </div>
    </form>
  );
}
