export default function ReportsPanel({ report }) {
  if (!report) return null;
  return (
    <div className="reports-grid">
      <div className="stat">
        <span>Subscribers</span>
        <strong>{report.users.subscribers}</strong>
      </div>
      <div className="stat">
        <span>Active subs</span>
        <strong>{report.subscriptions.active}</strong>
      </div>
      <div className="stat">
        <span>Pool estimate</span>
        <strong>£{Number(report.prizePoolEstimate).toFixed(2)}</strong>
      </div>
      <div className="stat">
        <span>Charity total</span>
        <strong>£{Number(report.charity.totalContributions).toFixed(2)}</strong>
      </div>
      <div className="stat">
        <span>Published draws</span>
        <strong>{report.draws.published}</strong>
      </div>
      <div className="stat">
        <span>Pending prizes</span>
        <strong>{report.winners.pending}</strong>
      </div>
    </div>
  );
}
