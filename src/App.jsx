import { useState, useMemo, useCallback } from "react";
import { TicketProvider, useTickets } from "./context/TicketContext";
import { useTheme } from "./hooks/useTheme";
import Header from "./components/Header";
import TabBar from "./components/TabBar";
import SuggestionBanner from "./components/SuggestionBanner";
import RerouteToast from "./components/RerouteToast";
import EnergyLogModal from "./components/EnergyLogModal";
import LifeLogModal from "./components/LifeLogModal";
import OverviewView from "./views/OverviewView";
import ActionableView from "./views/ActionableView";
import AllTicketsView from "./views/AllTicketsView";
import DependencyView from "./views/DependencyView";
import ReviewView from "./views/ReviewView";
import TimelineView from "./views/TimelineView";
import ManageView from "./views/ManageView";

function Dashboard() {
  const [view, setView] = useState("overview");
  const [initialProject, setInitialProject] = useState("All");
  const { tickets, loaded } = useTickets();
  const { theme, toggle } = useTheme();

  const actionableCount = useMemo(
    () => tickets.filter((t) => t.status === "Actionable").length,
    [tickets]
  );

  const handleProjectClick = useCallback((projectName) => {
    setInitialProject(projectName);
    setView("all");
  }, []);

  if (!loaded) return <div className="loading">Loading...</div>;

  return (
    <div className="app">
      <div className="container">
        <Header theme={theme} onToggleTheme={toggle} />
        <TabBar active={view} onChange={setView} actionableCount={actionableCount} />
        <SuggestionBanner />
        <RerouteToast />

        {view === "overview" && <OverviewView onProjectClick={handleProjectClick} />}
        {view === "actionable" && <ActionableView />}
        {view === "all" && <AllTicketsView key={initialProject} initialProject={initialProject} />}
        {view === "dependencies" && <DependencyView />}
        {view === "timeline" && <TimelineView />}
        {view === "review" && <ReviewView />}
        {view === "manage" && <ManageView />}

        <EnergyLogModal />
        <LifeLogModal />

        <footer className="footer">
          Update statuses as you complete work
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <TicketProvider>
      <Dashboard />
    </TicketProvider>
  );
}
