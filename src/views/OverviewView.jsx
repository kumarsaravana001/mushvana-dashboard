import { PROJECTS } from "../constants";
import { useTickets } from "../context/TicketContext";
import { useTicketStats } from "../hooks/useTicketStats";
import StatsGrid from "../components/StatsGrid";
import ProjectCard from "../components/ProjectCard";
import MissionSection from "../components/MissionSection";
import QuotaSection from "../components/QuotaSection";

export default function OverviewView({ onProjectClick }) {
  const { tickets } = useTickets();
  const globalStats = useTicketStats(tickets, "All");

  return (
    <div>
      <MissionSection />
      <StatsGrid stats={globalStats} />
      <QuotaSection />
      {Object.entries(PROJECTS).map(([name, config]) => (
        <ProjectCard key={name} name={name} config={config} onClick={onProjectClick} />
      ))}
    </div>
  );
}
