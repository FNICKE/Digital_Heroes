import { useState, useMemo } from 'react';
import * as drawService from '../../services/drawService';
import Pagination from '../common/Pagination';

export default function WinnerReview({ winners, onRefresh, onError }) {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const paginatedWinners = useMemo(() => {
    const start = (page - 1) * pageSize;
    return (winners || []).slice(start, start + pageSize);
  }, [winners, page, pageSize]);

  const act = async (id, action) => {
    try {
      if (action === 'pay') await drawService.payWinner(id);
      else await drawService.reviewWinner(id, action);
      onRefresh?.();
    } catch (err) {
      onError?.(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div>
      <ul className="admin-list">
        {paginatedWinners.map((w) => (
          <li key={w._id}>
            <div>
              <strong>{w.userId?.name || 'User'}</strong> · tier {w.tier} · £
              {Number(w.prizeAmount).toFixed(2)} · {w.status}
              {w.proofImageUrl ? ' · proof ✓' : ' · no proof'}
            </div>
            <div className="cta-row">
              <button type="button" className="linkish" onClick={() => act(w._id, 'approved')}>
                Approve
              </button>
              <button type="button" className="linkish" onClick={() => act(w._id, 'rejected')}>
                Reject
              </button>
              <button type="button" className="linkish" onClick={() => act(w._id, 'pay')}>
                Mark paid
              </button>
            </div>
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

