const TABS = [
  { key: "overview", label: "Overview" },
  { key: "actionable", label: "Do Now" },
  { key: "all", label: "All Tickets" },
  { key: "dependencies", label: "Deps" },
  { key: "review", label: "Review" },
  { key: "manage", label: "Manage" },
];

export default function TabBar({ active, onChange, actionableCount }) {
  return (
    <nav className="tab-bar">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className={`tab-bar__btn ${active === tab.key ? "tab-bar__btn--active" : ""}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.key === "actionable" ? `${tab.label} (${actionableCount})` : tab.label}
        </button>
      ))}
    </nav>
  );
}
