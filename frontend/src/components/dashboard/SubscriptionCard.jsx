import { useState } from 'react';
import * as subService from '../../services/subscriptionService';

export default function SubscriptionCard({ status, onChanged, onError }) {
  const [busy, setBusy] = useState(false);
  const active = status?.isActive;

  const subscribe = async (plan) => {
    setBusy(true);
    try {
      const { data } = await subService.createSubscription(plan);
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      onChanged?.();
    } catch (err) {
      onError?.(err.response?.data?.message || 'Subscription failed');
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    setBusy(true);
    try {
      await subService.cancelSubscription();
      onChanged?.();
    } catch (err) {
      onError?.(err.response?.data?.message || 'Cancel failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="panel subscription-panel">
      <h3>Membership</h3>
      {active ? (
        <>
          <p>
            <strong>{status.subscription.plan}</strong> ·{' '}
            {status.subscription.status}
          </p>
          <p className="muted">
            Renews{' '}
            {status.subscription.renewalDate
              ? new Date(status.subscription.renewalDate).toLocaleDateString()
              : '—'}
          </p>
          <button type="button" className="btn btn-ghost" disabled={busy} onClick={cancel}>
            Cancel membership
          </button>
        </>
      ) : (
        <>
          <p>Unlock scores, monthly draws, and charity routing.</p>
          <div className="cta-row">
            <button type="button" className="btn" disabled={busy} onClick={() => subscribe('monthly')}>
              £9.99 / month
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={busy}
              onClick={() => subscribe('yearly')}
            >
              £99.90 / year · 2 months free
            </button>
          </div>
        </>
      )}
    </div>
  );
}
