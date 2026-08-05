import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import EquipmentDetails from './pages/EquipmentDetails';
import CheckAvailability from './pages/CheckAvailability';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import DemandForecastPanel from './components/DemandForecastPanel';
import MachineryUsage from './pages/MachineryUsage';
import Settings from './pages/Settings';

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
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
