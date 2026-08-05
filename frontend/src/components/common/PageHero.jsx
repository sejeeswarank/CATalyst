// PageHero.jsx — full-bleed dark banner used under the navbar, echoing
// Caterpillar's investor-relations page headers (bold uppercase title over a
// dark image-style band with a yellow accent). Optional bgImage adds equipment
// photo on the right with gradient fade.
export default function PageHero({ eyebrow, title, subtitle, action, illustration, bgImage }) {
  return (
    <div className="relative -mx-6 -mt-6 mb-6 overflow-hidden bg-gradient-to-br from-cat-black via-cat-ink to-cat-charcoal px-8 py-12 text-white sm:px-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {bgImage && (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-1/2"
          style={{
            backgroundImage: `url('${bgImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center right',
            mask: 'linear-gradient(to right, transparent 0%, black 40%, black 100%)',
            WebkitMask: 'linear-gradient(to right, transparent 0%, black 40%, black 100%)',
          }}
        />
      )}

      <div
        className="pointer-events-none absolute -right-10 top-0 h-full w-1/2 opacity-70"
        style={{
          background:
            'repeating-linear-gradient(115deg, transparent 0, transparent 78px, #FFC72C 78px, #FFC72C 80px)',
        }}
      />



      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="md:max-w-[55%]">
          {eyebrow && (
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cat-yellow">{eyebrow}</p>
          )}
          <h1 className="mt-2 font-display text-3xl uppercase tracking-tight text-white sm:text-4xl">
            {title}
          </h1>
          {subtitle && <p className="mt-2 max-w-xl text-sm normal-case text-white/70">{subtitle}</p>}
        </div>
        {action && <div className="relative shrink-0">{action}</div>}
      </div>
    </div>
  );
}
