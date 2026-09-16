import { useState, useMemo } from 'react';
import * as drawService from '../../services/drawService';
import Pagination from '../common/Pagination';

export default function CharityManager({ charities, onRefresh, onError }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    imageUrl: '',
    isFeatured: false,
  });
  const [editing, setEditing] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const paginatedCharities = useMemo(() => {
    const start = (page - 1) * pageSize;
    return (charities || []).slice(start, start + pageSize);
  }, [charities, page, pageSize]);

  const create = async (e) => {
    e.preventDefault();
    try {
      await drawService.adminCreateCharity({
        name: form.name,
        description: form.description,
        images: form.imageUrl ? [form.imageUrl] : [],
        events: [],
        isFeatured: form.isFeatured,
      });
      setForm({ name: '', description: '', imageUrl: '', isFeatured: false });
      onRefresh?.();
    } catch (err) {
      onError?.(err.response?.data?.message || 'Create failed');
    }
  };

  const startEdit = (c) => {
    setEditing({
      _id: c._id,
      name: c.name,
      description: c.description,
      imageUrl: c.images?.[0] || '',
      eventTitle: c.events?.[0]?.title || '',
      eventDate: c.events?.[0]?.date
        ? new Date(c.events[0].date).toISOString().slice(0, 10)
        : '',
      eventLocation: c.events?.[0]?.location || '',
      eventDetails: c.events?.[0]?.details || '',
      isFeatured: c.isFeatured,
    });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      const events = editing.eventTitle
        ? [
            {
              title: editing.eventTitle,
              date: editing.eventDate || undefined,
              location: editing.eventLocation,
              details: editing.eventDetails,
            },
          ]
        : [];
      await drawService.adminUpdateCharity(editing._id, {
        name: editing.name,
        description: editing.description,
        images: editing.imageUrl ? [editing.imageUrl] : [],
        events,
        isFeatured: editing.isFeatured,
      });
      setEditing(null);
      onRefresh?.();
    } catch (err) {
      onError?.(err.response?.data?.message || 'Update failed');
    }
  };

  const remove = async (id) => {
    try {
      await drawService.adminDeleteCharity(id);
      onRefresh?.();
    } catch (err) {
      onError?.(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <form className="admin-form" onSubmit={create}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />
        <input
          placeholder="Image URL"
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
        />
        <label className="check">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
          />
          Featured
        </label>
        <button className="btn" type="submit">
          Add charity
        </button>
      </form>

      {editing && (
        <form className="admin-form panel" onSubmit={saveEdit} style={{ marginTop: '1.5rem' }}>
          <h3>Edit content & media</h3>
          <input
            value={editing.name}
            onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            required
          />
          <textarea
            value={editing.description}
            onChange={(e) => setEditing({ ...editing, description: e.target.value })}
            required
          />
          <input
            placeholder="Image URL"
            value={editing.imageUrl}
            onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })}
          />
          <input
            placeholder="Event title"
            value={editing.eventTitle}
            onChange={(e) => setEditing({ ...editing, eventTitle: e.target.value })}
          />
          <input
            type="date"
            value={editing.eventDate}
            onChange={(e) => setEditing({ ...editing, eventDate: e.target.value })}
          />
          <input
            placeholder="Event location"
            value={editing.eventLocation}
            onChange={(e) => setEditing({ ...editing, eventLocation: e.target.value })}
          />
          <textarea
            placeholder="Event details"
            value={editing.eventDetails}
            onChange={(e) => setEditing({ ...editing, eventDetails: e.target.value })}
          />
          <label className="check">
            <input
              type="checkbox"
              checked={editing.isFeatured}
              onChange={(e) => setEditing({ ...editing, isFeatured: e.target.checked })}
            />
            Featured
          </label>
          <div className="cta-row">
            <button className="btn" type="submit">
              Save charity
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <ul className="admin-list">
        {paginatedCharities.map((c) => (
          <li key={c._id}>
            <div>
              <strong>{c.name}</strong>
              {c.isFeatured ? ' · featured' : ''}
              {c.images?.[0] ? ' · has image' : ''}
              {c.events?.length ? ` · ${c.events.length} event(s)` : ''}
            </div>
            <div className="cta-row">
              <button type="button" className="linkish" onClick={() => startEdit(c)}>
                Edit content
              </button>
              <button type="button" className="linkish" onClick={() => remove(c._id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      <Pagination
        currentPage={page}
        totalItems={(charities || []).length}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </div>
  );
}
