export function getDaysInStatus(ticket) {
  const changeDate = ticket.last_status_change || ticket.updated_at || ticket.created_at;
  return Math.floor((Date.now() - new Date(changeDate).getTime()) / (1000 * 60 * 60 * 24));
}

export function getStaleLevel(ticket) {
  if (ticket.status !== "Waiting" && ticket.status !== "Blocked") return null;
  const days = getDaysInStatus(ticket);
  if (ticket.status === "Waiting") {
    if (days >= 14) return "red";
    if (days >= 7) return "yellow";
  }
  if (ticket.status === "Blocked") {
    if (days >= 21) return "red";
    if (days >= 14) return "yellow";
  }
  return null;
}

export function getStaleText(ticket) {
  const days = getDaysInStatus(ticket);
  if (days === 0) return null;
  return `${ticket.status} ${days}d`;
}
