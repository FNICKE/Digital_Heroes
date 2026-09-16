import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as charityService from '../../services/charityService';
import * as authService from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

export default function CharityPanel({ onError }) {
  const { user, refreshUser } = useAuth();
  const [charities, setCharities] = useState([]);
  const [pct, setPct] = useState(user?.charityPercentage || 10);
  const [charityId, setCharityId] = useState(user?.charityId || '');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    charityService.listCharities().then((res) => setCharities(res.data.charities));
  }, []);

  useEffect(() => {
    setPct(user?.charityPercentage || 10);
    setCharityId(user?.charityId || '');
  }, [user]);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await authService.updateMyCharity({
        charityId: charityId || null,
        charityPercentage: Number(pct),
      });
      await refreshUser();
    } catch (err) {
      onError?.(err.response?.data?.message || 'Could not update charity');
    } finally {
      setBusy(false);
    }
  };

  const selected = charities.find((c) => c._id === charityId);

  return (
    <div className="panel charity-panel">
      <h3>Your cause</h3>
      <p className="lede">
        At least 10% of every membership fee routes to a charity you choose — the heart of Digital Heroes.
      </p>
      {selected && (
        <Link className="cause-link" to={`/charities/${selected._id}`}>
          {selected.name}
        </Link>
      )}
      <form onSubmit={save} className="charity-form">
        <label>
          Charity
          <select value={charityId || ''} onChange={(e) => setCharityId(e.target.value)}>
            <option value="">Select a cause</option>
            {charities.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Percentage (min 10%)
          <input
            type="number"
            min={10}
            max={100}
            value={pct}
            onChange={(e) => setPct(e.target.value)}
          />
        </label>
        <button className="btn" type="submit" disabled={busy}>
          Save cause
        </button>
      </form>
    </div>
  );
}
