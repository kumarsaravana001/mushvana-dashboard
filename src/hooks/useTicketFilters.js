import { useState, useMemo } from "react";

export function useTicketFilters(tickets) {
  const [filterProject, setFilterProject] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterEnergy, setFilterEnergy] = useState("All");

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (filterProject !== "All" && t.project !== filterProject) return false;
      if (filterStatus !== "All" && t.status !== filterStatus) return false;
      if (filterEnergy !== "All" && t.energy !== filterEnergy) return false;
      return true;
    });
  }, [tickets, filterProject, filterStatus, filterEnergy]);

  return {
    filtered,
    filterProject, setFilterProject,
    filterStatus, setFilterStatus,
    filterEnergy, setFilterEnergy,
  };
}
