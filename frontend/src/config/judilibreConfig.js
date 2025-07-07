// ✅ src/config/judilibreConfig.js

let configData = null;

/**
 * Fetch Judilibre config JSON from official source.
 * This runs only once thanks to the guard.
 */
export async function fetchJudilibreConfig() {
  if (configData) return; // ✅ already loaded
  const res = await fetch(
    'https://raw.githubusercontent.com/Cour-de-cassation/judilibre-search/dev/public/JUDILIBRE-public.json'
  );
  if (!res.ok) throw new Error('❌ Impossible de charger Judilibre-public.json');
  configData = await res.json();
  console.log('✅ Judilibre config chargée :', configData);
}

/**
 * Get list of jurisdiction codes.
 */
export const getJurisdictions = () => {
  const list = configData?.jurisdictions || [];
  return list.map(j => j.value);
};

/**
 * Get list of case type codes.
 */
export const getCaseTypes = () => {
  const list = configData?.case_types || [];
  return list.map(c => c.value);
};

/**
 * Return readable jurisdiction label.
 */
export const readableJurisdiction = (value) => {
  if (!value) return '—';
  const list = configData?.jurisdictions || [];
  const match = list.find(j => j.value.toLowerCase() === value.trim().toLowerCase());
  return match ? match.label : value;
};

/**
 * Return readable case type label.
 */
export const readableCaseType = (value) => {
  if (!value) return '—';
  const list = configData?.case_types || [];
  const match = list.find(c => c.value.toLowerCase() === value.trim().toLowerCase());
  return match ? match.label : value;
};

/**
 * Format decision title for display.
 */
export const formatDecisionTitle = (decision) => {
  return decision.title || 'Sans titre';
};
