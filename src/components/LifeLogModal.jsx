import { useState } from "react";
import { AFTER_FEELS } from "../constants";
import { useTickets } from "../context/TicketContext";

export default function LifeLogModal() {
  const { pendingLifeLog, logLifeSessionFeel, dismissLifeLog, lifeDomains } = useTickets();
  const [afterFeel, setAfterFeel] = useState(null);

  if (!pendingLifeLog) return null;

  const domain = lifeDomains.find((d) => d.id === pendingLifeLog.domainId);
  const domainName = domain ? domain.name : "Session";

  const handleSave = () => {
    if (afterFeel) {
      logLifeSessionFeel(pendingLifeLog.sessionEnd, null, afterFeel);
      setAfterFeel(null);
    }
  };

  const handleDismiss = () => {
    dismissLifeLog();
    setAfterFeel(null);
  };

  return (
    <div className="modal-overlay" onClick={handleDismiss}>
      <div className="energy-log" onClick={(e) => e.stopPropagation()}>
        <div className="energy-log__header">
          <span className="energy-log__title">{domain?.icon} {domainName}</span>
          <button className="modal-close" onClick={handleDismiss}>{"\u2715"}</button>
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
            disabled={!afterFeel}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
