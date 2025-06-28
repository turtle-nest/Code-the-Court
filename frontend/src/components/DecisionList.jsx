// src/components/DecisionList.jsx
export default function DecisionList({ decisions }) {
  if (!decisions.length) {
    return <div className="italic text-gray-500">Aucune décision trouvée.</div>;
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
