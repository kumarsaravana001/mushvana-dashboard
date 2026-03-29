import { useMemo } from "react";
import { getStaleLevel } from "../utils/stale";

export function useTicketStats(tickets, project) {
  return useMemo(() => {
    const t = project === "All" ? tickets : tickets.filter((x) => x.project === project);
    const stale = t.filter((x) => getStaleLevel(x) !== null).length;
    const totalMinutes = t.reduce((sum, x) => {
      return sum + (x.time_sessions || []).reduce((s, sess) => s + sess.duration_minutes, 0);
    }, 0);
    return {
      total: t.length,
      actionable: t.filter((x) => x.status === "Actionable").length,
      waiting: t.filter((x) => x.status === "Waiting").length,
      blocked: t.filter((x) => x.status === "Blocked").length,
      done: t.filter((x) => x.status === "Done").length,
      stale,
      totalMinutes,
    };
  }, [tickets, project]);
}
