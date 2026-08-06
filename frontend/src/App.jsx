import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';

// Lazy-loaded per route so each page (and heavy deps like Recharts) ships in
// its own chunk instead of one large bundle. Suspense fallback lives in
// AppLayout, so the header stays put while a page chunk loads.
const Dashboard = lazy(() => import('./pages/Dashboard'));
const EquipmentDetails = lazy(() => import('./pages/EquipmentDetails'));
const CheckAvailability = lazy(() => import('./pages/CheckAvailability'));
const Alerts = lazy(() => import('./pages/Alerts'));
const Analytics = lazy(() => import('./pages/Analytics'));
const DemandForecastPanel = lazy(() => import('./components/DemandForecastPanel'));
const MachineryUsage = lazy(() => import('./pages/MachineryUsage'));
const Maintenance = lazy(() => import('./pages/Maintenance'));
const ScanEquipment = lazy(() => import('./pages/ScanEquipment'));
const Settings = lazy(() => import('./pages/Settings'));

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/equipment/:id" element={<EquipmentDetails />} />
        <Route path="/availability" element={<CheckAvailability />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/forecast" element={<DemandForecastPanel />} />
        <Route path="/machinery-usage" element={<MachineryUsage />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/scan" element={<ScanEquipment />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
