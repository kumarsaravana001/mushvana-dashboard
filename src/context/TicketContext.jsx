import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { INITIAL_TICKETS } from "../data/tickets";

const STORAGE_KEY = "mushvana-tickets";

const TicketContext = createContext(null);

export function TicketProvider({ children }) {
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setTickets(JSON.parse(saved));
    } catch {}
    setLoaded(true);
  }, []);

  const updateStatus = useCallback((id, newStatus) => {
    setTickets((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t));
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const value = useMemo(() => ({ tickets, loaded, updateStatus }), [tickets, loaded, updateStatus]);

  return <TicketContext.Provider value={value}>{children}</TicketContext.Provider>;
}

export function useTickets() {
  const ctx = useContext(TicketContext);
  if (!ctx) throw new Error("useTickets must be used within TicketProvider");
  return ctx;
}
