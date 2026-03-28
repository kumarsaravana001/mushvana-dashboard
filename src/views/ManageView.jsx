import { useState, useMemo } from "react";
import { PROJECTS, STATUS_COLORS, ENERGY_ICONS, STATUSES } from "../constants";
import { useTickets } from "../context/TicketContext";
import { useTicketFilters } from "../hooks/useTicketFilters";
import FilterBar from "../components/FilterBar";
import Modal from "../components/Modal";
import TicketForm from "../components/TicketForm";

export default function ManageView() {
  const { tickets, addTicket, updateTicket, deleteTicket, bulkUpdateStatus } = useTickets();
  const filters = useTicketFilters(tickets);
  const [modalMode, setModalMode] = useState(null);
  const [editTicket, setEditTicket] = useState(null);
  const [selected, setSelected] = useState([]);
  const [selectMode, setSelectMode] = useState(false);

  const grouped = useMemo(() => {
    const f = filters.filtered;
    return {
      actionable: f.filter((t) => t.status === "Actionable"),
      stalled: f.filter((t) => t.status === "Waiting" || t.status === "Blocked"),
      done: f.filter((t) => t.status === "Done"),
    };
  }, [filters.filtered]);

  const handleAdd = () => { setEditTicket(null); setModalMode("add"); };
  const handleEdit = (t) => { setEditTicket(t); setModalMode("edit"); };

  const handleSave = (data) => {
    if (modalMode === "edit" && editTicket) {
      updateTicket(editTicket.id, data);
    } else {
      addTicket(data);
    }
    setModalMode(null);
  };

  const handleDelete = (t) => {
    if (window.confirm(`Delete "${t.task}"?`)) deleteTicket(t.id);
  };

  const toggleSelect = (id) => {
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  };

  const handleBulkStatus = (status) => {
    if (selected.length === 0) return;
    bulkUpdateStatus(selected, status);
    setSelected([]);
    setSelectMode(false);
  };

  const renderRow = (t) => {
    const projConfig = PROJECTS[t.project];
    const statusColor = STATUS_COLORS[t.status];
    return (
      <div key={t.id} className="manage-row">
        {selectMode && (
          <input
            type="checkbox"
            className="manage-row__check"
            checked={selected.includes(t.id)}
            onChange={() => toggleSelect(t.id)}
          />
        )}
        <div className="manage-row__dot" style={{ background: statusColor }} />
        <div className="manage-row__body">
          <div className="manage-row__task">{t.task}</div>
          <div className="manage-row__badges">
            <span
              className="manage-row__project-pill"
              style={{ background: projConfig.color + "18", color: projConfig.color }}
            >
              {projConfig.icon} {t.project.split(" ")[0]}
            </span>
            <span className="manage-row__energy">{ENERGY_ICONS[t.energy]} {t.energy}</span>
            {t.priority === "High" && <span className="ticket-row__high">HIGH</span>}
          </div>
        </div>
        <div className="manage-row__actions">
          <button className="manage-row__btn" onClick={() => handleEdit(t)} title="Edit">{"\u270E"}</button>
          <button className="manage-row__btn manage-row__btn--del" onClick={() => handleDelete(t)} title="Delete">{"\u2715"}</button>
        </div>
      </div>
    );
  };

  const renderSection = (title, items, count) => {
    if (items.length === 0) return null;
    return (
      <>
        <div className="section-header">
          {title} <span className="section-header__count">{count}</span>
        </div>
        {items.map(renderRow)}
      </>
    );
  };

  return (
    <div>
      <div className="manage-toolbar">
        <input
          className="search-input"
          type="text"
          placeholder="Search..."
          value={filters.searchTerm}
          onChange={(e) => filters.setSearchTerm(e.target.value)}
        />
        <button
          className={`manage-toolbar__btn ${selectMode ? "manage-toolbar__btn--active" : ""}`}
          onClick={() => { setSelectMode(!selectMode); setSelected([]); }}
        >
          {selectMode ? "Cancel" : "Select"}
        </button>
      </div>

      <FilterBar filters={filters} />

      {selectMode && selected.length > 0 && (
        <div className="bulk-bar">
          <span className="bulk-bar__count">{selected.length} selected</span>
          {STATUSES.map((s) => (
            <button key={s} className="bulk-bar__btn" onClick={() => handleBulkStatus(s)}>{s}</button>
          ))}
        </div>
      )}

      <div className="ticket-count">{filters.filtered.length} tickets</div>

      {renderSection("ACTIONABLE", grouped.actionable, grouped.actionable.length)}
      {renderSection("STALLED", grouped.stalled, grouped.stalled.length)}
      {renderSection("DONE", grouped.done, grouped.done.length)}

      <button className="fab" onClick={handleAdd} title="Add Ticket">+</button>

      <Modal isOpen={!!modalMode} onClose={() => setModalMode(null)} title={modalMode === "edit" ? "Edit Ticket" : "Add Ticket"}>
        <TicketForm ticket={editTicket} onSave={handleSave} onCancel={() => setModalMode(null)} />
      </Modal>
    </div>
  );
}
