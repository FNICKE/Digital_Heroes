import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import CharityManager from '../components/admin/CharityManager';
import Toast from '../components/common/Toast';
import * as drawService from '../services/drawService';

export default function AdminCharities() {
  const [charities, setCharities] = useState([]);
  const [toast, setToast] = useState('');

  const load = () =>
    drawService.adminCharities().then((res) => setCharities(res.data.charities));

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
        <h1>Charities</h1>
        <CharityManager
          charities={charities}
          onRefresh={load}
          onError={setToast}
        />
      </main>
    </div>
  );
}
