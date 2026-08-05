import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#FFC72C', '#101010', '#F59E0B', '#2563EB', '#16A34A', '#DC2626', '#7C3AED'];

export default function RentalDistributionPieChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" outerRadius={95} strokeWidth={0}>
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5E5E7', fontSize: 13 }} />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          formatter={(value) => <span className="text-xs text-cat-slate">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
