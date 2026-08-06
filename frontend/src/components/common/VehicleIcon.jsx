// VehicleIcon.jsx — real CAT equipment photos per vehicle type, served from
// /public/vehicles. Falls back to a plain placeholder for any type without
// a photo on file.
const IMAGES = {
  Excavator: '/vehicles/excavator.jpg',
  Bulldozer: '/vehicles/bulldozer.jpg',
  'Backhoe Loader': '/vehicles/backhoe-loader.jpg',
  Grader: '/vehicles/grader.jpg',
  'Wheel Loader': '/vehicles/wheel-loader.jpg',
  'Dump Truck': '/vehicles/dump-truck.jpg',
  Forklift: '/vehicles/forklift.jpg',
};

export default function VehicleIcon({ type, className = 'h-10 w-10', bg = 'bg-white', padded = true }) {
  const src = IMAGES[type];
  return (
    <div className={`shrink-0 overflow-hidden rounded-lg ${bg} ${padded ? 'p-1' : ''} ${className}`}>
      {src ? (
        <img src={src} alt={type} loading="lazy" className="h-full w-full object-contain" />
      ) : (
        <div className="h-full w-full rounded bg-cat-black/10" />
      )}
    </div>
  );
}
