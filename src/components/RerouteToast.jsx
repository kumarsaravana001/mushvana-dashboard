import { PROJECTS } from "../constants";
import { useTickets } from "../context/TicketContext";

export default function RerouteToast() {
  const { rerouteSuggestions, dismissReroute } = useTickets();

  if (!rerouteSuggestions || !rerouteSuggestions.alternatives) return null;

  const { blockedTicket, alternatives } = rerouteSuggestions;

  return (
    <div className="reroute-overlay">
      <div className="reroute-sheet">
        <div className="reroute-sheet__header">
          <span className="reroute-sheet__title">
            Blocked on <strong>{blockedTicket.task}</strong>
          </span>
          <button className="reroute-sheet__close" onClick={dismissReroute}>{"\u2715"}</button>
        </div>
        <div className="reroute-sheet__subtitle">You could do instead:</div>
        <div className="reroute-sheet__list">
          {alternatives.map((t) => {
            const proj = PROJECTS[t.project];
            return (
              <div key={t.id} className="reroute-sheet__item" onClick={dismissReroute}>
                <span
                  className="reroute-sheet__pill"
                  style={{ background: proj.color + "18", color: proj.color }}
                >
                  {proj.icon} {t.project.split(" ")[0]}
                </span>
                <span className="reroute-sheet__task">{t.task}</span>
                <span className="reroute-sheet__energy">{t.energy}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
