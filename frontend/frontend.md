# frontend.md — CAT Hackathon Frontend Plan

> Your friend's single reference doc. Section 0 gets filled in by [YOUR NAME]
> within the 11:00-11:30am transit window, morning of. Everything below that
> is already decided — don't re-litigate it live.

## 0. Project Snapshot — fill this in first
- **Project name:** [ ]
- **One-sentence pitch:** [ ]
- **Core user action the demo must show:** [ ]
- **Shell:** [ A: Marketing/hero-led ]  or  [ B: Dashboard/tool-led ]
- **Pages needed (max 4):**
  | Page | Purpose | Priority |
  |---|---|---|
  | | | must-have / nice-to-have |

## Folder structure (this is real, already set up — not a plan)
```
frontend/
├── src/
│   ├── components/     ← all 9 components live here already
│   ├── pages/           ← empty, build here once shell/pages are chosen
│   ├── layouts/          ← empty, put Shell A / Shell B wrappers here
│   ├── styles/
│   │   ├── tokens.css     ← done
│   │   └── components.css ← done
│   ├── utils/
│   └── App.jsx           ← not created yet, wire up once pages exist
└── package.json           ← not created yet, run `npm create vite@latest` fresh
```

## Theme tokens (already built, don't change without a reason)
```css
--cat-yellow: #FFC500;
--cat-black: #101010;
--cat-gray-dark: #2b2b2b;
--cat-gray-light: #f4f4f4;
--font-display: 'Anton', 'Archivo Black', sans-serif;
--font-body: 'Inter', system-ui, sans-serif;
--radius: 4px;
--duration-fast: 150ms;
```
Full file: `tokens.css`. Style rules: `components.css`. Both plain CSS, no JS
animation logic — interactions (hover/press) are CSS `:hover`/`:active` only.

## Component kit — all 9 done, ready to import
| Component | Notes |
|---|---|
| Button | `.btn-primary` / `.btn-secondary` classes |
| Card | title + value or custom children |
| Navbar | flat nav — pass `logo` and `links` props, no mega-menu |
| Loader | drop in anywhere a backend call is pending |
| Modal | pass `title`, `onClose`, optional `onConfirm` |
| StatTile | label + number, reuses `.card` styling |
| Input | controlled — `value` + `onChange(newValue)` |
| TextArea | same pattern as Input |
| Badge | `variant`: default / success / warning / danger |

**Table is intentionally not built.** It's the one component expensive enough
(empty state, overflow, sorting) that building it blind isn't worth it. If the
problem needs tabular data, build it live against the real shape — faster than
reworking a guessed version.

## Coding rules
- PascalCase components, camelCase variables
- One component per file, no giant catch-all `Components.jsx`
- Style via CSS classes from `components.css` — no inline style objects, no
  animation libraries
- If a component needs `useState` just to look right on hover/press, that's a signal
  to move the behavior into CSS instead

## Rule for handling blockers
If backend isn't ready for an endpoint you need: use `mocks/sample-data.json`,
swap the fetch URL later. Don't wait.

## Open questions (add here, don't interrupt backend work for these)
- [ ]
