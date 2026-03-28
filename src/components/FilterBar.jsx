import { PROJECTS, ENERGY_ICONS } from "../constants";

export default function FilterBar({ filters }) {
  const {
    filterProject, setFilterProject,
    filterEnergy, setFilterEnergy,
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
    </div>
  );
}
