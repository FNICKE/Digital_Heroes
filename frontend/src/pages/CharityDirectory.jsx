import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/common/Navbar';
import CharityDirectory from '../components/charity/CharityDirectory';
import LoadingState from '../components/common/LoadingState';
import Pagination from '../components/common/Pagination';
import * as charityService from '../services/charityService';

export default function CharityDirectoryPage() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all | featured
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    charityService
      .listCharities()
      .then((res) => setCharities(res.data.charities))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return charities.filter((c) => {
      if (filter === 'featured' && !c.isFeatured) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    });
  }, [charities, query, filter]);

  // Reset to first page when filtering or searching
  const handleQueryChange = (val) => {
    setQuery(val);
    setPage(1);
  };

  const handleFilterChange = (val) => {
    setFilter(val);
    setPage(1);
  };

  const paginatedCharities = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  return (
    <div className="page">
      <Navbar />
      <main className="section">
        <p className="eyebrow">Impact</p>
        <h1>Causes at the centre</h1>
        <p className="lede">
          Every membership routes a chosen share to one of these organisations. Search and filter
          to find yours.
        </p>
        <div className="directory-tools">
          <input
            type="search"
            placeholder="Search causes…"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            aria-label="Search charities"
          />
          <div className="filter-pills" role="group" aria-label="Filter charities">
            <button
              type="button"
              className={filter === 'all' ? 'pill active' : 'pill'}
              onClick={() => handleFilterChange('all')}
            >
              All
            </button>
            <button
              type="button"
              className={filter === 'featured' ? 'pill active' : 'pill'}
              onClick={() => handleFilterChange('featured')}
            >
              Featured
            </button>
          </div>
        </div>
        {loading ? (
          <LoadingState />
        ) : filtered.length ? (
          <>
            <CharityDirectory charities={paginatedCharities} />
            <Pagination
              currentPage={page}
              totalItems={filtered.length}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </>
        ) : (
          <p className="muted">No causes match that search.</p>
        )}
      </main>
    </div>
  );
}
