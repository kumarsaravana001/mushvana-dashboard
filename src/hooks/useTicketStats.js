import { useMemo } from "react";

export function useTicketStats(tickets, project) {
  return useMemo(() => {
    const t = project === "All" ? tickets : tickets.filter((x) => x.project === project);
    return {
      total: t.length,
      actionable: t.filter((x) => x.status === "Actionable").length,
      waiting: t.filter((x) => x.status === "Waiting").length,
      blocked: t.filter((x) => x.status === "Blocked").length,
      done: t.filter((x) => x.status === "Done").length,
    };
  }, [tickets, project]);
}
