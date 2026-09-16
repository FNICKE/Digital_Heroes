import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import DrawConsole from '../components/admin/DrawConsole';
import Toast from '../components/common/Toast';
import Pagination from '../components/common/Pagination';
import * as drawService from '../services/drawService';

export default function AdminDraws() {
  const [toast, setToast] = useState('');
  const [draws, setDraws] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const load = () => {
    drawService
      .listDraws()
      .then((res) => setDraws(res.data.draws || []))
      .catch((err) => setToast(err.response?.data?.message || 'Failed to load draws'));
  };

  useEffect(() => {
    load();
  }, []);

  const paginatedDraws = useMemo(() => {
    const start = (page - 1) * pageSize;
    return draws.slice(start, start + pageSize);
  }, [draws, page, pageSize]);

  return (
    <div className="page">
      <Navbar />
      <Toast message={toast} onClose={() => setToast('')} type="info" />
      <main className="section">
        <Link to="/admin" className="muted">
          ← Admin
        </Link>
        <h1>Monthly draws</h1>
        <DrawConsole
          onDone={(msg) => {
            setToast(msg || 'Simulation ready');
            load();
          }}
          onError={setToast}
        />

        <h2 style={{ marginTop: '2.5rem' }}>Draw History</h2>
        {draws.length === 0 ? (
          <p className="muted">No draws recorded yet.</p>
        ) : (
          <>
            <div className="table-wrap" style={{ marginTop: '1rem' }}>
              <table>
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Winning Values</th>
                    <th>Prize Pool</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDraws.map((d) => (
                    <tr key={d._id}>
                      <td>
                        <strong>
                          {new Date(d.year, d.month - 1).toLocaleString('default', {
                            month: 'short',
                          })}{' '}
                          {d.year}
                        </strong>
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>{d.type}</td>
                      <td>
                        <span className={`status-pill status-${d.status === 'published' ? 'paid' : d.status === 'simulated' ? 'pending' : 'rejected'}`}>
                          {d.status}
                        </span>
                      </td>
                      <td>
                        {d.winningValues?.length
                          ? d.winningValues.join(', ')
                          : '—'}
                      </td>
                      <td>£{Number(d.totalPool || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={page}
              totalItems={draws.length}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </>
        )}
      </main>
    </div>
  );
}

