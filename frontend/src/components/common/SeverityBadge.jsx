import Badge from '@/components/ui/badge';

// Renders the alert's *status* (Active/Resolved), colored per the rule:
// critical -> red, warning -> orange, resolved -> green (regardless of
// the original severity).
export function StatusBadge({ severity, status }) {
  if (status === 'Resolved') {
    return <Badge variant="success" dot>Resolved</Badge>;
  }
  return <Badge variant={severity === 'critical' ? 'danger' : 'warning'} dot>Active</Badge>;
}

// Renders the alert's original severity, independent of resolution.
export function SeverityLabel({ severity }) {
  return (
    <Badge variant={severity === 'critical' ? 'danger' : 'warning'} dot>
      {severity === 'critical' ? 'Critical' : 'Warning'}
    </Badge>
  );
}

export default StatusBadge;
