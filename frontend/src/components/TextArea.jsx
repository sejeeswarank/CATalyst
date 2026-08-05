// TextArea.jsx — usage: <TextArea value={val} onChange={setVal} placeholder="Notes" />
export default function TextArea({ value, onChange, placeholder }) {
  return (
    <textarea
      className="textarea"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
