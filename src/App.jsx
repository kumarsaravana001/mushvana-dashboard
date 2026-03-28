import { useState, useMemo } from "react";
import { TicketProvider, useTickets } from "./context/TicketContext";
import Header from "./components/Header";
import TabBar from "./components/TabBar";
import OverviewView from "./views/OverviewView";
import ActionableView from "./views/ActionableView";
import AllTicketsView from "./views/AllTicketsView";

function Dashboard() {
  const [view, setView] = useState("overview");
  const { tickets, loaded } = useTickets();
  const actionableCount = useMemo(
    () => tickets.filter((t) => t.status === "Actionable").length,
    [tickets]
  );

  if (!loaded) return <div className="loading">Loading...</div>;

  return (
    <div className="app">
      <div className="container">
        <Header />
        <TabBar active={view} onChange={setView} actionableCount={actionableCount} />

        {view === "overview" && <OverviewView />}
        {view === "actionable" && <ActionableView />}
        {view === "all" && <AllTicketsView />}

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
