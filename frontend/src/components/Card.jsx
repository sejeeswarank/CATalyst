// Card.jsx — plain markup, all styling from components.css. No JS interaction logic.
// Usage: <Card title="Fleet Uptime" value="94%" /> or wrap children for custom content

export default function Card({ title, value, children }) {
  return (
    <div className="card">
      {title && <div className="card-title">{title}</div>}
      {value && <div className="card-value">{value}</div>}
      {children}
    </div>
  );
}
