import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchAllData } from '@/data/supabaseData';

export const VEHICLE_TYPES = [
  'Excavator', 'Bulldozer', 'Crane', 'Grader', 'Wheel Loader', 'Dump Truck', 'Forklift',
];
export const REGIONS = ['North Region', 'South Region', 'East Region', 'West Region'];
export const TODAY = new Date();
export const IDLE_LIMIT_HOURS = 4;
// Assumed lost hours per machine sitting in Maintenance (one shift).
export const MAINTENANCE_DOWNTIME_HOURS = 8;

const RENTAL_ALERT_TYPES = ['Rental Expiring Tomorrow', 'Rental Overdue'];

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const [equipment, setEquipment] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activity, setActivity] = useState([]);
  const [sites, setSites] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData().then((data) => {
      setEquipment(data.equipment);
      setAlerts(data.alerts);
      setActivity(data.activity);
      setSites(data.sites);
      setOperators(data.operators);
      setLoading(false);
    });
  }, []);

  const getKpis = useCallback(() => {
    const total = equipment.length;
    const rented = equipment.filter((e) => e.isRented).length;
    const available = equipment.filter((e) => e.status === 'Available').length;
    const running = equipment.filter((e) => e.status === 'Running').length;
    const idle = equipment.filter((e) => e.status === 'Idle').length;
    const expiringSoon = equipment.filter((e) => e.isRented && e.rentalDaysLeft >= 0 && e.rentalDaysLeft <= 2).length;
    const maintenance = equipment.filter((e) => e.status === 'Maintenance').length;
    const activeOperators = new Set(equipment.filter((e) => e.operatorId).map((e) => e.operatorId)).size;
    return { total, rented, available, running, idle, expiringSoon, maintenance, activeOperators };
  }, [equipment]);

  const getEquipmentById = useCallback(
    (id) => equipment.find((e) => e.id === id),
    [equipment],
  );

  // ---- chart data ----
  const getUtilizationBreakdown = useCallback(() => {
    const k = getKpis();
    return [
      { name: 'Running', value: k.running, color: '#16A34A' },
      { name: 'Idle', value: k.idle, color: '#F59E0B' },
      { name: 'Available', value: k.available, color: '#2563EB' },
      { name: 'Maintenance', value: k.maintenance, color: '#DC2626' },
    ].filter((row) => row.value > 0);
  }, [getKpis]);

  const getEngineHoursTop = useCallback(
    (n = 10) =>
      [...equipment]
        .sort((a, b) => b.engineHoursToday - a.engineHoursToday)
        .slice(0, n)
        .map((e) => ({ name: e.id, hours: e.engineHoursToday })),
    [equipment],
  );

  const getIdleHoursTop = useCallback(
    (n = 10) =>
      [...equipment]
        .sort((a, b) => b.idleHoursToday - a.idleHoursToday)
        .slice(0, n)
        .map((e) => ({ name: e.id, hours: e.idleHoursToday })),
    [equipment],
  );

  const getRentalDistributionByType = useCallback(
    () =>
      VEHICLE_TYPES.map((type) => ({
        name: type,
        value: equipment.filter((e) => e.isRented && e.type === type).length,
      })).filter((row) => row.value > 0),
    [equipment],
  );

  // Fleet-wide fuel burn and engine hours per day, from equipment_history.
  const getFuelTrend = useCallback(() => {
    const byDay = new Map();
    equipment.forEach((e) => {
      e.history.forEach((h) => {
        const key = h.date.toISOString().slice(0, 10);
        const row = byDay.get(key) || { key, day: h.day, fuel: 0, engineHours: 0 };
        row.fuel += h.fuelUsage;
        row.engineHours += h.engineHours;
        byDay.set(key, row);
      });
    });
    return [...byDay.values()]
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((r) => ({
        day: r.day,
        fuel: Number(r.fuel.toFixed(1)),
        engineHours: Number(r.engineHours.toFixed(1)),
      }));
  }, [equipment]);

  // Downtime = idle hours today, plus a full shift (8h) for anything sitting
  // in Maintenance. The 8h figure is an assumption, not measured telemetry.
  const getDowntimeBySite = useCallback(
    () =>
      sites.map((site) => {
        const units = equipment.filter((e) => e.siteId === site.id);
        const idle = units.reduce((sum, e) => sum + e.idleHoursToday, 0);
        const maintenance = units.filter((e) => e.status === 'Maintenance').length * MAINTENANCE_DOWNTIME_HOURS;
        return {
          name: site.id,
          siteName: site.name,
          idle: Number(idle.toFixed(1)),
          maintenance,
        };
      }),
    [equipment, sites],
  );

  const getAlertKpis = useCallback(() => {
    const total = alerts.length;
    const critical = alerts.filter((a) => a.status === 'Active' && a.severity === 'critical').length;
    const warning = alerts.filter((a) => a.status === 'Active' && a.severity === 'warning').length;
    const resolved = alerts.filter((a) => a.status === 'Resolved').length;
    return { total, critical, warning, resolved };
  }, [alerts]);

  const getRentalAlerts = useCallback(
    () => alerts.filter((a) => RENTAL_ALERT_TYPES.includes(a.type)),
    [alerts],
  );

  const getEquipmentAlerts = useCallback(
    () => alerts.filter((a) => !RENTAL_ALERT_TYPES.includes(a.type)),
    [alerts],
  );

  const getMaintenanceKpis = useCallback(() => {
    const inMaintenance = equipment.filter((e) => e.status === 'Maintenance').length;
    const overdue = equipment.filter((e) => e.daysUntilService < 0).length;
    const dueThisWeek = equipment.filter((e) => e.daysUntilService >= 0 && e.daysUntilService <= 7).length;
    const avgDaysSinceService = equipment.length > 0
      ? Math.round(
          equipment.reduce((sum, e) => {
            const days = e.lastServiceDate ? Math.round((TODAY - e.lastServiceDate) / 86400000) : 0;
            return sum + days;
          }, 0) / equipment.length,
        )
      : 0;
    return { inMaintenance, overdue, dueThisWeek, avgDaysSinceService };
  }, [equipment]);

  const getMaintenanceSchedule = useCallback(
    () => [...equipment].sort((a, b) => (a.daysUntilService ?? 999) - (b.daysUntilService ?? 999)),
    [equipment],
  );

  const addSite = useCallback(async (name) => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const num = Math.floor(Math.random() * 900) + 100;
    const id = `ST${num}`;
    const site = { id, name: trimmed, region: 'Unassigned' };
    const { error } = await supabase.from('sites').insert(site);
    if (error) { console.error('addSite error:', error); return null; }
    setSites((prev) => [...prev, site]);
    return site;
  }, []);

  const addOperator = useCallback(async ({ name, email, phone, location }) => {
    const trimmed = (name || '').trim();
    if (!trimmed) return null;
    const max = operators.reduce((m, o) => {
      const n = Number(String(o.id).replace(/\D/g, ''));
      return Number.isFinite(n) ? Math.max(m, n) : m;
    }, 100);
    const id = `OP${max + 1}`;
    const operator = {
      id,
      name: trimmed,
      email: (email || '').trim(),
      phone: (phone || '').trim(),
      location: (location || '').trim(),
    };
    const { error } = await supabase.from('operators').insert(operator);
    if (error) { console.error('addOperator error:', error); return null; }
    setOperators((prev) => [...prev, operator]);
    return operator;
  }, [operators]);

  // Look up equipment by its RFID tag and flip it between checked-out
  // (Running) and checked-in (Available). Maintenance units reject the scan.
  // A real reader would emit the same tag string this function takes —
  // the click-to-scan UI and a physical scan are indistinguishable from here.
  const scanTag = useCallback(async (tagId) => {
    const tag = tagId.trim();
    if (!tag) return { ok: false, message: 'No tag provided.' };

    const eq = equipment.find((e) => e.rfidTag?.toLowerCase() === tag.toLowerCase());
    if (!eq) {
      await supabase.from('scan_log').insert({ tag_id: tag, action: 'rejected', reason: 'Unknown tag' });
      return { ok: false, message: `Tag ${tag} does not match any equipment.` };
    }

    if (eq.status === 'Maintenance') {
      await supabase.from('scan_log').insert({
        tag_id: tag, equipment_id: eq.id, action: 'rejected',
        site_id: eq.siteId, reason: 'Equipment in maintenance',
      });
      return { ok: false, message: `${eq.id} is in maintenance and can't be checked out.`, equipment: eq };
    }

    const isCheckingOut = eq.status === 'Available';
    const today = new Date();
    const updates = isCheckingOut
      ? { status: 'Running', is_rented: true, check_out_date: today.toISOString().slice(0, 10), check_in_date: null }
      : { status: 'Available', is_rented: false, check_in_date: today.toISOString().slice(0, 10), operator_id: null, rented_by: null };

    const { error } = await supabase.from('equipment').update(updates).eq('id', eq.id);
    if (error) {
      console.error('scanTag update error:', error);
      return { ok: false, message: 'Failed to update equipment — see console.' };
    }

    await supabase.from('scan_log').insert({
      tag_id: tag,
      equipment_id: eq.id,
      action: isCheckingOut ? 'check_out' : 'check_in',
      site_id: eq.siteId,
    });

    const updatedEq = {
      ...eq,
      status: updates.status,
      isRented: updates.is_rented,
      checkOutDate: isCheckingOut ? today : eq.checkOutDate,
      checkInDate: isCheckingOut ? null : today,
      operatorId: isCheckingOut ? eq.operatorId : null,
      rentedBy: isCheckingOut ? eq.rentedBy : null,
    };
    setEquipment((prev) => prev.map((e) => (e.id === eq.id ? updatedEq : e)));

    return {
      ok: true,
      action: isCheckingOut ? 'check_out' : 'check_in',
      equipment: updatedEq,
      message: isCheckingOut
        ? `${eq.id} checked out at ${eq.siteName}.`
        : `${eq.id} checked in at ${eq.siteName}.`,
    };
  }, [equipment]);

  const getRecentScans = useCallback(async (limit = 10) => {
    const { data, error } = await supabase
      .from('scan_log')
      .select('*')
      .order('scanned_at', { ascending: false })
      .limit(limit);
    if (error) { console.error('getRecentScans error:', error); return []; }
    return data;
  }, []);

  const value = useMemo(
    () => ({
      equipment, alerts, activity, sites, operators, loading,
      getKpis, getEquipmentById,
      getAlertKpis, getRentalAlerts, getEquipmentAlerts,
      getMaintenanceKpis, getMaintenanceSchedule,
      getUtilizationBreakdown, getEngineHoursTop, getIdleHoursTop,
      getRentalDistributionByType, getFuelTrend, getDowntimeBySite,
      addSite, addOperator, scanTag, getRecentScans,
    }),
    [equipment, alerts, activity, sites, operators, loading,
      getKpis, getEquipmentById,
      getAlertKpis, getRentalAlerts, getEquipmentAlerts,
      getMaintenanceKpis, getMaintenanceSchedule,
      getUtilizationBreakdown, getEngineHoursTop, getIdleHoursTop,
      getRentalDistributionByType, getFuelTrend, getDowntimeBySite,
      addSite, addOperator, scanTag, getRecentScans],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
