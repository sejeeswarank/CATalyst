import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function FuelTrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="fuelFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFC72C" stopOpacity={0.7} />
            <stop offset="100%" stopColor="#FFC72C" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E7" />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#3A3A3E' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#3A3A3E' }} axisLine={false} tickLine={false} />
        <Tooltip
          cursor={{ fill: '#F7F7F8' }}
          contentStyle={{ borderRadius: 12, border: '1px solid #E5E5E7', fontSize: 13 }}
          formatter={(value, name) => [name === 'Fuel Used (L)' ? `${value} L` : `${value} h`, name]}
        />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          formatter={(value) => <span className="text-xs text-cat-slate">{value}</span>}
        />
        <Area
          type="monotone"
          dataKey="fuel"
          name="Fuel Used (L)"
          stroke="#FFC72C"
          strokeWidth={2}
          fill="url(#fuelFill)"
        />
        <Line
          type="monotone"
          dataKey="engineHours"
          name="Engine Hours"
          stroke="#101010"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
