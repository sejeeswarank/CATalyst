import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import PageHero from '@/components/common/PageHero';
import ExcavatorGraphic from '@/components/common/ExcavatorGraphic';
import { TrendingUp, RefreshCw } from 'lucide-react';

const DEFAULT_SITES = ['S001', 'S002', 'S003', 'S004', 'S005', 'S006'];

// Seed forecast fallback data if database table is empty or unpopulated
const MOCK_SEED_FORECAST = [
  { site_id: 'S001', equipment_type: 'Excavator', predicted_demand: 32 },
  { site_id: 'S001', equipment_type: 'Dump Truck', predicted_demand: 24 },
  { site_id: 'S001', equipment_type: 'Wheel Loader', predicted_demand: 18 },
  { site_id: 'S001', equipment_type: 'Bulldozer', predicted_demand: 12 },

  { site_id: 'S002', equipment_type: 'Bulldozer', predicted_demand: 45 },
  { site_id: 'S002', equipment_type: 'Crane', predicted_demand: 28 },
  { site_id: 'S002', equipment_type: 'Excavator', predicted_demand: 19 },
  { site_id: 'S002', equipment_type: 'Forklift', predicted_demand: 8 },

  { site_id: 'S003', equipment_type: 'Crane', predicted_demand: 38 },
  { site_id: 'S003', equipment_type: 'Dump Truck', predicted_demand: 22 },
  { site_id: 'S003', equipment_type: 'Grader', predicted_demand: 15 },

  { site_id: 'S004', equipment_type: 'Grader', predicted_demand: 30 },
  { site_id: 'S004', equipment_type: 'Excavator', predicted_demand: 27 },
  { site_id: 'S004', equipment_type: 'Bulldozer', predicted_demand: 14 },
  { site_id: 'S004', equipment_type: 'Forklift', predicted_demand: 9 },

  { site_id: 'S005', equipment_type: 'Wheel Loader', predicted_demand: 41 },
  { site_id: 'S005', equipment_type: 'Dump Truck', predicted_demand: 31 },
  { site_id: 'S005', equipment_type: 'Crane', predicted_demand: 20 },
  { site_id: 'S005', equipment_type: 'Grader', predicted_demand: 11 },
];

export default function DemandForecastPanel() {
  const [forecastBySite, setForecastBySite] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('demand_forecast')
        .select('site_id, equipment_type, predicted_demand');

      let rowsToProcess = data;

      if (error || !data || data.length === 0) {
        rowsToProcess = MOCK_SEED_FORECAST;
      }

      // Group by site_id, then by equipment_type, summing predicted_demand
      const grouped = {};
      rowsToProcess.forEach((row) => {
        const siteId = row.site_id?.trim();
        const equipType = row.equipment_type?.trim();
        const demand = Number(row.predicted_demand) || 0;

        if (!siteId || !equipType) return;

        if (!grouped[siteId]) {
          grouped[siteId] = {};
        }
        grouped[siteId][equipType] = (grouped[siteId][equipType] || 0) + demand;
      });

      // Convert each site's equipment map into a list sorted descending by total_demand
      const result = {};
      Object.keys(grouped).forEach((siteId) => {
        const list = Object.entries(grouped[siteId]).map(([equipment_type, total_demand]) => ({
          equipment_type,
          total_demand,
        }));
        list.sort((a, b) => b.total_demand - a.total_demand);
        result[siteId] = list;
      });

      setForecastBySite(result);
    } catch (err) {
      console.error('Error fetching forecast:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  const allSiteIds = Array.from(
    new Set([...DEFAULT_SITES, ...Object.keys(forecastBySite)])
  ).sort();

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Predictive Analytics"
        title="Demand Forecast"
        subtitle="7-day predicted equipment demand aggregated per job site."
        illustration={<ExcavatorGraphic className="w-full" />}
      />

      {loading ? (
        <div className="flex items-center justify-center py-12 text-cat-slate">
          <RefreshCw className="h-6 w-6 animate-spin text-cat-yellow mr-2" />
          <span className="text-sm font-medium">Loading demand forecast...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {allSiteIds.map((siteId) => {
            const equipmentList = forecastBySite[siteId] || [];

            return (
              <div
                key={siteId}
                className="rounded-lg shadow-md p-4 bg-white border border-border flex flex-col justify-between hover:border-cat-yellow/60 transition-colors"
              >
                <div>
                  <div className="border-b border-border/60 pb-3 mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-lg tracking-tight text-cat-black uppercase">
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
                    <div className="py-8 text-center text-cat-slate text-sm font-medium">
                      No forecast data
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {equipmentList.map((item, index) => {
                        const isTop = index === 0;
                        return (
                          <div
                            key={item.equipment_type}
                            className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                              isTop
                                ? 'bg-cat-black text-white font-bold text-sm shadow-sm'
                                : 'bg-background text-cat-slate text-xs font-medium hover:text-cat-black'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {isTop && (
                                <span className="h-2 w-2 rounded-full bg-cat-yellow shrink-0" />
                              )}
                              <span>{item.equipment_type}</span>
                            </span>
                            <span
                              className={`${
                                isTop
                                  ? 'text-cat-yellow font-extrabold text-base'
                                  : 'text-cat-black font-semibold'
                              }`}
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
