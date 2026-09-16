import { Link } from 'react-router-dom';

export default function CharityCard({ charity }) {
  const img = charity.images?.[0];
  return (
    <article className="charity-card">
      {img && (
        <div
          className="charity-card-media"
          style={{ backgroundImage: `url(${img})` }}
          role="img"
          aria-label={charity.name}
        />
      )}
      <div className="charity-card-body">
        {charity.isFeatured && <span className="eyebrow">Featured</span>}
        <h3>{charity.name}</h3>
        <p>{charity.description.slice(0, 140)}…</p>
        <Link to={`/charities/${charity._id}`} className="btn btn-ghost">
          Meet the cause
        </Link>
      </div>
    </article>
  );
}
