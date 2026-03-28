import { useTickets } from "../context/TicketContext";
import { useTicketFilters } from "../hooks/useTicketFilters";
import FilterBar from "../components/FilterBar";
import TicketCard from "../components/TicketCard";

export default function AllTicketsView() {
  const { tickets } = useTickets();
  const filters = useTicketFilters(tickets);

  return (
    <div>
      <FilterBar filters={filters} />
      <div className="ticket-count">{filters.filtered.length} tickets</div>
      {filters.filtered.map((t) => (
        <TicketCard key={t.id} ticket={t} />
      ))}
    </div>
  );
}
