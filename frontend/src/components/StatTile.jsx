// StatTile.jsx — usage: <StatTile label="Fleet Uptime" value="94%" />
export default function StatTile({ label, value }) {
  return (
    <div className="card">
      <div className="stat-label">{label}</div>
      <div className="stat-number">{value}</div>
    </div>
  );
}
