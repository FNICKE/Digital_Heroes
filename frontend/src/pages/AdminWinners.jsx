import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import WinnerReview from '../components/admin/WinnerReview';
import Toast from '../components/common/Toast';
import * as drawService from '../services/drawService';

export default function AdminWinners() {
  const [winners, setWinners] = useState([]);
  const [toast, setToast] = useState('');

  const load = () =>
    drawService.listAllWinners().then((res) => setWinners(res.data.winners));

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="page">
      <Navbar />
      <Toast message={toast} onClose={() => setToast('')} />
      <main className="section">
        <Link to="/admin" className="muted">
          ← Admin
        </Link>
        <h1>Winner verification</h1>
        <WinnerReview winners={winners} onRefresh={load} onError={setToast} />
      </main>
    </div>
  );
}
