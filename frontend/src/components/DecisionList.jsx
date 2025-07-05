// src/components/DecisionList.jsx
import { Link } from 'react-router-dom';

export default function DecisionList({ decisions }) {
  if (!decisions.length) {
    return <div className="italic text-gray-500">Aucune décision trouvée.</div>;
  }

  console.log('💡 Toutes les décisions reçues ➜', decisions);

  return (
    <ul className="space-y-4">
      {decisions.map((d) => {
        console.log('📝 Une décision ➜', d);
        return (
          <li key={d.id || d.external_id} className="border rounded p-4 bg-white">
            <strong>{d.title || d.reference || 'Untitled'}</strong>
            <br />
            <span className="text-sm text-gray-500">
              Date : {d.date || '—'}
            </span>
            <br />
            <Link
              to={`/decisions/${d.id || d.external_id}`}
              className="inline-block mt-2 text-blue-600 underline hover:text-blue-800"
            >
              Voir détails →
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
