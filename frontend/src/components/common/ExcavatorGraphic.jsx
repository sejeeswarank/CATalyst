// ExcavatorGraphic.jsx — stylized flat-vector excavator silhouette in the
// CAT black/yellow palette. No external image asset; renders crisp at any
// size and matches the rest of the icon-driven UI.
export default function ExcavatorGraphic({ className }) {
  return (
    <div className={`relative h-full w-full flex items-center justify-end ${className || ''}`}>
      <img
        src="/excavator.jpg"
        alt="CAT Excavator"
        className="h-full w-full object-contain md:object-cover object-right mix-blend-screen opacity-90 transition-transform duration-500 hover:scale-105"
      />
    </div>
  );
}
