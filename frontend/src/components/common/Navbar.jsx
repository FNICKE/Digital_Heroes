import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="site-nav">
      <Link to="/" className="brand">
        Digital Heroes
      </Link>
      <nav>
        <NavLink to="/charities">Causes</NavLink>
        {user ? (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            {isAdmin && <NavLink to="/admin">Admin</NavLink>}
            <button type="button" className="linkish" onClick={logout}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Sign in</NavLink>
            <Link to="/signup" className="btn btn-sm">
              Join
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
