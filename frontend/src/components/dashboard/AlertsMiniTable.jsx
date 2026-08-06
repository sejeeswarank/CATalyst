import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Check, Send, Eye, MapPin } from 'lucide-react';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import Button from '@/components/ui/button';
import StatusBadge from '@/components/common/StatusBadge';
import VehicleIcon from '@/components/common/VehicleIcon';
import { timeAgo } from '@/lib/utils';

const UNBOOKED_CHECKOUT_TYPE = 'Checked Out Without Booking';

export default function AlertsMiniTable({ alerts, isRentalView = false, emptyLabel = 'Nothing to show right now.' }) {
  const navigate = useNavigate();
  const [sentAlerts, setSentAlerts] = useState({});
  const [toastMessage, setToastMessage] = useState(null);

  const handleSendAlert = (alert) => {
    setSentAlerts((prev) => ({ ...prev, [alert.id]: true }));
    setToastMessage(`Email alert successfully sent to user regarding ${alert.equipmentId} (${alert.type})!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const openMap = (site) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-3">
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 rounded-xl bg-cat-black px-4 py-3 text-sm font-medium text-cat-yellow shadow-md animate-fade-in"
        >
          <Mail className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="rounded-2xl border border-border">
        <Table>
          <THead>
            <TR>
              <TH>Alert Type</TH>
              <TH>Equipment</TH>
              <TH>Image</TH>
              <TH>Site</TH>
              <TH>Rented By</TH>
              <TH>Reported</TH>
              <TH>Status</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <TBody>
            {alerts.map((a) => (
              <TR key={a.id}>
                <TD className="font-medium text-cat-black">{a.type}</TD>
                <TD>{a.equipmentId} · {a.vehicle}</TD>
                <TD><VehicleIcon type={a.vehicle} className="h-24 w-24" /></TD>
                <TD>{a.site}</TD>
                <TD className="font-medium text-cat-black">
                  {a.rentedBy || (isRentalView ? 'BuildRight Corp' : '—')}
                </TD>
                <TD className="text-cat-slate">{timeAgo(a.timestamp)}</TD>
                <TD><StatusBadge status={a.equipmentStatus} /></TD>
                <TD className="text-right">
                  <div className="flex justify-end gap-2">
                    {a.equipmentId && (
                      <Button variant="outline" size="sm" onClick={() => navigate(`/equipment/${a.equipmentId}`)}>
                        <Eye className="h-3.5 w-3.5" /> View Details
                      </Button>
                    )}
                    {a.type === UNBOOKED_CHECKOUT_TYPE && (
                      <Button variant="outline" size="sm" onClick={() => openMap(a.site)}>
                        <MapPin className="h-3.5 w-3.5" /> View Map
                      </Button>
                    )}
                    {isRentalView && (
                      sentAlerts[a.id] ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
                          <Check className="h-3.5 w-3.5" /> Email Sent
                        </span>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-cat-yellow bg-cat-yellow/10 hover:bg-cat-yellow hover:text-cat-black text-xs font-semibold"
                          onClick={() => handleSendAlert(a)}
                        >
                          <Send className="mr-1 h-3 w-3" /> Send Alert
                        </Button>
                      )
                    )}
                  </div>
                </TD>
              </TR>
            ))}
            {alerts.length === 0 && (
              <TR>
                <TD colSpan={8} className="py-8 text-center text-cat-slate">{emptyLabel}</TD>
              </TR>
            )}
          </TBody>
        </Table>
      </div>
    </div>
  );
}
