import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { INITIAL_TICKETS } from "../data/tickets";
import { needsMigration, migrateTickets } from "../utils/migrate";

const STORAGE_KEY = "mushvana-tickets";
const TIMER_KEY = "mushvana-timer";
const MISSIONS_KEY = "mushvana-missions";
const QUOTAS_KEY = "mushvana-quotas";
const LIFE_DOMAINS_KEY = "mushvana-life-domains";
const LIFE_SESSIONS_KEY = "mushvana-life-sessions";
const LIFE_TIMER_KEY = "mushvana-life-timer";
const MILESTONES_KEY = "mushvana-milestones";

const DEFAULT_LIFE_DOMAINS = [
  { id: "health", name: "Health/Gym", icon: "\uD83D\uDCAA", quota_target: 7, quota_period: "week" },
  { id: "meditation", name: "Meditation/Sadhana", icon: "\uD83E\uDDD8", quota_target: 7, quota_period: "week" },
  { id: "rest", name: "Rest/Recovery", icon: "\uD83D\uDE34", quota_target: 0, quota_period: "week" },
  { id: "learning", name: "Learning", icon: "\uD83D\uDCDA", quota_target: 0, quota_period: "week" },
  { id: "relationships", name: "Relationships", icon: "\u2764\uFE0F", quota_target: 0, quota_period: "week" },
];

const TicketContext = createContext(null);

function persist(tickets) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets)); } catch {}
}

