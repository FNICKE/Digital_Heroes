import { useCallback, useEffect, useState } from 'react';
import Navbar from '../components/common/Navbar';
import Toast from '../components/common/Toast';
import ScoreEntryForm from '../components/dashboard/ScoreEntryForm';
import ScoreHistory from '../components/dashboard/ScoreHistory';
import SubscriptionCard from '../components/dashboard/SubscriptionCard';
import WinningsPanel from '../components/dashboard/WinningsPanel';
import CharityPanel from '../components/dashboard/CharityPanel';
import ParticipationPanel from '../components/dashboard/ParticipationPanel';
import { useAuth } from '../context/AuthContext';
import * as scoreService from '../services/scoreService';
import * as subService from '../services/subscriptionService';
import * as drawService from '../services/drawService';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [scores, setScores] = useState([]);
  const [status, setStatus] = useState(null);
  const [winners, setWinners] = useState([]);
  const [draws, setDraws] = useState([]);
  const [toast, setToast] = useState('');
  const [subError, setSubError] = useState('');

  const load = useCallback(async () => {
    try {
      const st = await subService.getSubscriptionStatus();
      setStatus(st.data);
      setSubError('');
      if (st.data.isActive || isAdmin) {
        const [sc, wins, dr] = await Promise.all([
          scoreService.listScores().catch(() => ({ data: { scores: [] } })),
          drawService.listMyWins().catch(() => ({ data: { winners: [] } })),
          drawService.listDraws().catch(() => ({ data: { draws: [], myWins: [] } })),
        ]);
        setScores(sc.data.scores || []);
        setWinners(wins.data.winners || []);
        setDraws(dr.data.draws || []);
      } else {
        setScores([]);
        setWinners([]);
        setDraws([]);
      }
    } catch (err) {
      setSubError(err.response?.data?.message || 'Could not load dashboard');
    }
  }, [isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="page dashboard-page">
      <Navbar />
      <Toast message={toast} onClose={() => setToast('')} />
      <main className="dashboard-shell">
        <header className="dash-header">
          <p className="eyebrow">Member home</p>
          <h1>Welcome, {user?.name?.split(' ')[0]}</h1>
        </header>
        {subError && <p className="error">{subError}</p>}
        <div className="dash-grid">
          <SubscriptionCard
            status={status}
            onChanged={() => {
              setToast('Membership updated');
              load();
            }}
            onError={setToast}
          />
          <CharityPanel onError={setToast} />
          {(status?.isActive || isAdmin) && (
            <>
              <ParticipationPanel draws={draws} myWins={winners} />
              <section className="panel">
                <h3>Your last 5 scores</h3>
                <ScoreEntryForm
                  onSaved={() => {
                    setToast('Score saved');
                    load();
                  }}
                  onError={setToast}
                />
                <ScoreHistory
                  scores={scores}
                  onChanged={load}
                  onError={setToast}
                />
              </section>
              <section className="panel">
                <h3>Winnings overview</h3>
                <WinningsPanel
                  winners={winners}
                  onChanged={load}
                  onError={setToast}
                />
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
