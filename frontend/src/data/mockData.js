// mockData.js — deterministic mock dataset for the CATalyst fleet dashboard.
// Everything here is generated once at module load using a seeded PRNG, so
// numbers stay stable across re-renders within a session but still look
// "real". Swap any of these arrays for a real API response later — the
// shapes are what pages/components consume, not this generator.

// ---- seeded PRNG (mulberry32) so the "random" data is reproducible ----
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260805);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
const randFloat = (min, max, decimals = 1) => Number((rand() * (max - min) + min).toFixed(decimals));
const chance = (p) => rand() < p;

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

export const TODAY = new Date();
export const IDLE_LIMIT_HOURS = 4;

// ---- reference data ----
export const VEHICLE_TYPES = [
  'Excavator',
  'Bulldozer',
  'Crane',
  'Grader',
  'Wheel Loader',
  'Dump Truck',
  'Forklift',
];

const DAILY_RATE = {
  Excavator: 450,
  Bulldozer: 700,
  Crane: 900,
  Grader: 560,
  'Wheel Loader': 500,
  'Dump Truck': 640,
  Forklift: 180,
};

export const REGIONS = ['North Region', 'South Region', 'East Region', 'West Region'];

const SITE_NAMES = [
  'Riverside Quarry',
  'Northgate Excavation',
  'Silver Creek Mine',
  'Union Bay Terminal',
  'Highland Construction Yard',
  'Cedar Ridge Site',
  'Copperfield Pit',
  'Blackstone Foundation',
  'Eastport Logistics Hub',
  'Summit Grading Project',
];

export const SITES = SITE_NAMES.map((name, i) => ({
  id: `ST${String(i + 1).padStart(2, '0')}`,
  name,
  region: REGIONS[i % REGIONS.length],
}));

// Generates a random unique site ID given whatever sites currently exist.
export function nextSiteId(existingSites) {
  const existingIds = new Set(existingSites.map((s) => s.id));
  let id;
  do {
    const num = Math.floor(Math.random() * 900) + 100;
    id = `ST${num}`;
  } while (existingIds.has(id));
  return id;
}

