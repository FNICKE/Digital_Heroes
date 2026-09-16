import { useState, useMemo } from 'react';
import * as drawService from '../../services/drawService';
import Pagination from '../common/Pagination';

export default function WinningsPanel({ winners, onChanged, onError }) {
  const [busyId, setBusyId] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const paginatedWinners = useMemo(() => {
    const start = (page - 1) * pageSize;
    return (winners || []).slice(start, start + pageSize);
  }, [winners, page, pageSize]);

  const totalWon = (winners || [])
    .filter((w) => w.status === 'paid')
    .reduce((sum, w) => sum + Number(w.prizeAmount || 0), 0);

  const pendingTotal = (winners || [])
    .filter((w) => w.status === 'pending')
    .reduce((sum, w) => sum + Number(w.prizeAmount || 0), 0);

  const upload = async (id, file) => {
    if (!file) return;
    setBusyId(id);
    try {
      const fd = new FormData();
      fd.append('proof', file);
      await drawService.uploadProof(id, fd);
      onChanged?.();
    } catch (err) {
      onError?.(err.response?.data?.message || 'Upload failed');
    } finally {
      setBusyId(null);
    }
  };

  if (!winners?.length) {
    return (
      <p className="muted">No prizes yet — keep logging scores for the monthly draw.</p>
    );
  }

  return (
    <div>
      <div className="winnings-summary">
        <div>
          <span className="muted">Total paid</span>
          <strong>£{totalWon.toFixed(2)}</strong>
        </div>
        <div>
          <span className="muted">Pending</span>
          <strong>£{pendingTotal.toFixed(2)}</strong>
        </div>
      </div>
      <ul className="winnings-list">
        {paginatedWinners.map((w) => (
          <li key={w._id}>
            <div>
              <strong>Tier {w.tier}</strong> · £{Number(w.prizeAmount).toFixed(2)} ·{' '}
              <span className={`status-pill status-${w.status}`}>{w.status}</span>
            </div>
            {!w.proofImageUrl && w.status === 'pending' && (
              <label className="file-label">
                {busyId === w._id ? 'Uploading…' : 'Upload proof'}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => upload(w._id, e.target.files?.[0])}
                />
              </label>
            )}
            {w.proofImageUrl && <span className="muted">Proof submitted</span>}
          </li>
        ))}
      </ul>
      <Pagination
        currentPage={page}
        totalItems={(winners || []).length}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </div>
  );
}

