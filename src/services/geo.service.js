// Enriches an IP address with country/city, trying provider A then provider B.
// If both fail, returns nulls - the submission must still succeed without geo data.

const TIMEOUT_MS = 3000;

async function fetchWithTimeout(url, ms) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`Provider responded with ${res.status}`);
    return res.json();
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

async function tryProviderA(ip) {
  const url = `${process.env.GEO_PROVIDER_A_URL}/${ip}`;
  const json = await fetchWithTimeout(url, TIMEOUT_MS);
  if (json.status === 'fail') throw new Error(json.message || 'Provider A failed');
  return { country: json.country || null, city: json.city || null };
}

async function tryProviderB(ip) {
  const url = `${process.env.GEO_PROVIDER_B_URL}/${ip}/json/`;
  const json = await fetchWithTimeout(url, TIMEOUT_MS);
  if (json.error) throw new Error(json.reason || 'Provider B failed');
  return { country: json.country_name || null, city: json.city || null };
}

export async function enrichWithGeo(ip) {
  // Skip enrichment entirely for local/private IPs (e.g. testing on localhost)
  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return { country: null, city: null };
  }

  try {
    return await tryProviderA(ip);
  } catch (errA) {
    console.warn('Geo provider A failed, trying provider B:', errA.message);
    try {
      return await tryProviderB(ip);
    } catch (errB) {
      console.warn('Geo provider B also failed, continuing without geo data:', errB.message);
      return { country: null, city: null };
    }
  }
}
