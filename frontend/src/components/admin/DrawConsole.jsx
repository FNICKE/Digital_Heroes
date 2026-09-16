import { useState } from 'react';
import * as drawService from '../../services/drawService';

export default function DrawConsole({ onDone, onError }) {
  const [type, setType] = useState('random');
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);

  const simulate = async () => {
    setBusy(true);
    try {
      const { data } = await drawService.simulateDraw({ type });
      setPreview(data);
      onDone?.();
    } catch (err) {
      onError?.(err.response?.data?.message || 'Simulate failed');
    } finally {
      setBusy(false);
    }
  };

  const publish = async () => {
    setBusy(true);
    try {
      await drawService.publishDraw({ drawId: preview?.draw?._id });
      setPreview(null);
      onDone?.('Draw published');
    } catch (err) {
      onError?.(err.response?.data?.message || 'Publish failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="panel">
      <h3>Draw console</h3>
      <div className="cta-row">
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="random">Random</option>
          <option value="algorithmic">Algorithmic (score frequency)</option>
        </select>
        <button type="button" className="btn" disabled={busy} onClick={simulate}>
          Simulate
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={busy || !preview}
          onClick={publish}
        >
          Publish
        </button>
      </div>
      {preview && (
        <div className="draw-preview">
          <p>
            Winning values:{' '}
            <strong>{preview.preview.winningValues.join(', ')}</strong>
          </p>
          <p>Pool: £{preview.preview.totalPool.toFixed(2)}</p>
          <ul>
            {preview.preview.tiers.map((t) => (
              <li key={t.tier}>
                {t.tier}-match: {t.winners.length} winner(s) · £{t.amount.toFixed(2)}
                {t.rollover > 0 ? ` · rollover £${t.rollover.toFixed(2)}` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
