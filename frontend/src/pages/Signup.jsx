import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { useAuth } from '../context/AuthContext';
import * as charityService from '../services/charityService';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [charities, setCharities] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    charityId: '',
    charityPercentage: 10,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    charityService.listCharities().then((res) => setCharities(res.data.charities));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signup({
        ...form,
        charityId: form.charityId || undefined,
        charityPercentage: Number(form.charityPercentage),
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="page auth-page">
      <Navbar />
      <main className="auth-shell">
        <h1>Join Digital Heroes</h1>
        <p className="lede">Pick your cause as you join — giving starts on day one.</p>
        <form onSubmit={submit} className="auth-form">
          {error && <p className="error">{error}</p>}
          <label>
            Name
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </label>
          <label>
            Your charity
            <select
              value={form.charityId}
              onChange={(e) => setForm({ ...form, charityId: e.target.value })}
            >
              <option value="">Choose later</option>
              {charities.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Charity % (min 10)
            <input
              type="number"
              min={10}
              max={100}
              value={form.charityPercentage}
              onChange={(e) =>
                setForm({ ...form, charityPercentage: e.target.value })
              }
            />
          </label>
          <button className="btn" type="submit">
            Create account
          </button>
        </form>
        <p className="muted">
          Already a member? <Link to="/login">Sign in</Link>
        </p>
      </main>
    </div>
  );
}
