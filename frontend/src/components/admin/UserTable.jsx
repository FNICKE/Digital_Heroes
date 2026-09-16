export default function UserTable({ users, onUpdate, onSelectScores }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Charity %</th>
            <th>Cause</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                <select
                  value={u.role}
                  onChange={(e) => onUpdate(u._id, { role: e.target.value })}
                >
                  <option value="subscriber">subscriber</option>
                  <option value="admin">admin</option>
                </select>
              </td>
              <td>{u.charityPercentage}%</td>
              <td>{u.charityId?.name || '—'}</td>
              <td>
                <button
                  type="button"
                  className="linkish"
                  onClick={() => onSelectScores?.(u._id)}
                >
                  Scores
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
