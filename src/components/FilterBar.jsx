import { PROJECTS, STATUS_CONFIG, ENERGY_ICONS } from "../constants";

export default function FilterBar({ filters }) {
  const {
    filterProject, setFilterProject,
    filterStatus, setFilterStatus,
    filterEnergy, setFilterEnergy,
  } = filters;

  return (
    <div className="filter-bar">
      <select className="filter-select" value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
        <option value="All">All Projects</option>
        {Object.keys(PROJECTS).map((p) => <option key={p} value={p}>{p}</option>)}
      </select>
      <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
        <option value="All">All Status</option>
        {Object.keys(STATUS_CONFIG).map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <select className="filter-select" value={filterEnergy} onChange={(e) => setFilterEnergy(e.target.value)}>
        <option value="All">All Energy</option>
        {Object.keys(ENERGY_ICONS).map((e) => <option key={e} value={e}>{e}</option>)}
      </select>
    </div>
  );
}
