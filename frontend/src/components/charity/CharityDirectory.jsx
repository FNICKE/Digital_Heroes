import CharityCard from './CharityCard';

export default function CharityDirectory({ charities }) {
  return (
    <div className="charity-grid">
      {charities.map((c) => (
        <CharityCard key={c._id} charity={c} />
      ))}
    </div>
  );
}
