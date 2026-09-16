import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Toast from '../components/common/Toast';
import LoadingState from '../components/common/LoadingState';
import * as charityService from '../services/charityService';
import { useAuth } from '../context/AuthContext';

export default function CharityProfile() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('10');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    charityService
      .getCharity(id)
      .then((res) => setCharity(res.data.charity))
      .finally(() => setLoading(false));
  }, [id]);

  const donate = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    try {
      await charityService.createDonation({
        charityId: id,
        amount: Number(amount),
      });
      setMsg('Thank you — donation recorded.');
      setAmount('10');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Donation failed');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <Navbar />
        <LoadingState />
      </div>
    );
  }

  if (!charity) {
    return (
      <div className="page">
        <Navbar />
        <main className="section">
          <p>Cause not found.</p>
        </main>
      </div>
    );
  }

  const img = charity.images?.[0];

  return (
    <div className="page charity-profile-page">
      <Navbar />
      <Toast message={msg} onClose={() => setMsg('')} />
      <section
        className="cause-hero"
        style={img ? { backgroundImage: `url(${img})` } : undefined}
      >
        <div className="hero-veil" />
        <div className="hero-content">
          <p className="brand-mark">Digital Heroes</p>
          <h1>{charity.name}</h1>
          <p className="hero-sub">{charity.description}</p>
        </div>
      </section>

      <section className="section dual-section">
        <div>
          <h2>Independent donation</h2>
          <p className="lede">
            Give outside of gameplay — this does not affect draw eligibility.
          </p>
          {isAuthenticated ? (
            <form className="auth-form" onSubmit={donate}>
              <label>
                Amount (£)
                <input
                  type="number"
                  min={1}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </label>
              <button className="btn" type="submit" disabled={busy}>
                {busy ? 'Sending…' : 'Donate'}
              </button>
            </form>
          ) : (
            <p>
              <Link to="/login">Sign in</Link> to make an independent donation.
            </p>
          )}
        </div>
        {charity.events?.length > 0 && (
          <div>
            <h2>Upcoming moments</h2>
            <ul className="event-list">
              {charity.events.map((ev, i) => (
                <li key={i}>
                  <strong>{ev.title}</strong>
                  <span>
                    {ev.date ? new Date(ev.date).toLocaleDateString() : ''}
                    {ev.location ? ` · ${ev.location}` : ''}
                  </span>
                  <p>{ev.details}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
