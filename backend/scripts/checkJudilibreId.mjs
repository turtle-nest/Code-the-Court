// scripts/checkJudilibreId.mjs
// Quick diagnostic for a Judilibre decision id (PROD).
// - checks presence in /search
// - calls /decisions/{id}
// - prints status + x-correlation-id + a short body summary (if 200)
// - scan mode to find the first public decision
// Works on Node 16+ (auto polyfill fetch via node-fetch)

const {
  JUDILIBRE_OAUTH_URL,
  JUDILIBRE_CLIENT_ID,
  JUDILIBRE_CLIENT_SECRET,
  JUDILIBRE_API_URL,
  PISTE_KEY_ID, // your PISTE API Key
} = process.env;

// ---------- helpers ----------
function normalizeBaseUrl(url) {
  if (!url) return "";
  return url.replace(/[/.]+$/, "");
}

function requiredEnv(name, value) {
  if (!value) throw new Error(`${name} is not set`);
}

function getHeaderCI(headers, key) {
  const target = key.toLowerCase();
  for (const [k, v] of headers.entries()) {
    if (k.toLowerCase() === target) return v;
  }
  return "";
}

async function jsonSafe(res) {
  try { return await res.json(); } catch { return null; }
}

// fetch compatible Node 16+
async function httpFetch(...args) {
  if (typeof fetch === "function") return fetch(...args);
  const { default: nf } = await import("node-fetch"); // npm i node-fetch
  return nf(...args);
}

function buildHeaders(token) {
  const h = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
  if (PISTE_KEY_ID) {
    h["X-Api-Key"] = PISTE_KEY_ID;
    h["KeyId"] = PISTE_KEY_ID; // harmless duplicate, some gateways look for it
  }
  return h;
}

async function getToken(verbose = false) {
  requiredEnv("JUDILIBRE_OAUTH_URL", JUDILIBRE_OAUTH_URL);
  requiredEnv("JUDILIBRE_CLIENT_ID", JUDILIBRE_CLIENT_ID);
  requiredEnv("JUDILIBRE_CLIENT_SECRET", JUDILIBRE_CLIENT_SECRET);

  if (verbose) console.log("🔐 Fetching OAuth token…");
  const res = await httpFetch(JUDILIBRE_OAUTH_URL, {
    method: "POST",
    headers: {
      Authorization:
        "Basic " + Buffer.from(`${JUDILIBRE_CLIENT_ID}:${JUDILIBRE_CLIENT_SECRET}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Token fetch failed: ${res.status} ${res.statusText} ${txt}`);
  }
  const json = await res.json();
  if (!json.access_token) throw new Error("No access_token in response");
  if (verbose) console.log("✅ Token acquired.");
  return json.access_token;
}

// ---------- core ----------
export async function checkJudilibreId(id, { verbose = false } = {}) {
  const base = normalizeBaseUrl(JUDILIBRE_API_URL);
  requiredEnv("JUDILIBRE_API_URL", base);
  requiredEnv("PISTE_KEY_ID", PISTE_KEY_ID);

  const token = await getToken(verbose);
  const headers = buildHeaders(token);

  // 1) search presence
  const searchUrl = `${base}/search?query=id:%22${encodeURIComponent(id)}%22&pageSize=1`;
  if (verbose) console.log("🔎 /search:", searchUrl);
  const r1 = await httpFetch(searchUrl, { headers });
  const searchJson = (await jsonSafe(r1)) || {};
  const total = typeof searchJson.total === "number" ? searchJson.total : 0;

  // 2) decisions/{id}
  const decisionUrl = `${base}/decisions/${encodeURIComponent(id)}`;
  if (verbose) console.log("📄 /decisions:", decisionUrl);
  const r2 = await httpFetch(decisionUrl, { headers });
  const status = r2.status;
  const xcorr =
    getHeaderCI(r2.headers, "x-correlation-id") ||
    getHeaderCI(r2.headers, "x-correlationid") ||
    null;

  const body = await jsonSafe(r2);

  const result = {
    search: { total },
    decisions: {
      url: decisionUrl,
      status,
      xCorrelationId: xcorr,
      restricted: status === 403,
      notFound: status === 404,
      ok: status === 200,
      bodySummary: null,
    },
    message: "",
  };

  if (status === 200 && body && typeof body === "object") {
    result.decisions.bodySummary = {
      id: body.id,
      source: body.source,
      decision_date: body.decision_date || body.date || null,
      chamber: body.chamber || body.chamber_name || null,
      formation: body.formation || null,
      solution: body.solution || null,
      text_length: body.text ? String(body.text).length : 0,
    };
    result.message = "Decision content retrieved (200).";
  } else if (status === 403) {
    result.message =
      "Restricted or unauthorized (403). Ensure your PISTE product covers /decisions. Keep x-correlation-id for support.";
  } else if (status === 404) {
    result.message = "Decision not found (404).";
  } else {
    result.message = `Unexpected status ${status}.`;
  }

  if (verbose) {
    console.log("HTTP status:", status, xcorr ? `x-correlation-id: ${xcorr}` : "");
  }

  return result;
}

export async function findFirstPublicDecision(query = "contrat", pageSize = 50, { verbose = true } = {}) {
  const base = normalizeBaseUrl(JUDILIBRE_API_URL);
  requiredEnv("JUDILIBRE_API_URL", base);
  requiredEnv("PISTE_KEY_ID", PISTE_KEY_ID);

  const token = await getToken(verbose);
  const headers = buildHeaders(token);

  const url = `${base}/search?query=${encodeURIComponent(query)}&pageSize=${pageSize}`;
  if (verbose) console.log("🔎 /search list:", url);
  const r = await httpFetch(url, { headers });
  if (!r.ok) throw new Error(`search failed: ${r.status}`);
  const json = (await jsonSafe(r)) || {};
  const ids = Array.isArray(json.results) ? json.results.map((x) => x.id).filter(Boolean) : [];

  for (const id of ids) {
    const res = await checkJudilibreId(id, { verbose: false });
    // Stream progress in scan mode:
    console.log(`${res.decisions.status} ${id}${res.decisions.xCorrelationId ? " x-correlation-id=" + res.decisions.xCorrelationId : ""}`);
    if (res.decisions.ok) return res; // stop at first 200
  }
  return null;
}

// ---------- CLI ----------
// Usage:
//   node scripts/checkJudilibreId.mjs <DECISION_ID> [--verbose]
//   node scripts/checkJudilibreId.mjs --scan "contrat" [pageSize]
if (import.meta.main) {
  (async () => {
    const args = process.argv.slice(2);
    if (!args.length) {
      console.error("Usage:");
      console.error("  node scripts/checkJudilibreId.mjs <DECISION_ID> [--verbose]");
      console.error('  node scripts/checkJudilibreId.mjs --scan "contrat" [pageSize]');
      process.exit(1);
    }

    if (args[0] === "--scan") {
      const q = args[1] || "contrat";
      const n = Number(args[2] || 50);
      const found = await findFirstPublicDecision(q, n, { verbose: true });
      if (found) {
        console.log("First public decision:");
        console.log(JSON.stringify(found, null, 2));
        process.exit(0);
      } else {
        console.log("No public decision found in this batch.");
        process.exit(2);
      }
    } else {
      const id = args[0];
      const verbose = args.includes("--verbose");
      const res = await checkJudilibreId(id, { verbose });
      console.log(JSON.stringify(res, null, 2));
    }
  })().catch((err) => {
    // Make sure errors are visible:
    console.error("Error:", err && err.message ? err.message : err);
    process.exit(2);
  });
}
