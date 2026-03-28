const DEPENDS_MAP = {
  4: ["t-3"], 5: ["t-4"], 6: ["t-5"], 7: ["t-6"], 8: ["t-7"],
  9: ["t-8"], 10: ["t-9"], 11: ["t-10"], 12: ["t-11"],
  13: ["t-3","t-4","t-5","t-6","t-7","t-8","t-9","t-10","t-11","t-12"],
  16: ["t-2"],
  17: ["t-13","t-14","t-15","t-16"],
  19: ["t-17"], 20: ["t-19"], 21: ["t-20"], 22: ["t-21"], 23: ["t-22"],
  24: ["t-18"], 26: ["t-23"],
  31: ["t-27","t-28","t-30"],
  34: ["t-32"],
  37: ["t-36"], 38: ["t-36"], 39: ["t-36"],
  43: ["t-42"], 44: ["t-43"], 45: ["t-36"],
  46: ["t-44","t-45"],
};

export function needsMigration(tickets) {
  if (!Array.isArray(tickets) || tickets.length === 0) return false;
  const first = tickets[0];
  return typeof first.id === "number" || typeof first.depends === "string";
}

export function migrateTickets(oldTickets) {
  const now = new Date().toISOString();
  return oldTickets.map((t) => ({
    id: `t-${t.id}`,
    project: t.project,
    task: t.task,
    status: t.status,
    energy: t.energy,
    priority: t.priority,
    depends_on: DEPENDS_MAP[t.id] || [],
    blocker_note: "",
    note: t.note || "",
    date_opened: "2026-03-28",
    date_closed: t.status === "Done" ? "2026-03-28" : null,
    created_at: now,
    updated_at: now,
  }));
}
