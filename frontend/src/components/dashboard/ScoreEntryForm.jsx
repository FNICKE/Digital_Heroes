import { useState } from 'react';
import * as scoreService from '../../services/scoreService';

export default function ScoreEntryForm({ onSaved, onError }) {
  const [value, setValue] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await scoreService.createScore({ value: Number(value), date });
      setValue('');
      onSaved?.();
    } catch (err) {
      onError?.(err.response?.data?.message || 'Could not save score');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="score-form" onSubmit={submit}>
      <label>
        Stableford score (1–45)
        <input
          type="number"
          min={1}
          max={45}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
        />
      </label>
      <label>
        Date
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </label>
      <button className="btn" type="submit" disabled={busy}>
        {busy ? 'Saving…' : 'Log score'}
      </button>
    </form>
  );
}
