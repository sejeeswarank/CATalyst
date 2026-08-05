// Button.jsx — plain markup, all styling from components.css. No JS interaction logic.
// Usage: <Button variant="primary" onClick={fn}>Deploy</Button>

export default function Button({ variant = 'primary', children, onClick, disabled }) {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
