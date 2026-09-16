import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await login(email, password);
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="page auth-page">
      <Navbar />
      <main className="auth-shell">
        <h1>Sign in</h1>
        <form onSubmit={submit} className="auth-form">
          {error && <p className="error">{error}</p>}
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button className="btn" type="submit">
            Continue
          </button>
        </form>

        <div className="test-accounts-panel" style={{ marginTop: '2rem', padding: '1.25rem', background: 'rgba(255,255,255,0.85)', borderRadius: '16px', border: '1px solid var(--line)', maxWidth: '420px' }}>
          <p style={{ fontWeight: 600, margin: '0 0 0.5rem', fontSize: '0.9rem' }}>Pre-configured Test Accounts:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-sm"
              style={{ background: 'var(--sea-deep)', justifyContent: 'space-between' }}
              onClick={() => {
                setEmail('admin@digitalheroes.test');
                setPassword('password123');
              }}
            >
              <span>👑 Fill Admin</span>
              <small style={{ opacity: 0.8 }}>admin@digitalheroes.test</small>
            </button>
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              style={{ justifyContent: 'space-between' }}
              onClick={() => {
                setEmail('alex@digitalheroes.test');
                setPassword('password123');
              }}
            >
              <span>🏌️ Alex (Subscriber)</span>
              <small style={{ opacity: 0.8 }}>alex@digitalheroes.test</small>
            </button>
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              style={{ justifyContent: 'space-between' }}
              onClick={() => {
                setEmail('jordan@digitalheroes.test');
                setPassword('password123');
              }}
            >
              <span>🏌️ Jordan (Subscriber)</span>
              <small style={{ opacity: 0.8 }}>jordan@digitalheroes.test</small>
            </button>
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              style={{ justifyContent: 'space-between' }}
              onClick={() => {
                setEmail('sam@digitalheroes.test');
                setPassword('password123');
              }}
            >
              <span>🏌️ Sam (Subscriber)</span>
              <small style={{ opacity: 0.8 }}>sam@digitalheroes.test</small>
            </button>
          </div>
          <small style={{ display: 'block', marginTop: '0.5rem', color: 'rgba(18, 32, 28, 0.65)' }}>
            Password for all test accounts: <code>password123</code>
          </small>
        </div>

        <p className="muted" style={{ marginTop: '1.25rem' }}>
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </main>
    </div>
  );
}
