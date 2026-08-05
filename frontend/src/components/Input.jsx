// Input.jsx — usage: <Input value={val} onChange={setVal} placeholder="Name" />
export default function Input({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      className="input"
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
