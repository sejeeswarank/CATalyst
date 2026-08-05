import { useState, useEffect } from 'react';
import PageHero from '@/components/common/PageHero';
import Button from '@/components/ui/button';
import { TrendingUp, RefreshCw, AlertTriangle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function DemandForecastPanel() {
  const [forecastBySite, setForecastBySite] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/forecast`);
      const payload = await res.json();
      if (payload.error) throw new Error(payload.error);

      const grouped = {};
      payload.data.forEach(({ site_id, equipment_type, predicted_demand }) => {
        if (!site_id || !equipment_type) return;
        if (!grouped[site_id]) grouped[site_id] = {};
        grouped[site_id][equipment_type] =
          (grouped[site_id][equipment_type] || 0) + (Number(predicted_demand) || 0);
      });

      const result = {};
      Object.keys(grouped).forEach((siteId) => {
        result[siteId] = Object.entries(grouped[siteId])
          .map(([equipment_type, total_demand]) => ({ equipment_type, total_demand }))
          .sort((a, b) => b.total_demand - a.total_demand);
      });

      setForecastBySite(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  const siteIds = Object.keys(forecastBySite).sort();

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Predictive Analytics"
        title="Demand Forecast"
        subtitle="7-day equipment demand predicted by the trained model from historical site data."
        bgImage="/hero-equipment.png"
      />

      {loading ? (
        <div className="flex items-center justify-center py-12 text-cat-slate">
          <RefreshCw className="mr-2 h-6 w-6 animate-spin text-cat-yellow" />
          <span className="text-sm font-medium">Running demand model…</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-white py-16 text-center">
          <AlertTriangle className="h-10 w-10 text-danger" />
          <p className="text-sm font-semibold text-cat-black">Could not reach the forecast service</p>
          <p className="max-w-md text-xs text-cat-slate">{error}</p>
          <p className="text-xs text-cat-slate/70">
            Start the backend with <code className="rounded bg-background px-1.5 py-0.5">python app.py</code> in the backend folder.
          </p>
          <Button variant="primary" size="sm" onClick={fetchForecast}>
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {siteIds.map((siteId) => {
            const equipmentList = forecastBySite[siteId] || [];

            return (
              <div
                key={siteId}
                className="flex flex-col justify-between rounded-lg border border-border bg-white p-4 shadow-md transition-colors hover:border-cat-yellow/60"
              >
                <div>
                  <div className="mb-3 flex items-start justify-between border-b border-border/60 pb-3">
                    <div>
                      <h3 className="font-display text-lg uppercase tracking-tight text-cat-black">
                        Site {siteId}
                      </h3>
                      <p className="text-xs font-medium text-cat-slate">
                        Next 7 Days — Predicted Demand
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-cat-black px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cat-yellow">
                      <TrendingUp className="h-3 w-3" /> Forecast
                    </span>
                  </div>

                  {equipmentList.length === 0 ? (
                    <div className="py-8 text-center text-sm font-medium text-cat-slate">
                      No forecast data
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {equipmentList.map((item, index) => {
                        const isTop = index === 0;
                        return (
                          <div
                            key={item.equipment_type}
                            className={`flex items-center justify-between rounded-md px-3 py-2 transition-colors ${
                              isTop
                                ? 'bg-cat-black text-sm font-bold text-white shadow-sm'
                                : 'bg-background text-xs font-medium text-cat-slate hover:text-cat-black'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {isTop && <span className="h-2 w-2 shrink-0 rounded-full bg-cat-yellow" />}
                              <span>{item.equipment_type}</span>
                            </span>
                            <span
                              className={
                                isTop
                                  ? 'text-base font-extrabold text-cat-yellow'
                                  : 'font-semibold text-cat-black'
                              }
                            >
                              ×{item.total_demand}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
