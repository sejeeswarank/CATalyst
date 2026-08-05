// Modal.jsx — usage: <Modal title="Confirm" onClose={fn}>...content...</Modal>
import Button from './Button';

export default function Modal({ title, children, onClose, onConfirm, confirmLabel = 'Confirm' }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {title && <div className="modal-title">{title}</div>}
        <div>{children}</div>
        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          {onConfirm && <Button variant="primary" onClick={onConfirm}>{confirmLabel}</Button>}
        </div>
      </div>
    </div>
  );
}
