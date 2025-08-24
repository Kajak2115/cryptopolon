async function fetchJSON(url: string, opts: RequestInit = {}) {
  const proxied = `/api/proxy?url=${encodeURIComponent(url)}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(proxied, { ...opts, signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`Proxy HTTP ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
}

export default fetchJSON;