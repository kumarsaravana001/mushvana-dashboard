export default function Header() {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "short", year: "numeric",
  });

  return (
    <header className="header">
      <h1 className="header__title">MUSHVANA</h1>
      <p className="header__date">Open Tickets Dashboard — {today}</p>
    </header>
  );
}
