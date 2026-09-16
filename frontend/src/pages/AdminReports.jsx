import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import ReportsPanel from '../components/admin/ReportsPanel';
import LoadingState from '../components/common/LoadingState';
import * as drawService from '../services/drawService';

export default function AdminReports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    drawService
      .adminReports()
      .then((res) => setReport(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <Navbar />
      <main className="section">
        <Link to="/admin" className="muted">
          ← Admin
        </Link>
        <h1>Reports</h1>
        {loading ? <LoadingState /> : <ReportsPanel report={report} />}
      </main>
    </div>
  );
}
