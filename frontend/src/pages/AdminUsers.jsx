import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import UserTable from '../components/admin/UserTable';
import Toast from '../components/common/Toast';
import Pagination from '../components/common/Pagination';
import * as drawService from '../services/drawService';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [subs, setSubs] = useState([]);
  const [userPage, setUserPage] = useState(1);
  const [subPage, setSubPage] = useState(1);
  const pageSize = 10;
  const [selectedUser, setSelectedUser] = useState('');
  const [scores, setScores] = useState([]);
  const [scoreForm, setScoreForm] = useState({ value: '', date: '' });
  const [toast, setToast] = useState('');

  const load = async () => {
    const [u, s] = await Promise.all([
      drawService.adminUsers(),
      drawService.adminSubscriptions(),
    ]);
    setUsers(u.data.users);
    setSubs(s.data.subscriptions);
  };

  useEffect(() => {
    load().catch((err) => setToast(err.message));
  }, []);

  const paginatedUsers = useMemo(() => {
    const start = (userPage - 1) * pageSize;
    return users.slice(start, start + pageSize);
  }, [users, userPage]);

  const paginatedSubs = useMemo(() => {
    const start = (subPage - 1) * pageSize;
    return subs.slice(start, start + pageSize);
  }, [subs, subPage]);

  const onUpdate = async (id, payload) => {
    try {
      await drawService.adminUpdateUser(id, payload);
      setToast('User updated');
      load();
    } catch (err) {
      setToast(err.response?.data?.message || 'Update failed');
    }
  };

  const updateSub = async (id, status) => {
    try {
      await drawService.adminUpdateSubscription(id, { status });
      setToast('Subscription updated');
      load();
    } catch (err) {
      setToast(err.response?.data?.message || 'Subscription update failed');
    }
  };

  const loadScores = async (userId) => {
    setSelectedUser(userId);
    const { data } = await drawService.adminUserScores(userId);
    setScores(data.scores);
  };

  const saveScoreEdit = async (scoreId, value, date) => {
    try {
      await drawService.adminUpdateScore(selectedUser, scoreId, {
        value: Number(value),
        date,
      });
      setToast('Score updated');
      loadScores(selectedUser);
    } catch (err) {
      setToast(err.response?.data?.message || 'Score update failed');
    }
  };

  const addScore = async (e) => {
    e.preventDefault();
    try {
      await drawService.adminCreateScore(selectedUser, {
        value: Number(scoreForm.value),
        date: scoreForm.date,
      });
      setScoreForm({ value: '', date: '' });
      setToast('Score added');
      loadScores(selectedUser);
    } catch (err) {
      setToast(err.response?.data?.message || 'Could not add score');
    }
  };

  const removeScore = async (scoreId) => {
    try {
      await drawService.adminDeleteScore(selectedUser, scoreId);
      setToast('Score deleted');
      loadScores(selectedUser);
    } catch (err) {
      setToast(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="page">
      <Navbar />
      <Toast message={toast} onClose={() => setToast('')} />
      <main className="section">
        <Link to="/admin" className="muted">
          ← Admin
        </Link>
        <h1>Users & subscriptions</h1>
        <UserTable users={paginatedUsers} onUpdate={onUpdate} onSelectScores={loadScores} />
        <Pagination
          currentPage={userPage}
          totalItems={users.length}
          pageSize={pageSize}
          onPageChange={setUserPage}
        />

        <h2 style={{ marginTop: '2.5rem' }}>Subscriptions</h2>
        <ul className="admin-list">
          {paginatedSubs.map((s) => (
            <li key={s._id}>
              <div>
                <strong>{s.userId?.name || 'User'}</strong> · {s.plan} · {s.status} · £
                {s.amount}
                {s.renewalDate
                  ? ` · renews ${new Date(s.renewalDate).toLocaleDateString()}`
                  : ''}
              </div>
              <select
                value={s.status}
                onChange={(e) => updateSub(s._id, e.target.value)}
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
                <option value="cancelled">cancelled</option>
                <option value="lapsed">lapsed</option>
              </select>
            </li>
          ))}
        </ul>
        <Pagination
          currentPage={subPage}
          totalItems={subs.length}
          pageSize={pageSize}
          onPageChange={setSubPage}
        />

        {selectedUser && (
          <>
            <h2 style={{ marginTop: '2.5rem' }}>Edit scores</h2>
            <p className="muted">
              User: {users.find((u) => u._id === selectedUser)?.email}
            </p>
            <form className="score-form" onSubmit={addScore}>
              <input
                type="number"
                min={1}
                max={45}
                placeholder="Value"
                value={scoreForm.value}
                onChange={(e) => setScoreForm({ ...scoreForm, value: e.target.value })}
                required
              />
              <input
                type="date"
                value={scoreForm.date}
                onChange={(e) => setScoreForm({ ...scoreForm, date: e.target.value })}
                required
              />
              <button className="btn" type="submit">
                Add score
              </button>
            </form>
            <ul className="admin-list">
              {scores.map((sc) => (
                <li key={sc._id}>
                  <ScoreRow score={sc} onSave={saveScoreEdit} onDelete={removeScore} />
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}

function ScoreRow({ score, onSave, onDelete }) {
  const [value, setValue] = useState(score.value);
  const [date, setDate] = useState(new Date(score.date).toISOString().slice(0, 10));
  return (
    <div className="score-edit-row">
      <input type="number" min={1} max={45} value={value} onChange={(e) => setValue(e.target.value)} />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <button type="button" className="linkish" onClick={() => onSave(score._id, value, date)}>
        Save
      </button>
      <button type="button" className="linkish" onClick={() => onDelete(score._id)}>
        Delete
      </button>
    </div>
  );
}
