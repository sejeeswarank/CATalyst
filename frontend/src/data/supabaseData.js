import { supabase } from '@/lib/supabase';

export async function fetchAllData() {
  const [
    { data: equipmentRaw, error: eqErr },
    { data: historyRaw },
    { data: rentalRaw },
    { data: alertsRaw },
    { data: activityRaw },
    { data: sitesRaw },
    { data: operatorsRaw },
  ] = await Promise.all([
    supabase.from('equipment').select('*, sites(name, region)'),
    supabase.from('equipment_history').select('*').order('date', { ascending: true }),
    supabase.from('rental_history').select('*').order('end_date', { ascending: false }),
    supabase.from('alerts').select('*').order('timestamp', { ascending: false }),
    supabase.from('activity').select('*').order('timestamp', { ascending: false }),
    supabase.from('sites').select('*'),
    supabase.from('operators').select('*'),
  ]);

  if (eqErr) console.error('Supabase equipment fetch error:', eqErr);

  const today = new Date();

  const historyMap = {};
  (historyRaw || []).forEach((h) => {
    if (!historyMap[h.equipment_id]) historyMap[h.equipment_id] = [];
    historyMap[h.equipment_id].push({
      date: new Date(h.date),
      day: new Date(h.date).toLocaleDateString('en-US', { weekday: 'short' }),
      engineHours: Number(h.engine_hours),
      idleHours: Number(h.idle_hours),
      fuelUsage: Number(h.fuel_usage),
      location: h.location,
    });
  });

  const rentalMap = {};
  (rentalRaw || []).forEach((r) => {
    if (!rentalMap[r.equipment_id]) rentalMap[r.equipment_id] = [];
    rentalMap[r.equipment_id].push({
      client: r.client,
      start: new Date(r.start_date),
      end: new Date(r.end_date),
      operator: r.operator_name,
    });
  });

  const equipment = (equipmentRaw || []).map((e) => {
    const checkOutDate = e.check_out_date ? new Date(e.check_out_date) : null;
    const checkInDate = e.check_in_date ? new Date(e.check_in_date) : null;
    const lastServiceDate = e.last_service_date ? new Date(e.last_service_date) : null;
    const nextServiceDue = e.next_service_due ? new Date(e.next_service_due) : null;
    const rentalDaysLeft = checkInDate && e.is_rented
      ? Math.round((checkInDate - today) / 86400000)
      : null;
    const daysUntilService = nextServiceDue
      ? Math.round((nextServiceDue - today) / 86400000)
      : null;

    return {
      id: e.id,
      type: e.type,
      siteId: e.site_id,
      siteName: e.sites?.name || '',
      region: e.sites?.region || '',
      status: e.status,
      isRented: e.is_rented,
      operatorId: e.operator_id,
      checkOutDate,
      checkInDate,
      rentalDaysLeft,
      engineHoursToday: Number(e.engine_hours_today),
      idleHoursToday: Number(e.idle_hours_today),
      dailyRate: Number(e.daily_rate),
      rentedBy: e.rented_by,
      isOffline: e.is_offline,
      gpsLost: e.gps_lost,
      lastReturnedLate: e.last_returned_late,
      lastServiceDate,
      nextServiceDue,
      daysUntilService,
      maintenanceReason: e.maintenance_reason,
      history: historyMap[e.id] || [],
      rentalHistory: rentalMap[e.id] || [],
    };
  });

  const alerts = (alertsRaw || []).map((a) => {
    const eq = equipment.find((e) => e.id === a.equipment_id);
    return {
      id: a.id,
      type: a.type,
      equipmentId: a.equipment_id,
      vehicle: eq?.type || '',
      site: eq?.siteName || '',
      rentedBy: eq?.rentedBy || null,
      severity: a.severity,
      status: a.status,
      timestamp: new Date(a.timestamp),
    };
  });

  const activity = (activityRaw || []).map((a) => ({
    id: a.id,
    kind: a.kind,
    text: a.text,
    timestamp: new Date(a.timestamp),
  }));

  const sites = (sitesRaw || []).map((s) => ({
    id: s.id,
    name: s.name,
    region: s.region,
    // MachineryUsage renders this as the site's "Location" label
    location: s.region,
  }));

  const operators = (operatorsRaw || []).map((o) => ({
    id: o.id,
    name: o.name,
    email: o.email || '',
    phone: o.phone || '',
    location: o.location || '',
  }));

  return { equipment, alerts, activity, sites, operators };
}
