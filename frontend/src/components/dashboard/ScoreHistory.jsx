import { useState } from 'react';
import * as scoreService from '../../services/scoreService';

export default function ScoreHistory({ scores, onChanged, onError }) {
  const [editingId, setEditingId] = useState(null);
  const [value, setValue] = useState('');
  const [date, setDate] = useState('');
  const [busy, setBusy] = useState(false);

  const startEdit = (s) => {
    setEditingId(s._id);
    setValue(String(s.value));
    setDate(new Date(s.date).toISOString().slice(0, 10));
  };

  const save = async (id) => {
    setBusy(true);
    try {
      await scoreService.updateScore(id, {
        value: Number(value),
        date,
      });
      setEditingId(null);
      onChanged?.();
    } catch (err) {
      onError?.(err.response?.data?.message || 'Update failed');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    try {
      await scoreService.deleteScore(id);
      onChanged?.();
    } catch (err) {
      onError?.(err.response?.data?.message || 'Delete failed');
    }
  };

  if (!scores?.length) {
    return (
      <p className="muted">No scores yet — log your last rounds to enter the draw.</p>
    );
  }

  return (
    <ul className="score-list">
      {scores.map((s) => (
        <li key={s._id}>
          {editingId === s._id ? (
            <div className="score-edit-row">
              <input
                type="number"
                min={1}
                max={45}
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <button type="button" className="linkish" disabled={busy} onClick={() => save(s._id)}>
                Save
              </button>
              <button type="button" className="linkish" onClick={() => setEditingId(null)}>
                Cancel
              </button>
            </div>
          ) : (
            <>
              <span className="score-value">{s.value}</span>
              <span className="score-date">
                {new Date(s.date).toLocaleDateString()}
              </span>
              <div className="cta-row">
                <button type="button" className="linkish" onClick={() => startEdit(s)}>
                  Edit
                </button>
                <button type="button" className="linkish" onClick={() => remove(s._id)}>
                  Remove
                </button>
              </div>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
