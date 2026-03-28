import { useMemo } from "react";
import { useTickets } from "../context/TicketContext";
import { useTicketFilters } from "../hooks/useTicketFilters";
import FilterBar from "../components/FilterBar";
import TicketCard from "../components/TicketCard";

export default function AllTicketsView({ initialProject }) {
  const { tickets } = useTickets();
  const filters = useTicketFilters(tickets, initialProject);

  const grouped = useMemo(() => {
    const f = filters.filtered;
    return {
      actionable: f.filter((t) => t.status === "Actionable"),
      stalled: f.filter((t) => t.status === "Waiting" || t.status === "Blocked"),
      done: f.filter((t) => t.status === "Done"),
    };
  }, [filters.filtered]);

  return (
    <div>
      <FilterBar filters={filters} />
      <div className="ticket-count">{filters.filtered.length} tickets</div>

      {grouped.actionable.length > 0 && (
        <>
          <div className="section-header">Actionable</div>
          {grouped.actionable.map((t) => <TicketCard key={t.id} ticket={t} />)}
        </>
      )}
      {grouped.stalled.length > 0 && (
        <>
          <div className="section-header">Stalled</div>
          {grouped.stalled.map((t) => <TicketCard key={t.id} ticket={t} />)}
        </>
      )}
      {grouped.done.length > 0 && (
        <>
          <div className="section-header">Done</div>
          {grouped.done.map((t) => <TicketCard key={t.id} ticket={t} />)}
        </>
      )}
    </div>
  );
}
