import { useTickets } from "../context/TicketContext";

export default function SuggestionBanner() {
  const { suggestions, bulkUpdateStatus, dismissSuggestions } = useTickets();

  if (!suggestions || suggestions.length === 0) return null;

  const handleAccept = () => {
    bulkUpdateStatus(suggestions.map((t) => t.id), "Actionable");
    dismissSuggestions();
  };

  return (
    <div className="suggestion-banner">
      <div className="suggestion-banner__text">
        {"🔓"} Unblocked: {suggestions.map((t) => t.task).join(", ")}
      </div>
      <div className="suggestion-banner__actions">
        <button className="suggestion-banner__btn suggestion-banner__btn--accept" onClick={handleAccept}>
          Move to Actionable
        </button>
        <button className="suggestion-banner__btn suggestion-banner__btn--dismiss" onClick={dismissSuggestions}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
