// backend/services/judilibreService.js
const axios = require('axios');
const { getJudilibreAccessToken } = require('./judilibreAuth');

// Normalize base URL (no trailing slash)
const BASE = (process.env.JUDILIBRE_API_URL || '').replace(/\/+$/, '');

/**
 * Read PISTE KeyId dynamically to avoid stale values if env changes.
 * Supported env var names (in order):
 *   - PISTE_KEY_ID
 *   - JUDILIBRE_KEY_ID
 *   - PISTE_KEYID
 *   - KEY_ID
 */
function getKeyId() {
  return (
    process.env.PISTE_KEY_ID ||
    process.env.JUDILIBRE_KEY_ID ||
    process.env.PISTE_KEYID ||
    process.env.KEY_ID ||
    ''
  );
}

function ensureKeyId() {
  const keyId = getKeyId();
  if (!keyId) {
    throw new Error(
      [
        'Missing PISTE KeyId for Judilibre.',
        'Please set one of the following env vars:',
        '  - PISTE_KEY_ID (recommended)',
        '  - JUDILIBRE_KEY_ID',
        '  - PISTE_KEYID',
        '  - KEY_ID',
      ].join('\n')
    );
  }
  return keyId;
}

/**
 * Best-effort environment consistency checks:
 * - API and OAuth URLs must point to the same environment (sandbox or prod)
 * - KeyId must be present
 */
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

  if (apiEnv !== oauthEnv) {
    console.warn(
      `[Judilibre][env] ⚠️ API URL is "${apiEnv}" but OAuth URL is "${oauthEnv}". ` +
      'Align both to the same environment (sandbox or prod).'
    );
  }

  const keyId = getKeyId();
  if (!keyId) {
    console.error(
      '[Judilibre][env] ❌ Missing PISTE KeyId (set PISTE_KEY_ID or JUDILIBRE_KEY_ID / PISTE_KEYID / KEY_ID).'
    );
  }
  return { apiEnv, oauthEnv, keyId };
}

// Try reconstructing a linearized full text from zones if possible
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
      const s = frag?.start, e = frag?.end;
      if (
        Number.isInteger(s) &&
        Number.isInteger(e) &&
        e > s &&
        s >= 0 &&
        e <= baseText.length
      ) {
        items.push({ start: s, end: e });
      }
    }
  }
  if (!items.length) return '';

  items.sort((a, b) => a.start - b.start);
  return items.map((it) => baseText.substring(it.start, it.end)).join('\n\n').trim();
}

async function fetchDecisionsFromJudilibre({
  dateDecisionMin,
  dateDecisionMax,
  jurisdiction,
  caseType,
  query = '',
  page = 1,
}) {
  // Env guardrails
  checkEnvConsistency();

  const keyId = ensureKeyId();
  const accessToken = await getJudilibreAccessToken();

  let queryString = query || '*';
  if (dateDecisionMin && dateDecisionMax) {
    queryString += ` AND decision_date:[${dateDecisionMin} TO ${dateDecisionMax}]`;
  }

  const params = { query: queryString.trim(), page, page_size: 50 };
  if (jurisdiction) params.jurisdiction = jurisdiction;
  if (caseType) params.type = caseType;

  try {
    const { data } = await axios.get(`${BASE}/search`, {
      params,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
        KeyId: keyId, // ✅ REQUIRED by PISTE gateway
      },
      timeout: 15000,
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
    };
  } catch (err) {
    const status = err.response?.status;
    const corr = err.response?.headers?.['x-correlationid'];
    console.error('[Judilibre][search] error status:', status, 'corr:', corr || 'n/a');
    throw err;
  }
}

async function fetchDecisionById(id) {
  if (!id) throw new Error('fetchDecisionById: missing id');

  // Env guardrails
  checkEnvConsistency();

  const keyId = ensureKeyId();
  const accessToken = await getJudilibreAccessToken();

  try {
    const { data } = await axios.get(`${BASE}/decisions/${encodeURIComponent(id)}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
        KeyId: keyId, // ✅ REQUIRED by PISTE gateway
      },
      timeout: 20000,
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
    };
  } catch (err) {
    const status = err.response?.status;
    const corr = err.response?.headers?.['x-correlationid'];
    console.error(
      `[Judilibre][decisions/${id}] error status:`,
      status,
      'corr:',
      corr || 'n/a'
    );
    if (status === 403) {
      console.error(
        '→ 403 Forbidden: ensure PISTE_KEY_ID matches your subscribed environment/product (Judilibre).'
      );
    }
    throw err;
  }
}

module.exports = {
  fetchDecisionsFromJudilibre,
  fetchDecisionById,
};
