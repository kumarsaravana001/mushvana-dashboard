import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { INITIAL_TICKETS } from "../data/tickets";
import { needsMigration, migrateTickets } from "../utils/migrate";

const STORAGE_KEY = "mushvana-tickets";
const TIMER_KEY = "mushvana-timer";

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
      setTickets((curTickets) => {
        const next = curTickets.map((t) => {
          if (t.id !== prev.ticketId) return t;
          const sessions = [...(t.time_sessions || []), { start: prev.start, end: now, duration_minutes: Math.max(duration, 1) }];
          return { ...t, time_sessions: sessions, updated_at: now };
        });
        persist(next);
        return next;
      });
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

  const value = useMemo(() => ({
    tickets, loaded, suggestions, rerouteSuggestions, activeTimer,
    updateStatus, addTicket, updateTicket, deleteTicket,
    bulkUpdateStatus, setAllTickets, dismissSuggestions,
    dismissSuggestion, acceptSuggestion, dismissReroute,
    startTimer, stopTimer,
  }), [tickets, loaded, suggestions, rerouteSuggestions, activeTimer,
    updateStatus, addTicket, updateTicket, deleteTicket,
    bulkUpdateStatus, setAllTickets, dismissSuggestions,
    dismissSuggestion, acceptSuggestion, dismissReroute,
    startTimer, stopTimer]);

  return <TicketContext.Provider value={value}>{children}</TicketContext.Provider>;
}

export function useTickets() {
  const ctx = useContext(TicketContext);
  if (!ctx) throw new Error("useTickets must be used within TicketProvider");
  return ctx;
}
