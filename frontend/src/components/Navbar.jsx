// Navbar.jsx — flat nav, no mega-menu. Swap logo text and links array per project.
export default function Navbar({ logo = 'PROJECT', links = [] }) {
  return (
    <nav className="navbar">
      <span className="navbar-logo">{logo}</span>
      <ul className="navbar-links">
        {links.map((l) => (
          <li key={l.href}><a href={l.href}>{l.label}</a></li>
        ))}
      </ul>
    </nav>
  );
}
