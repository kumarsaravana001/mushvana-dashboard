import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { INITIAL_TICKETS } from "../data/tickets";
import { needsMigration, migrateTickets } from "../utils/migrate";

const STORAGE_KEY = "mushvana-tickets";

const TicketContext = createContext(null);

function persist(tickets) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets)); } catch {}
}

export function TicketProvider({ children }) {
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [loaded, setLoaded] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

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

  const updateStatus = useCallback((id, newStatus) => {
    setTickets((prev) => {
      const now = new Date().toISOString();
      const next = prev.map((t) => {
        if (t.id !== id) return t;
        return {
          ...t,
          status: newStatus,
          date_closed: newStatus === "Done" ? now.slice(0, 10) : null,
          updated_at: now,
        };
      });
      persist(next);
      if (newStatus === "Done") checkUnblocked(next, id);
      return next;
    });
  }, [checkUnblocked]);

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

  const value = useMemo(() => ({
    tickets, loaded, suggestions,
    updateStatus, addTicket, updateTicket, deleteTicket,
    bulkUpdateStatus, setAllTickets, dismissSuggestions,
  }), [tickets, loaded, suggestions, updateStatus, addTicket, updateTicket, deleteTicket, bulkUpdateStatus, setAllTickets, dismissSuggestions]);

  return <TicketContext.Provider value={value}>{children}</TicketContext.Provider>;
}

export function useTickets() {
  const ctx = useContext(TicketContext);
  if (!ctx) throw new Error("useTickets must be used within TicketProvider");
  return ctx;
}
