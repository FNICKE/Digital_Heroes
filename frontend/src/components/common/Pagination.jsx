export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
}) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const pages = [];
  for (let i = 1; i <= totalPages; i += 1) {
    pages.push(i);
  }

  return (
    <nav className="pagination-bar" aria-label="Pagination">
      <span className="pagination-info">
        Showing {startItem}–{endItem} of {totalItems}
      </span>
      <div className="pagination-controls">
        <button
          type="button"
          className="btn btn-sm btn-ghost pagination-btn"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          ← Prev
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={`btn btn-sm pagination-btn ${p === currentPage ? 'pagination-btn-active' : 'btn-ghost'}`}
            onClick={() => onPageChange(p)}
            aria-current={p === currentPage ? 'page' : undefined}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          className="btn btn-sm btn-ghost pagination-btn"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          Next →
        </button>
      </div>
    </nav>
  );
}
