import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';

const links = [
  { to: '/admin/users', label: 'Users & subscriptions' },
  { to: '/admin/draws', label: 'Draws' },
  { to: '/admin/charities', label: 'Charities' },
  { to: '/admin/winners', label: 'Winners' },
  { to: '/admin/reports', label: 'Reports' },
];

export default function AdminDashboard() {
  return (
    <div className="page">
      <Navbar />
      <main className="section">
        <p className="eyebrow">Admin</p>
        <h1>Control surfaces</h1>
        <div className="admin-nav-grid">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="admin-tile">
              {l.label}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
