// Badge.jsx — usage: <Badge variant="success">Active</Badge>
export default function Badge({ variant = 'default', children }) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}