function loadTimer() {
  try {
    const saved = localStorage.getItem(TIMER_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
}

function persistTimer(timer) {
  try {
    if (timer) localStorage.setItem(TIMER_KEY, JSON.stringify(timer));
    else localStorage.removeItem(TIMER_KEY);
  } catch {}
}

export function TicketProvider({ children }) {
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [loaded, setLoaded] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [rerouteSuggestions, setRerouteSuggestions] = useState([]);
  const [activeTimer, setActiveTimer] = useState(loadTimer);
  const [pendingLog, setPendingLog] = useState(null);
  const [missions, setMissions] = useState([]);
  const [quotas, setQuotas] = useState({});
  const [lifeDomains, setLifeDomains] = useState(DEFAULT_LIFE_DOMAINS);
  const [lifeSessions, setLifeSessions] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [lifeTimer, setLifeTimer] = useState(() => {
    try { const s = localStorage.getItem(LIFE_TIMER_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        let parsed = JSON.parse(saved);
        if (needsMigration(parsed)) {
          parsed = migrateTickets(parsed);
          persist(parsed);
        }
        setTickets(parsed);
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(MISSIONS_KEY);
      if (saved) setMissions(JSON.parse(saved));
    } catch {}
    try {
      const saved = localStorage.getItem(QUOTAS_KEY);
      if (saved) setQuotas(JSON.parse(saved));
    } catch {}
    try {
      const saved = localStorage.getItem(LIFE_DOMAINS_KEY);
      if (saved) setLifeDomains(JSON.parse(saved));
    } catch {}
    try {
      const saved = localStorage.getItem(LIFE_SESSIONS_KEY);
      if (saved) setLifeSessions(JSON.parse(saved));
    } catch {}
    try {
      const saved = localStorage.getItem(MILESTONES_KEY);
      if (saved) setMilestones(JSON.parse(saved));
    } catch {}
  }, []);

  const checkUnblocked = useCallback((next, changedId) => {
    const unblocked = [];
    next.forEach((t) => {
      if (!t.depends_on || t.depends_on.length === 0) return;
      if (t.status !== "Blocked" && t.status !== "Waiting") return;
      if (!t.depends_on.includes(changedId)) return;
      const allDone = t.depends_on.every((depId) => {
        const dep = next.find((d) => d.id === depId);
        return dep && dep.status === "Done";
      });
      if (allDone) unblocked.push(t);
    });
    if (unblocked.length > 0) setSuggestions(unblocked);
  }, []);

  const findReroutes = useCallback((allTickets, blockedTicket) => {
    const alternatives = allTickets
      .filter((t) =>
        t.status === "Actionable" &&
        t.id !== blockedTicket.id &&
        t.project !== blockedTicket.project
      )
      .sort((a, b) => {
        const pa = a.priority === "High" ? 0 : a.priority === "Medium" ? 1 : 2;
        const pb = b.priority === "High" ? 0 : b.priority === "Medium" ? 1 : 2;
        if (pa !== pb) return pa - pb;
        const ea = a.energy === blockedTicket.energy ? 0 : 1;
        const eb = b.energy === blockedTicket.energy ? 0 : 1;
        return ea - eb;
      })
      .slice(0, 3);
    if (alternatives.length > 0) {
      setRerouteSuggestions({ blockedTicket, alternatives });
    }
  }, []);

  const updateStatus = useCallback((id, newStatus) => {
    setTickets((prev) => {
      const now = new Date().toISOString();
      const next = prev.map((t) => {
        if (t.id !== id) return t;
        return {
          ...t,
          status: newStatus,
          last_status_change: now,
          date_closed: newStatus === "Done" ? now.slice(0, 10) : null,
          updated_at: now,
        };
      });
      persist(next);
      if (newStatus === "Done") checkUnblocked(next, id);
      if (newStatus === "Blocked" || newStatus === "Waiting") {
        const blockedTicket = next.find((t) => t.id === id);
        if (blockedTicket) findReroutes(next, blockedTicket);
      }
      return next;
    });
  }, [checkUnblocked, findReroutes]);

  const startTimer = useCallback((ticketId) => {
    setActiveTimer((prev) => {
      if (prev && prev.ticketId !== ticketId) {
        setTickets((curTickets) => {
          const now = new Date().toISOString();
          const duration = Math.floor((Date.now() - new Date(prev.start).getTime()) / 60000);
          const next = curTickets.map((t) => {
            if (t.id !== prev.ticketId) return t;
            const sessions = [...(t.time_sessions || []), { start: prev.start, end: now, duration_minutes: Math.max(duration, 1) }];
            return { ...t, time_sessions: sessions, updated_at: now };
          });
          persist(next);
          return next;
        });
      }
      const timer = { ticketId, start: new Date().toISOString() };
      persistTimer(timer);
      return timer;
    });
  }, []);

  const stopTimer = useCallback(() => {
    setActiveTimer((prev) => {
      if (!prev) return null;
      const now = new Date().toISOString();
      const duration = Math.floor((Date.now() - new Date(prev.start).getTime()) / 60000);
      const session = { start: prev.start, end: now, duration_minutes: Math.max(duration, 1) };
      setTickets((curTickets) => {
        const next = curTickets.map((t) => {
          if (t.id !== prev.ticketId) return t;
          const sessions = [...(t.time_sessions || []), session];
          return { ...t, time_sessions: sessions, updated_at: now };
        });
        persist(next);
        return next;
      });
      setPendingLog({ ticketId: prev.ticketId, sessionEnd: now });
      persistTimer(null);
      return null;
    });
  }, []);

  const addTicket = useCallback((data) => {
    setTickets((prev) => {
      const now = new Date().toISOString();
      const ticket = {
        ...data,
        id: crypto.randomUUID(),
        depends_on: data.depends_on || [],
        blocker_note: data.blocker_note || "",
        note: data.note || "",
        date_opened: now.slice(0, 10),
        date_closed: null,
        last_status_change: now,
        time_sessions: [],
        created_at: now,
        updated_at: now,
      };
      const next = [...prev, ticket];
      persist(next);
      return next;
    });
  }, []);

  const updateTicket = useCallback((id, updates) => {
    setTickets((prev) => {
      const now = new Date().toISOString();
      const next = prev.map((t) =>
        t.id === id ? { ...t, ...updates, updated_at: now } : t
      );
      persist(next);
      return next;
    });
  }, []);

  const deleteTicket = useCallback((id) => {
    setTickets((prev) => {
      const next = prev
        .filter((t) => t.id !== id)
        .map((t) => ({
          ...t,
          depends_on: t.depends_on ? t.depends_on.filter((d) => d !== id) : [],
        }));
      persist(next);
      return next;
    });
  }, []);

  const bulkUpdateStatus = useCallback((ids, newStatus) => {
    setTickets((prev) => {
      const now = new Date().toISOString();
      const next = prev.map((t) => {
        if (!ids.includes(t.id)) return t;
        return {
          ...t,
          status: newStatus,
          last_status_change: now,
          date_closed: newStatus === "Done" ? now.slice(0, 10) : null,
          updated_at: now,
        };
      });
      persist(next);
      return next;
    });
  }, []);

  const setAllTickets = useCallback((newTickets) => {
    setTickets(newTickets);
    persist(newTickets);
  }, []);

  const dismissSuggestions = useCallback(() => setSuggestions([]), []);
  const dismissSuggestion = useCallback((id) => {
    setSuggestions((prev) => prev.filter((t) => t.id !== id));
  }, []);
  const acceptSuggestion = useCallback((id) => {
    updateStatus(id, "Actionable");
    setSuggestions((prev) => prev.filter((t) => t.id !== id));
  }, [updateStatus]);
  const dismissReroute = useCallback(() => setRerouteSuggestions([]), []);

  const logSessionFeel = useCallback((ticketId, sessionEnd, energyUsed, afterFeel) => {
    setTickets((prev) => {
      const next = prev.map((t) => {
        if (t.id !== ticketId) return t;
        const sessions = (t.time_sessions || []).map((s) =>
          s.end === sessionEnd ? { ...s, energy_used: energyUsed, after_feel: afterFeel } : s
        );
        return { ...t, time_sessions: sessions };
      });
      persist(next);
      return next;
    });
    setPendingLog(null);
  }, []);

  const dismissLog = useCallback(() => setPendingLog(null), []);

  const addMission = useCallback((mission) => {
    setMissions((prev) => {
      const next = [...prev, { ...mission, id: crypto.randomUUID(), status: "active", created_at: new Date().toISOString() }];
      localStorage.setItem(MISSIONS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateMission = useCallback((id, updates) => {
    setMissions((prev) => {
      const next = prev.map((m) => m.id === id ? { ...m, ...updates } : m);
      localStorage.setItem(MISSIONS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteMission = useCallback((id) => {
    setMissions((prev) => {
      const next = prev.filter((m) => m.id !== id);
      localStorage.setItem(MISSIONS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const setQuota = useCallback((project, quota) => {
    setQuotas((prev) => {
      const next = { ...prev, [project]: quota };
      localStorage.setItem(QUOTAS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateLifeDomain = useCallback((id, updates) => {
    setLifeDomains((prev) => {
      const next = prev.map((d) => d.id === id ? { ...d, ...updates } : d);
      localStorage.setItem(LIFE_DOMAINS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const addLifeDomain = useCallback((domain) => {
    setLifeDomains((prev) => {
      const next = [...prev, { ...domain, id: crypto.randomUUID(), quota_target: 0, quota_period: "week" }];
      localStorage.setItem(LIFE_DOMAINS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteLifeDomain = useCallback((id) => {
    setLifeDomains((prev) => {
      const next = prev.filter((d) => d.id !== id);
      localStorage.setItem(LIFE_DOMAINS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const addMilestone = useCallback((ms) => {
    setMilestones((prev) => {
      const next = [...prev, { ...ms, id: crypto.randomUUID() }];
      localStorage.setItem(MILESTONES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateMilestone = useCallback((id, updates) => {
    setMilestones((prev) => {
      const next = prev.map((m) => m.id === id ? { ...m, ...updates } : m);
      localStorage.setItem(MILESTONES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteMilestone = useCallback((id) => {
    setMilestones((prev) => {
      const next = prev.filter((m) => m.id !== id);
      localStorage.setItem(MILESTONES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const startLifeTimer = useCallback((domainId) => {
    setLifeTimer((prev) => {
      if (prev && prev.domainId !== domainId) {
        const now = new Date().toISOString();
        const duration = Math.floor((Date.now() - new Date(prev.start).getTime()) / 60000);
        const session = { domainId: prev.domainId, start: prev.start, end: now, duration_minutes: Math.max(duration, 1) };
        setLifeSessions((s) => {
          const next = [...s, session];
          localStorage.setItem(LIFE_SESSIONS_KEY, JSON.stringify(next));
          return next;
        });
      }
      const timer = { domainId, start: new Date().toISOString() };
      localStorage.setItem(LIFE_TIMER_KEY, JSON.stringify(timer));
      return timer;
    });
  }, []);

  const stopLifeTimer = useCallback(() => {
    setLifeTimer((prev) => {
      if (!prev) return null;
      const now = new Date().toISOString();
      const duration = Math.floor((Date.now() - new Date(prev.start).getTime()) / 60000);
      const session = { domainId: prev.domainId, start: prev.start, end: now, duration_minutes: Math.max(duration, 1) };
      setLifeSessions((s) => {
        const next = [...s, session];
        localStorage.setItem(LIFE_SESSIONS_KEY, JSON.stringify(next));
        return next;
      });
      setPendingLifeLog({ domainId: prev.domainId, sessionEnd: now });
      localStorage.removeItem(LIFE_TIMER_KEY);
      return null;
    });
  }, []);

  const [pendingLifeLog, setPendingLifeLog] = useState(null);

  const logLifeSessionFeel = useCallback((sessionEnd, energyUsed, afterFeel) => {
    setLifeSessions((prev) => {
      const next = prev.map((s) =>
        s.end === sessionEnd ? { ...s, energy_used: energyUsed, after_feel: afterFeel } : s
      );
      localStorage.setItem(LIFE_SESSIONS_KEY, JSON.stringify(next));
      return next;
    });
    setPendingLifeLog(null);
  }, []);

  const dismissLifeLog = useCallback(() => setPendingLifeLog(null), []);

  const restBehind = useMemo(() => {
    const restDomain = lifeDomains.find((d) => d.id === "rest" || d.name.toLowerCase().includes("rest"));
    if (!restDomain || !restDomain.quota_target) return false;
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const count = lifeSessions.filter((s) => s.domainId === restDomain.id && new Date(s.end) >= weekStart).length;
    const dayOfWeek = now.getDay() || 7;
    const expected = Math.round((restDomain.quota_target / 7) * dayOfWeek);
    return count < expected * 0.5;
  }, [lifeDomains, lifeSessions]);

  const value = useMemo(() => ({
    tickets, loaded, suggestions, rerouteSuggestions, activeTimer,
    pendingLog, missions, quotas, milestones,
    lifeDomains, lifeSessions, lifeTimer, pendingLifeLog, restBehind,
    updateStatus, addTicket, updateTicket, deleteTicket,
    bulkUpdateStatus, setAllTickets, dismissSuggestions,
    dismissSuggestion, acceptSuggestion, dismissReroute,
    startTimer, stopTimer, logSessionFeel, dismissLog,
    addMission, updateMission, deleteMission, setQuota,
    addMilestone, updateMilestone, deleteMilestone,
    updateLifeDomain, addLifeDomain, deleteLifeDomain,
    startLifeTimer, stopLifeTimer, logLifeSessionFeel, dismissLifeLog,
  }), [tickets, loaded, suggestions, rerouteSuggestions, activeTimer,
    pendingLog, missions, quotas, milestones,
    lifeDomains, lifeSessions, lifeTimer, pendingLifeLog, restBehind,
    updateStatus, addTicket, updateTicket, deleteTicket,
    bulkUpdateStatus, setAllTickets, dismissSuggestions,
    dismissSuggestion, acceptSuggestion, dismissReroute,
    startTimer, stopTimer, logSessionFeel, dismissLog,
    addMission, updateMission, deleteMission, setQuota,
    addMilestone, updateMilestone, deleteMilestone,
    updateLifeDomain, addLifeDomain, deleteLifeDomain,
    startLifeTimer, stopLifeTimer, logLifeSessionFeel, dismissLifeLog]);

  return <TicketContext.Provider value={value}>{children}</TicketContext.Provider>;
}

export function useTickets() {
  const ctx = useContext(TicketContext);
  if (!ctx) throw new Error("useTickets must be used within TicketProvider");
  return ctx;
}
