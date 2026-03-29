import { useState } from "react";
import { ENERGIES, AFTER_FEELS } from "../constants";
import { useTickets } from "../context/TicketContext";

export default function EnergyLogModal() {
  const { pendingLog, logSessionFeel, dismissLog, tickets } = useTickets();
  const [energyUsed, setEnergyUsed] = useState(null);
  const [afterFeel, setAfterFeel] = useState(null);

  if (!pendingLog) return null;

  const ticket = tickets.find((t) => t.id === pendingLog.ticketId);
  const ticketName = ticket ? ticket.task : "Session";

  const handleSave = () => {
    if (energyUsed && afterFeel) {
      logSessionFeel(pendingLog.ticketId, pendingLog.sessionEnd, energyUsed, afterFeel);
      setEnergyUsed(null);
      setAfterFeel(null);
    }
  };

  const handleDismiss = () => {
    dismissLog();
    setEnergyUsed(null);
    setAfterFeel(null);
  };

  return (
    <div className="modal-overlay" onClick={handleDismiss}>
      <div className="energy-log" onClick={(e) => e.stopPropagation()}>
        <div className="energy-log__header">
          <span className="energy-log__title">Log: {ticketName}</span>
          <button className="modal-close" onClick={handleDismiss}>{"\u2715"}</button>
        </div>

        <div className="energy-log__section">
          <div className="energy-log__label">What energy did you actually use?</div>
          <div className="energy-log__options">
            {ENERGIES.map((e) => (
              <button
                key={e}
                className={`energy-log__option ${energyUsed === e ? "energy-log__option--active" : ""}`}
                onClick={() => setEnergyUsed(e)}
              >
                {e.split("/")[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="energy-log__section">
          <div className="energy-log__label">How do you feel now?</div>
          <div className="energy-log__feels">
            {AFTER_FEELS.map((f) => (
              <button
                key={f.key}
                className={`energy-log__feel ${afterFeel === f.key ? "energy-log__feel--active" : ""}`}
                onClick={() => setAfterFeel(f.key)}
              >
                <span className="energy-log__feel-icon">{f.icon}</span>
                <span className="energy-log__feel-label">{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="energy-log__actions">
          <button className="energy-log__btn energy-log__btn--skip" onClick={handleDismiss}>Skip</button>
          <button
            className="energy-log__btn energy-log__btn--save"
            onClick={handleSave}
            disabled={!energyUsed || !afterFeel}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
