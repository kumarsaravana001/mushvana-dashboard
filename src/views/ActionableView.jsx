import { useMemo } from "react";
import { useTickets } from "../context/TicketContext";
import TicketCard from "../components/TicketCard";
import EnergyGuide from "../components/EnergyGuide";

export default function ActionableView() {
  const { tickets } = useTickets();
  const actionable = useMemo(() => tickets.filter((t) => t.status === "Actionable"), [tickets]);

  return (
    <div>
      <EnergyGuide />
      {actionable.length === 0 ? (
        <div className="empty-state">
          Nothing actionable right now. Check if any Waiting/Blocked items have unblocked.
        </div>
      ) : (
        actionable.map((t) => <TicketCard key={t.id} ticket={t} />)
      )}
    </div>
  );
}