export function nextOperatorId(existingOperators) {
  const max = existingOperators.reduce((m, o) => {
    const n = Number(String(o.id).replace(/\D/g, ''));
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 100);
  return `OP${max + 1}`;
}

const ZONES = ['North Pit', 'South Pit', 'Loading Bay', 'Maintenance Bay', 'Perimeter Road', 'Crusher Station', 'Fuel Depot'];

const MAINTENANCE_REASONS = [
  'Engine inspection',
  'Hydraulic leak repair',
  'Brake system check',
  'Scheduled service',
  'Tire / track replacement',
  'Electrical fault',
];

const FIRST_NAMES = ['James', 'Maria', 'Robert', 'Linda', 'Michael', 'Patricia', 'David', 'Barbara', 'John', 'Elizabeth', 'Carlos', 'Sofia', 'Daniel', 'Emma', 'Thomas', 'Olivia', 'Kevin', 'Grace', 'Steven', 'Nina'];
const LAST_NAMES = ['Carter', 'Nguyen', 'Smith', 'Johnson', 'Brown', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Lee', 'Walker', 'Hall', 'Young', 'King', 'Wright', 'Scott', 'Torres', 'Green', 'Adams'];

export const OPERATORS = FIRST_NAMES.map((first, i) => ({
  id: `OP${101 + i}`,
  name: `${first} ${LAST_NAMES[i]}`,
}));

// ---- equipment fleet (50 units) ----
export const EQUIPMENT = Array.from({ length: 50 }, (_, i) => {
  const id = `EQX${1001 + i}`;
  const type = VEHICLE_TYPES[i % VEHICLE_TYPES.length];
  const site = pick(SITES);
  const dailyRate = DAILY_RATE[type];

  const isMaintenance = chance(0.1);
  const isRented = !isMaintenance && chance(0.58);

  let status = 'Available';
  let operatorId = null;
  let checkOutDate = null;
  let checkInDate = null;
  let rentalDaysLeft = null;
  let engineHoursToday = 0;
  let idleHoursToday = 0;
  let lastReturnedLate = false;

  if (isMaintenance) {
    status = 'Maintenance';
  } else if (isRented) {
    const hasOperator = chance(0.9);
    operatorId = hasOperator ? pick(OPERATORS).id : null;

    const rentalDurationDays = randInt(5, 30);
    const daysElapsed = randInt(1, rentalDurationDays + 5); // allow a few to run overdue
    checkOutDate = addDays(TODAY, -daysElapsed);
    checkInDate = addDays(checkOutDate, rentalDurationDays);
    rentalDaysLeft = Math.round((checkInDate - TODAY) / 86400000);

    const isRunning = chance(0.6);
    status = isRunning ? 'Running' : 'Idle';

    if (isRunning) {
      engineHoursToday = randFloat(3.5, 11, 1);
      idleHoursToday = randFloat(0, 1.5, 1);
    } else {
      engineHoursToday = randFloat(0, 1.5, 1);
      idleHoursToday = randFloat(1.5, 9, 1);
    }
  } else {
    lastReturnedLate = chance(0.15);
    checkInDate = addDays(TODAY, -randInt(1, 15));
  }

  // maintenance / service schedule — every machine has one, independent of
  // current rental state, so "days since service" is meaningful fleet-wide
  const serviceIntervalDays = 120;
  const daysSinceService = isMaintenance ? randInt(115, 160) : randInt(0, 130);
  const lastServiceDate = addDays(TODAY, -daysSinceService);
  const nextServiceDue = addDays(lastServiceDate, serviceIntervalDays);
  const maintenanceReason = isMaintenance ? pick(MAINTENANCE_REASONS) : null;

  return {
    id,
    type,
    siteId: site.id,
    siteName: site.name,
    region: site.region,
    status, // Running | Idle | Available | Maintenance
    isRented,
    operatorId,
    checkOutDate,
    checkInDate,
    rentalDaysLeft,
    engineHoursToday,
    idleHoursToday,
    dailyRate,
    isOffline: !isMaintenance && chance(0.06),
    gpsLost: !isMaintenance && chance(0.05),
    lastReturnedLate,
    lastServiceDate,
    nextServiceDue,
    daysUntilService: Math.round((nextServiceDue - TODAY) / 86400000),
    maintenanceReason,
    history: Array.from({ length: 7 }, (_, d) => {
      const base = isRented ? (status === 'Running' ? 6 : 2) : 1;
      const dailyEngineHours = Math.max(0, randFloat(base - 2.5, base + 3, 1));
      const dailyIdleHours = Math.max(0, randFloat(0.5, 5, 1));
      const date = addDays(TODAY, d - 6);
      return {
        date,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        engineHours: dailyEngineHours,
        idleHours: dailyIdleHours,
        fuelUsage: Math.max(0, randFloat(dailyEngineHours * 3.2, dailyEngineHours * 5.4 + 1, 1)),
        location: `${site.name} — ${pick(ZONES)}`,
      };
    }),
    rentalHistory: Array.from({ length: randInt(2, 4) }, (_, r) => {
      const end = addDays(TODAY, -randInt(20, 60) * (r + 1));
      const start = addDays(end, -randInt(5, 20));
      return {
        client: pick(['BuildRight Corp', 'Metro Infra', 'Granite & Co', 'Coastal Contractors', 'Apex Earthworks', 'Union Construction']),
        start,
        end,
        operator: pick(OPERATORS).name,
      };
    }),
  };
});

export function getEquipmentById(id) {
  return EQUIPMENT.find((e) => e.id === id);
}

// ---- derived KPIs ----
export function getKpis() {
  const total = EQUIPMENT.length;
  const rented = EQUIPMENT.filter((e) => e.isRented).length;
  const available = EQUIPMENT.filter((e) => e.status === 'Available').length;
  const running = EQUIPMENT.filter((e) => e.status === 'Running').length;
  const idle = EQUIPMENT.filter((e) => e.status === 'Idle').length;
  const expiringSoon = EQUIPMENT.filter((e) => e.isRented && e.rentalDaysLeft >= 0 && e.rentalDaysLeft <= 2).length;
  const maintenance = EQUIPMENT.filter((e) => e.status === 'Maintenance').length;
  const activeOperators = new Set(EQUIPMENT.filter((e) => e.operatorId).map((e) => e.operatorId)).size;

  return { total, rented, available, running, idle, expiringSoon, maintenance, activeOperators };
}

export function getUtilizationBreakdown() {
  const kpis = getKpis();
  return [
    { name: 'Running', value: kpis.running, color: '#16A34A' },
    { name: 'Idle', value: kpis.idle, color: '#F59E0B' },
    { name: 'Available', value: kpis.available, color: '#2563EB' },
    { name: 'Maintenance', value: kpis.maintenance, color: '#DC2626' },
  ];
}

export function getEngineHoursTop(n = 10) {
  return [...EQUIPMENT]
    .sort((a, b) => b.engineHoursToday - a.engineHoursToday)
    .slice(0, n)
    .map((e) => ({ name: e.id, hours: e.engineHoursToday }));
}

export function getIdleHoursTop(n = 10) {
  return [...EQUIPMENT]
    .sort((a, b) => b.idleHoursToday - a.idleHoursToday)
    .slice(0, n)
    .map((e) => ({ name: e.id, hours: e.idleHoursToday }));
}

export function getRentalDistributionByType() {
  return VEHICLE_TYPES.map((type) => ({
    name: type,
    value: EQUIPMENT.filter((e) => e.isRented && e.type === type).length,
  })).filter((row) => row.value > 0);
}

// ---- alerts, derived from business rules over the fleet ----
function buildAlerts() {
  const alerts = [];
  let seq = 1;

  const push = (type, e, severity) => {
    const hoursAgo = randInt(0, 47);
    const resolved = chance(0.3);
    alerts.push({
      id: `AL${String(seq++).padStart(4, '0')}`,
      type,
      equipmentId: e.id,
      vehicle: e.type,
      site: e.siteName,
      severity, // critical | warning
      status: resolved ? 'Resolved' : 'Active',
      timestamp: new Date(Date.now() - hoursAgo * 3600 * 1000),
    });
  };

  EQUIPMENT.forEach((e) => {
    if (e.isRented && e.idleHoursToday > IDLE_LIMIT_HOURS) {
      push('Idle Time Exceeded Allowed Limit', e, e.idleHoursToday > 7 ? 'critical' : 'warning');
    }
    if (e.isRented && e.rentalDaysLeft === 1) {
      push('Rental Expiring Tomorrow', e, 'warning');
    }
    if (e.isRented && e.rentalDaysLeft < 0) {
      push('Rental Overdue', e, 'critical');
    }
    if (e.status === 'Running' && !e.operatorId) {
      push('Machine Running without Operator', e, 'critical');
    }
    if (e.isRented && !e.operatorId && e.status !== 'Running') {
      push('Operator Not Assigned', e, 'warning');
    }
    if (e.isOffline) {
      push('Machine Offline', e, 'critical');
    }
    if (e.status === 'Maintenance') {
      push('Maintenance Due', e, 'warning');
    }
    if (e.gpsLost) {
      push('GPS Signal Lost (Simulation)', e, 'warning');
    }
    if (e.isRented && e.status === 'Running' && e.engineHoursToday < 2) {
      push('Equipment Under-utilized', e, 'warning');
    }
    if (e.lastReturnedLate) {
      push('Machine Returned Late', e, 'warning');
    }
  });

  return alerts.sort((a, b) => b.timestamp - a.timestamp);
}

export const ALERTS = buildAlerts();

const RENTAL_ALERT_TYPES = ['Rental Expiring Tomorrow', 'Rental Overdue'];

// Alerts about the rental clock (ending soon / overdue) vs. everything else
// (machine condition, telemetry, staffing) — split for the two Dashboard sections.
export function getRentalAlerts() {
  return ALERTS.filter((a) => RENTAL_ALERT_TYPES.includes(a.type));
}

export function getEquipmentAlerts() {
  return ALERTS.filter((a) => !RENTAL_ALERT_TYPES.includes(a.type));
}

export function getAlertKpis() {
  const total = ALERTS.length;
  const critical = ALERTS.filter((a) => a.status === 'Active' && a.severity === 'critical').length;
  const warning = ALERTS.filter((a) => a.status === 'Active' && a.severity === 'warning').length;
  const resolved = ALERTS.filter((a) => a.status === 'Resolved').length;
  return { total, critical, warning, resolved };
}

// ---- recent activity feed (dashboard) ----
function buildActivity() {
  const templates = [
    (e) => ({ kind: 'checkin', text: `Operator ${e.operatorId ?? pick(OPERATORS).id} checked in ${e.type} ${e.id}` }),
    () => ({ kind: 'engine-start', text: `Engine started` }),
    () => ({ kind: 'rental-ending', text: `Rental ending tomorrow` }),
    () => ({ kind: 'idle-alert', text: `Idle limit exceeded` }),
    () => ({ kind: 'returned', text: `Equipment returned` }),
  ];

  return Array.from({ length: 12 }, (_, i) => {
    const e = pick(EQUIPMENT);
    const tmpl = pick(templates);
    const { kind, text } = tmpl(e);
    return {
      id: `ACT${i + 1}`,
      kind,
      text: kind === 'checkin' ? text : `${text} — ${e.type} ${e.id} (${e.siteName})`,
      timestamp: new Date(Date.now() - randInt(2, 720) * 60 * 1000),
    };
  }).sort((a, b) => b.timestamp - a.timestamp);
}

export const ACTIVITY = buildActivity();

// ---- vehicle maintenance analysis (Analytics page) ----
export function getMaintenanceKpis() {
  const inMaintenance = EQUIPMENT.filter((e) => e.status === 'Maintenance').length;
  const overdue = EQUIPMENT.filter((e) => e.daysUntilService < 0).length;
  const dueThisWeek = EQUIPMENT.filter((e) => e.daysUntilService >= 0 && e.daysUntilService <= 7).length;
  const avgDaysSinceService = Math.round(
    EQUIPMENT.reduce((sum, e) => sum + Math.round((TODAY - e.lastServiceDate) / 86400000), 0) / EQUIPMENT.length
  );
  return { inMaintenance, overdue, dueThisWeek, avgDaysSinceService };
}

export function getMaintenanceByType() {
  return VEHICLE_TYPES.map((type) => ({
    name: type,
    value: EQUIPMENT.filter((e) => e.type === type && (e.status === 'Maintenance' || e.daysUntilService < 0)).length,
  })).filter((row) => row.value > 0);
}

export function getMaintenanceSchedule() {
  return [...EQUIPMENT].sort((a, b) => a.daysUntilService - b.daysUntilService);
}
