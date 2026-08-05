import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function IdleHoursBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E7" />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#3A3A3E' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#3A3A3E' }} axisLine={false} tickLine={false} />
        <Tooltip
          cursor={{ fill: '#F7F7F8' }}
          contentStyle={{ borderRadius: 12, border: '1px solid #E5E5E7', fontSize: 13 }}
        />
        <Bar dataKey="hours" fill="#F59E0B" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
