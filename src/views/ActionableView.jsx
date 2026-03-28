import { useState, useMemo } from "react";
import { useTickets } from "../context/TicketContext";
import TicketCard from "../components/TicketCard";
import EnergyGuide from "../components/EnergyGuide";
import EnergyButtons from "../components/EnergyButtons";

export default function ActionableView() {
  const { tickets } = useTickets();
  const [energyFilter, setEnergyFilter] = useState("All");

  const actionable = useMemo(() => {
    let list = tickets.filter((t) => t.status === "Actionable");
    if (energyFilter !== "All") list = list.filter((t) => t.energy === energyFilter);
    return list;
  }, [tickets, energyFilter]);

  return (
    <div>
      <EnergyGuide />
      <EnergyButtons selected={energyFilter} onChange={setEnergyFilter} />
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
