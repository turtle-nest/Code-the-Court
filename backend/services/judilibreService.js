// backend/services/judilibreService.js
// Service: Judilibre search & decision fetch (via PISTE gateway, OAuth2 Bearer + KeyId)

const axios = require('axios');
const { getJudilibreAccessToken } = require('./judilibreAuth');

const isDev = process.env.NODE_ENV === 'development';

// Normalize base URL (no trailing slash)
const BASE = (process.env.JUDILIBRE_API_URL || '').replace(/\/+$/, '');
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

/* --------------------------------- Env utils -------------------------------- */

function getKeyId() {
  return (
    process.env.PISTE_KEY_ID ||
    process.env.JUDILIBRE_KEY_ID ||
    process.env.PISTE_KEYID ||
    process.env.KEY_ID ||
    ''
  );
}

function ensureBaseUrl() {
  if (!BASE) {
    throw new Error('Judilibre BASE URL is missing (set JUDILIBRE_API_URL)');
  }
}

function ensureKeyId() {
  const keyId = getKeyId();
  if (!keyId) {
    throw new Error(
      [
        'Missing PISTE KeyId for Judilibre.',
        'Set one of:',
        '  - PISTE_KEY_ID (recommended)',
        '  - JUDILIBRE_KEY_ID',
        '  - PISTE_KEYID',
        '  - KEY_ID',
      ].join('\n')
    );
  }
  return keyId;
}

function envFromUrl(u = '') {
  try {
    const h = new URL(u).hostname;
    return h.includes('sandbox-') ? 'sandbox' : 'prod';
  } catch {
    return 'unknown';
  }
}

function checkEnvConsistency() {
  const apiEnv = envFromUrl(process.env.JUDILIBRE_API_URL);
  const oauthEnv = envFromUrl(process.env.JUDILIBRE_OAUTH_URL);

  if (apiEnv !== oauthEnv && isDev) {
    console.warn(
      `[Judilibre][env] API="${apiEnv}" vs OAuth="${oauthEnv}" → align both (sandbox or prod).`
    );
  }

  const keyId = getKeyId();
  if (!keyId && isDev) {
    console.error('[Judilibre][env] Missing PISTE KeyId.');
  }
  return { apiEnv, oauthEnv, keyId };
}

/* ------------------------------ Text utilities ------------------------------ */

// Try reconstructing linearized full text from zones if possible
function buildFullTextFromZones(data) {
  const baseText =
    (typeof data?.text === 'string' && data.text) ||
    (typeof data?.rawText === 'string' && data.rawText) ||
    (typeof data?.fullText === 'string' && data.fullText) ||
    '';

  const zones = data?.zones;
  if (!baseText || !zones || typeof zones !== 'object') return '';

  const items = [];
  for (const zoneName of Object.keys(zones)) {
    const frags = zones[zoneName] || [];
    for (const frag of frags) {
      const s = frag?.start,
        e = frag?.end;
      if (Number.isInteger(s) && Number.isInteger(e) && e > s && s >= 0 && e <= baseText.length) {
        items.push({ start: s, end: e });
      }
    }
  }
  if (!items.length) return '';

  items.sort((a, b) => a.start - b.start);
  return items.map((it) => baseText.substring(it.start, it.end)).join('\n\n').trim();
}

/* --------------------------------- Queries ---------------------------------- */

function buildSearchQuery({ query, dateDecisionMin, dateDecisionMax }) {
  let q = (query || '').trim();
  if (!q) q = '*';
  if (dateDecisionMin && dateDecisionMax) {
    q += ` AND decision_date:[${dateDecisionMin} TO ${dateDecisionMax}]`;
  }
  return q.trim();
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

/* --------------------------------- Public API -------------------------------- */

async function fetchDecisionsFromJudilibre({
  dateDecisionMin,
  dateDecisionMax,
  jurisdiction,
  caseType,
  query = '',
  page = 1,
  page_size = DEFAULT_PAGE_SIZE,
}) {
  // Env guardrails
  checkEnvConsistency();
  ensureBaseUrl();
  const keyId = ensureKeyId();
  const accessToken = await getJudilibreAccessToken();

  const safePage = clamp(parseInt(page, 10) || 1, 1, 10_000);
  const safeSize = clamp(parseInt(page_size, 10) || DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);

  const params = {
    query: buildSearchQuery({ query, dateDecisionMin, dateDecisionMax }),
    page: safePage,
    page_size: safeSize,
  };
  if (jurisdiction) params.jurisdiction = jurisdiction;
  if (caseType) params.type = caseType;

  try {
    const { data, headers } = await axios.get(`${BASE}/search`, {
      params,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
        KeyId: keyId, // REQUIRED by PISTE
      },
      timeout: 15_000,
    });

    const results = Array.isArray(data?.results)
      ? data.results.map((item) => ({
          id: item.id || null,
          ecli: item.ecli || null,
          number: item.number || '',
          decision_date: item.decision_date || null,
          jurisdiction: item.jurisdiction || '',
          type: item.type || '',
          solution: item.solution || '',
          formation: item.formation || '',
          summary: item.summary || '',
          text:
            (item.text && String(item.text).trim()) ||
            (item.summary && String(item.summary).trim()) ||
            '',
        }))
      : [];

    return {
      results,
      total: data?.total ?? results.length,
      timestamp: new Date().toISOString(),
      correlation_id: headers?.['x-correlationid'] || null,
    };
  } catch (err) {
    const status = err.response?.status;
    const corr = err.response?.headers?.['x-correlationid'] || 'n/a';
    if (isDev) console.error('[Judilibre][search] error status:', status, 'corr:', corr);
    throw err;
  }
}

async function fetchDecisionById(id) {
  if (!id) throw new Error('fetchDecisionById: missing id');

  // Env guardrails
  checkEnvConsistency();
  ensureBaseUrl();
  const keyId = ensureKeyId();
  const accessToken = await getJudilibreAccessToken();

  try {
    const { data, headers } = await axios.get(`${BASE}/decisions/${encodeURIComponent(id)}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
        KeyId: keyId, // REQUIRED by PISTE
      },
      timeout: 20_000,
    });

    // Primary full text
    let fullText =
      (typeof data?.text === 'string' && data.text.trim()) ||
      (typeof data?.summary === 'string' && data.summary.trim()) ||
      '';

    // Try rebuild from zones if looks too short
    if (fullText.length < 1500) {
      const rebuilt = buildFullTextFromZones(data);
      if (rebuilt && rebuilt.length > fullText.length) {
        fullText = rebuilt;
      }
    }

    return {
      id: data?.id ?? id,
      ecli: data?.ecli ?? null,
      decision_date: data?.decision_date ?? data?.date ?? null,
      jurisdiction: data?.jurisdiction ?? '',
      type: data?.type ?? '',
      solution: data?.solution ?? '',
      formation: data?.formation ?? '',
      summary: data?.summary ?? '',
      text: fullText,
      zones: data?.zones || null,
      correlation_id: headers?.['x-correlationid'] || null,
    };
  } catch (err) {
    const status = err.response?.status;
    const corr = err.response?.headers?.['x-correlationid'] || 'n/a';
    if (isDev) {
      console.error(`[Judilibre][decisions/${id}] error status:`, status, 'corr:', corr);
      if (status === 403) {
        console.error(
          '→ 403 Forbidden: ensure PISTE_KEY_ID matches your subscribed environment/product (Judilibre).'
        );
      }
    }
    throw err;
  }
}

module.exports = {
  fetchDecisionsFromJudilibre,
  fetchDecisionById,
};
