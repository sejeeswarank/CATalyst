import Badge from '@/components/ui/badge';

const STATUS_MAP = {
  Running: 'success',
  Idle: 'warning',
  Available: 'info',
  Maintenance: 'danger',
  Booked: 'yellow',
};

export default function StatusBadge({ status }) {
  return (
    <Badge variant={STATUS_MAP[status] || 'default'} dot>
      {status}
    </Badge>
  );
}
