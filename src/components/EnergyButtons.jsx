import { ENERGY_ICONS } from "../constants";

export default function EnergyButtons({ selected, onChange }) {
  return (
    <div className="energy-buttons">
      <button
        className={`energy-btn ${selected === "All" ? "energy-btn--active" : ""}`}
        onClick={() => onChange("All")}
      >
        All
      </button>
      {Object.entries(ENERGY_ICONS).map(([name, icon]) => (
        <button
          key={name}
          className={`energy-btn ${selected === name ? "energy-btn--active" : ""}`}
          onClick={() => onChange(name)}
        >
          {icon} {name.split("/")[0]}
        </button>
      ))}
    </div>
  );
}
