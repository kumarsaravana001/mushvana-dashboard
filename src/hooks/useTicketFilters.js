import { useState, useMemo } from "react";

export function useTicketFilters(tickets, initialProject = "All") {
  const [filterProject, setFilterProject] = useState(initialProject);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterEnergy, setFilterEnergy] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (filterProject !== "All" && t.project !== filterProject) return false;
      if (filterStatus !== "All" && t.status !== filterStatus) return false;
      if (filterEnergy !== "All" && t.energy !== filterEnergy) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        if (!t.task.toLowerCase().includes(q) && !t.note?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [tickets, filterProject, filterStatus, filterEnergy, searchTerm]);

  return {
    filtered,
    filterProject, setFilterProject,
    filterStatus, setFilterStatus,
    filterEnergy, setFilterEnergy,
    searchTerm, setSearchTerm,
  };
}
