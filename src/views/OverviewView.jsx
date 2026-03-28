import { PROJECTS } from "../constants";
import { useTickets } from "../context/TicketContext";
import { useTicketStats } from "../hooks/useTicketStats";
import StatsGrid from "../components/StatsGrid";
import ProjectCard from "../components/ProjectCard";

export default function OverviewView() {
  const { tickets } = useTickets();
  const globalStats = useTicketStats(tickets, "All");

  return (
    <div>
      <StatsGrid stats={globalStats} />
      {Object.entries(PROJECTS).map(([name, config]) => (
        <ProjectCard key={name} name={name} config={config} />
      ))}
    </div>
  );
}
