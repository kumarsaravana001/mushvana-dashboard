import { useState } from "react";
import { PROJECTS, STATUS_CONFIG, ENERGY_ICONS, STATUSES } from "../constants";
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

  return (
    <div>
      <div className="manage-toolbar">
        <input
          className="search-input"
          type="text"
          placeholder="Search tickets..."
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

      {filters.filtered.map((t) => {
        const projConfig = PROJECTS[t.project];
        const statusStyle = STATUS_CONFIG[t.status];
        return (
          <div key={t.id} className="manage-row" style={{ borderLeftColor: projConfig.color }}>
            {selectMode && (
              <input
                type="checkbox"
                className="manage-row__check"
                checked={selected.includes(t.id)}
                onChange={() => toggleSelect(t.id)}
              />
            )}
            <div className="manage-row__body">
              <div className="manage-row__meta">
                <span style={{ color: projConfig.color }}>{projConfig.icon}</span>
                <span className="manage-row__task">{t.task}</span>
              </div>
              <div className="manage-row__badges">
                <span className="manage-row__status" style={{ background: statusStyle.bg, color: statusStyle.text }}>{t.status}</span>
                <span className="manage-row__energy">{ENERGY_ICONS[t.energy]}</span>
                {t.priority === "High" && <span className="ticket__high">HIGH</span>}
              </div>
            </div>
            <div className="manage-row__actions">
              <button className="manage-row__btn" onClick={() => handleEdit(t)} title="Edit">{"✎"}</button>
              <button className="manage-row__btn manage-row__btn--del" onClick={() => handleDelete(t)} title="Delete">{"✕"}</button>
            </div>
          </div>
        );
      })}

      <button className="fab" onClick={handleAdd} title="Add Ticket">+</button>

      <Modal isOpen={!!modalMode} onClose={() => setModalMode(null)} title={modalMode === "edit" ? "Edit Ticket" : "Add Ticket"}>
        <TicketForm ticket={editTicket} onSave={handleSave} onCancel={() => setModalMode(null)} />
      </Modal>
    </div>
  );
}
