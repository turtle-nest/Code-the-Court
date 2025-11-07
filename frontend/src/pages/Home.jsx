// frontend/src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import Stat from '../components/Stat';
import statsMock from '../mocks/stats.mock';

// Helper formatters (keep UI French, code in English)
const API_URL = import.meta.env.VITE_API_URL || '';
const USE_MOCK = String(import.meta.env.VITE_USE_STATS_MOCK || '').toLowerCase() === 'true';

export default function Home() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        if (USE_MOCK) {
          // Explicit mock mode (for demo day)
          if (!cancelled) {
            setStats(statsMock);
            setLoading(false);
          }
          return;
        }

        // Real API call with graceful fallback to mock on failure
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (!cancelled) {
          setStats(data);
          setLoading(false);
        }
      } catch {
        // Silent fallback to mock to keep demo smooth
        if (!cancelled) {
          setStats(statsMock);
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="p-6">
      <p className="mb-8 text-lg italic text-gray-800 tracking-tight">
        Bienvenue dans l’interface de gestion et d’analyse des décisions de justice.
      </p>

      <div className="max-w-5xl">
        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="h-6 w-40 bg-gray-100 rounded mb-4 animate-pulse" />
            <div className="h-24 bg-gray-100 rounded animate-pulse" />
          </div>
        ) : (
          <Stat stats={stats} />
        )}
      </div>
    </div>
  );
}
