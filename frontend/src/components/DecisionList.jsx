// src/components/DecisionList.jsx
export default function DecisionList({ decisions }) {
  if (!decisions.length) {
    return <div>No decisions found.</div>;
  }
  return (
    <ul>
      {decisions.map((d) => (
        <li key={d.id}>
          <strong>{d.title || d.reference || 'Untitled'}</strong>
          <br />
          Date: {d.date}
        </li>
      ))}
    </ul>
  );
}
