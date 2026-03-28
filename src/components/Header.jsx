import { useRef } from "react";
import { useTickets } from "../context/TicketContext";
import { exportTickets, importTickets } from "../utils/dataIO";

export default function Header() {
  const { tickets, setAllTickets } = useTickets();
  const fileRef = useRef(null);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "short", year: "numeric",
  });

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!window.confirm("This will replace all current tickets. Continue?")) {
      e.target.value = "";
      return;
    }
    try {
      const data = await importTickets(file);
      setAllTickets(data);
    } catch {
      alert("Invalid file format");
    }
    e.target.value = "";
  };

  return (
    <header className="header">
      <div className="header__top">
        <div>
          <h1 className="header__title">MUSHVANA</h1>
          <p className="header__date">Open Tickets Dashboard — {today}</p>
        </div>
        <div className="header__actions">
          <button className="header__btn" onClick={() => exportTickets(tickets)} title="Export">
            {"↓"}
          </button>
          <button className="header__btn" onClick={() => fileRef.current?.click()} title="Import">
            {"↑"}
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} hidden />
        </div>
      </div>
    </header>
  );
}
