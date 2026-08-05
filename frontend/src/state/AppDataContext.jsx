// AppDataContext.jsx — the only mutable slice of app state. Everything in
// mockData.js is a frozen fleet snapshot; sites and operators can grow at
// runtime (adding a site / onboarding an operator), so they live here
// instead, seeded from the mock data.
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { SITES, OPERATORS, REGIONS, nextSiteId, nextOperatorId } from '@/data/mockData';

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const [sites, setSites] = useState(SITES);
  const [operators, setOperators] = useState(OPERATORS);

  // Site location is entered by user — site ID is randomly generated.
  const addSite = useCallback((name) => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    let created = null;
    setSites((prev) => {
      const site = {
        id: nextSiteId(prev),
        name: trimmed,
      };
      created = site;
      return [...prev, site];
    });
    return created;
  }, []);

  const addOperator = useCallback(({ name, email, phone, location }) => {
    const trimmed = (name || '').trim();
    if (!trimmed) return null;
    let created = null;
    setOperators((prev) => {
      const operator = {
        id: nextOperatorId(prev),
        name: trimmed,
        email: (email || '').trim(),
        phone: (phone || '').trim(),
        location: (location || '').trim(),
      };
      created = operator;
      return [...prev, operator];
    });
    return created;
  }, []);

  const value = useMemo(
    () => ({ sites, operators, addSite, addOperator }),
    [sites, operators, addSite, addOperator]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
