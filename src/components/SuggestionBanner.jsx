import { useEffect, useRef } from "react";
import { useTickets } from "../context/TicketContext";

export default function SuggestionBanner() {
  const { suggestions, acceptSuggestion, dismissSuggestion } = useTickets();
  const timersRef = useRef({});

  useEffect(() => {
    suggestions.forEach((t) => {
      if (!timersRef.current[t.id]) {
        timersRef.current[t.id] = setTimeout(() => {
          dismissSuggestion(t.id);
          delete timersRef.current[t.id];
        }, 10000);
      }
    });

    return () => {
      Object.values(timersRef.current).forEach(clearTimeout);
    };
  }, [suggestions, dismissSuggestion]);

  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="toast-container">
      {suggestions.map((t) => (
        <div key={t.id} className="toast">
          <div className="toast__text">
            {"\uD83D\uDD13"} <strong>{t.task}</strong> is now unblocked
          </div>
          <div className="toast__actions">
            <button
              className="toast__btn toast__btn--accept"
              onClick={() => acceptSuggestion(t.id)}
            >
              Actionable
            </button>
            <button
              className="toast__btn toast__btn--dismiss"
              onClick={() => dismissSuggestion(t.id)}
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
