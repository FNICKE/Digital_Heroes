export default function ParticipationPanel({ draws, myWins }) {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const published = (draws || []).filter((d) => d.status === 'published');
  const entered = published.filter((d) =>
    (myWins || []).some((w) => String(w.drawId?._id || w.drawId) === String(d._id))
  );

  const upcomingLabel = `${now.toLocaleString('default', { month: 'long' })} ${currentYear}`;
  const thisMonthPublished = published.find(
    (d) => d.month === currentMonth && d.year === currentYear
  );

  return (
    <div className="panel">
      <h3>Participation</h3>
      <ul className="participation-stats">
        <li>
          <span>Draws published (visible)</span>
          <strong>{published.length}</strong>
        </li>
        <li>
          <span>Draws you won a tier in</span>
          <strong>{entered.length}</strong>
        </li>
        <li>
          <span>This month</span>
          <strong>
            {thisMonthPublished
              ? 'Results published'
              : `Upcoming · ${upcomingLabel}`}
          </strong>
        </li>
      </ul>
      <p className="muted">
        Active members with logged scores are entered automatically when the monthly draw runs.
      </p>
    </div>
  );
}
