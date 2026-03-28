import { PROJECTS, ENERGY_ICONS, STATUSES, PRIORITIES, STATUS_CONFIG } from "../constants";

export default function FilterBar({ filters }) {
  const {
    filterProject, setFilterProject,
    filterStatus, setFilterStatus,
    filterEnergy, setFilterEnergy,
    filterPriority, setFilterPriority,
  } = filters;

  return (
    <div className="filter-bar">
      <div className="filter-bar__row">
        <button
          className={`filter-pill ${filterProject === "All" ? "filter-pill--active" : ""}`}
          onClick={() => setFilterProject("All")}
        >
          All
        </button>
        {Object.entries(PROJECTS).map(([name, config]) => (
          <button
            key={name}
            className={`filter-pill ${filterProject === name ? "filter-pill--active" : ""}`}
            onClick={() => setFilterProject(name)}
          >
            {config.icon} {name.split(" ")[0]}
          </button>
        ))}
      </div>
      <div className="filter-bar__row">
        <button
          className={`filter-pill ${filterStatus === "All" ? "filter-pill--active" : ""}`}
          onClick={() => setFilterStatus("All")}
        >
          All Status
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            className={`filter-pill ${filterStatus === s ? "filter-pill--active" : ""}`}
            onClick={() => setFilterStatus(s)}
            style={filterStatus === s ? { background: STATUS_CONFIG[s].bg, color: STATUS_CONFIG[s].text } : {}}
          >
            <span className="filter-pill__dot" style={{ background: STATUS_CONFIG[s].text }} />
            {s}
          </button>
        ))}
      </div>
      <div className="filter-bar__row">
        <button
          className={`filter-pill ${filterEnergy === "All" ? "filter-pill--active" : ""}`}
          onClick={() => setFilterEnergy("All")}
        >
          All Energy
        </button>
        {Object.entries(ENERGY_ICONS).map(([name, icon]) => (
          <button
            key={name}
            className={`filter-pill ${filterEnergy === name ? "filter-pill--active" : ""}`}
            onClick={() => setFilterEnergy(name)}
          >
            {icon} {name.split("/")[0]}
          </button>
        ))}
      </div>
      <div className="filter-bar__row">
        <button
          className={`filter-pill ${filterPriority === "All" ? "filter-pill--active" : ""}`}
          onClick={() => setFilterPriority("All")}
        >
          All Priority
        </button>
        {PRIORITIES.map((p) => (
          <button
            key={p}
            className={`filter-pill ${filterPriority === p ? "filter-pill--active" : ""}`}
            onClick={() => setFilterPriority(p)}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
