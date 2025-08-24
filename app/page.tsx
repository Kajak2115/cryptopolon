"use client"; // Dodaje dyrektywę dla Client Component

import React, { useEffect, useMemo, useRef, useState, createContext, useContext } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const INTERVALS = ["tick", "1m", "15m", "1d", "1w", "1M"];
const SettingsContext = createContext({ settings: { interval: "1m", theme: "dark" }, setSettings: (s: any) => {} });
const useSettings = () => useContext(SettingsContext);
const NetContext = createContext({ state: { usingProxy: false, demoData: false, wsMock: false }, setState: (s: any) => {} });
const useNet = () => useContext(NetContext);

async function fetchJSON(url: string, opts: any = {}) {
  try {
    const r = await fetch(url, { ...opts });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.json();
  } catch (e) {}
  try {
    const prox = 'https://cors.isomorphic-git.org/' + url;
    const r = await fetch(prox, { ...opts, headers: { ...(opts.headers || {}), 'x-cors-isomorphic-git': '1' } });
    if (!r.ok) throw new Error("HTTP proxy1 " + r.status);
    const text = await r.text();
    return JSON.parse(text);
  } catch (e) {}
  const prox = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url);
  const r = await fetch(prox, { ...opts });
  if (!r.ok) throw new Error("HTTP proxy2 " + r.status);
  const text = await r.text();
  return JSON.parse(text);
}

function useSandboxNetState() {
  const [state, setState] = useState({ usingProxy: false, demoData: false, wsMock: false });
  return { state, setState };
}

export default function App() {
  const [route, setRoute] = useState((typeof window !== 'undefined' && window.location.hash.replace('#', '')) || 'rynek');
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem('cp:settings');
      if (raw) return JSON.parse(raw);
    } catch {}
    return { interval: '1m', theme: 'dark' };
  });
  const net = useSandboxNetState();

  useEffect(() => {
    const onHash = () => setRoute((typeof window !== 'undefined' && window.location.hash.replace('#', '')) || 'rynek');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('cp:settings', JSON.stringify(settings));
    } catch {}
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      <NetContext.Provider value={net}>
        <div className={(settings.theme === 'dark' ? 'bg-[#0d1117] text-[#e6edf3]' : 'bg-white text-[#111]') + " min-h-screen"}>
          <Header route={route} />
          <CompatibilityBanner />
          <main className="mx-auto max-w-7xl px-4 py-6">
            {route === 'rynek' && <Market />}
            {route === 'onchain' && <OnChain />}
            {route === 'funding-oi' && <FundingOI />}
            {route === 'likwidacje' && <LiquidationHeatmap />}
            {route === 'ustawienia' && <SettingsPage />}
          </main>
          <Footer />
        </div>
      </NetContext.Provider>
    </SettingsContext.Provider>
  );
}

function Header({ route }) {
  const { settings, setSettings } = useSettings();
  const nav = [
    { k: 'rynek', label: 'Rynek' },
    { k: 'onchain', label: 'On-Chain' },
    { k: 'funding-oi', label: 'Funding & OI' },
    { k: 'likwidacje', label: 'Mapa Likwidacji' },
    { k: 'ustawienia', label: 'Ustawienia' }
  ];
  const active = (k) => (route || 'rynek') === k;
  return (
    <header className="sticky top-0 z-20 border-b border-[#21262d] bg-black/60 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <a href="#rynek" className="flex items-center gap-2 font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-[#58a6ff] to-[#7ee787] text-[#0b1020] font-black">CP</span>
          <span>CryptoPolon</span>
        </a>
        <nav className="flex flex-wrap gap-2 text-sm">
          {nav.map(it => (
            <a key={it.k} href={`#${it.k}`} className={`rounded-lg px-3 py-1 ${active(it.k) ? 'bg-[#1f2530]' : 'hover:bg-[#171b24]'}`}>{it.label}</a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <IntervalSelect value={settings.interval} onChange={(v) => setSettings({ ...settings, interval: v })} />
          <button onClick={() => setSettings({ ...settings, theme: settings.theme === 'dark' ? 'light' : 'dark' })} className="rounded-lg border border-[#30363d] px-3 py-1 text-xs hover:bg-[#171b24]">{settings.theme === 'dark' ? 'Tryb: Ciemny' : 'Tryb: Jasny'}</button>
        </div>
      </div>
    </header>
  );
}

function CompatibilityBanner() {
  const { state } = useNet();
  const any = state.usingProxy || state.demoData || state.wsMock;
  if (!any) return null;
  return (
    <div className="border-b border-[#30363d] bg-[#111826] px-4 py-2 text-xs text-[#a0a8b3]">
      Tryb zgodności: {state.usingProxy && 'proxy '}{state.wsMock && 'symulacja-WS '}{state.demoData && 'demo-dane '} - do pełni funkcji uruchom przez HTTPS (np. Vercel).
    </div>
  );
}

function IntervalSelect({ value, onChange }) {
  return (
    <label className="flex items-center gap-2 text-xs">
      <span>Interwał:</span>
      <select value={value} onChange={e => onChange(e.target.value)} className="rounded-md border border-[#30363d] bg-transparent px-2 py-1">
        {INTERVALS.map(iv => <option key={iv} value={iv} className="bg-[#0d1117]">{iv}</option>)}
      </select>
    </label>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-[#30363d] bg-[#161b22] p-4 shadow">
      <h2 className="mb-1 text-base font-semibold">{title}</h2>
      {subtitle && <div className="mb-3 text-xs text-[#a0a8b3]">{subtitle}</div>}
      {children}
    </section>
  );
}

function Market() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <LiveTicker />
      <MarketToplist />
    </div>
  );
}

function LiveTicker() {
  const { settings } = useSettings();
  const { state, setState } = useNet();
  const [last, setLast] = useState();
  const [klines, setKlines] = useState([]);
  const sym = 'BTCUSDT';

  useEffect(() => {
    let alive = true;
    (async () => {
      const iv = settings.interval === 'tick' ? '1m' : settings.interval;
      const url = `https://api.binance.com/api/v3/klines?symbol=${sym}&interval=${iv}&limit=180`;
      try {
        const data = await fetchJSON(url);
        if (!alive) return;
        const rows = (data || []).map((r) => ({ t: r[0], o: +r[1], h: +r[2], l: +r[3], c: +r[4] }));
        setKlines(rows);
      } catch (e) {
        setState(s => ({ ...s, usingProxy: true, demoData: true }));
        const now = Date.now();
        const rows = Array.from({ length: 180 }).map((_, i) => {
          const t = now - (180 - i) * 60_000;
          const base = 65000 + Math.sin(i / 8) * 400 + Math.random() * 50;
          return { t, o: base - 30, h: base + 40, l: base - 60, c: base };
        });
        setKlines(rows);
      }
    })();
    return () => { alive = false };
  }, [settings.interval]);

  useEffect(() => {
    let ws; let timer;
    try {
      ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@miniTicker');
      let gotMsg = false;
      ws.onmessage = (event) => { try { const d = JSON.parse(event.data); gotMsg = true; setLast(parseFloat(d.c)); } catch {} };
      ws.onerror = () => { setState(s => ({ ...s, wsMock: true })); };
      timer = setTimeout(() => { if (!gotMsg) { try { ws.close(); } catch {}; setState(s => ({ ...s, wsMock: true })); poll(); } }, 5000);
    } catch (e) { setState(s => ({ ...s, wsMock: true })); poll(); }

    function poll() {
      let pTimer;
      const loop = async () => {
        try {
          const d = await fetchJSON('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
          setLast(parseFloat(d.price));
        } catch {
          setState(s => ({ ...s, demoData: true }));
          setLast(v => (v || 65000) + (Math.random() - 0.5) * 10);
        }
        pTimer = setTimeout(loop, settings.interval === 'tick' ? 1000 : 6000);
      };
      loop();
      return () => clearTimeout(pTimer);
    }

    return () => { try { ws && ws.close(); } catch {}; clearTimeout(timer); };
  }, [settings.interval, setState]);

  return (
    <Card title="BTC/USDT — cena na żywo" subtitle={`Interwał świec: ${settings.interval}`}>
      <OHLCChart data={klines} height={260} last={last} />
      <div className="mt-2 text-xs text-[#a0a8b3]">Źródło: Binance (z fallbackiem proxy/symulacji dla środowisk z ograniczeniami).</div>
    </Card>
  );
}

function MarketToplist() {
  const { setState } = useNet();
  const [global, setGlobal] = useState({});
  const [top, setTop] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const d = await fetchJSON('https://api.coingecko.com/api/v3/global');
        setGlobal({ mcap: d.data.total_market_cap.usd, change24h: d.data.market_cap_change_percentage_24h_usd });
      } catch { setState(s => ({ ...s, usingProxy: true, demoData: true })); setGlobal({ mcap: 2300000000000, change24h: 0.85 }); }
      try {
        const rows = await fetchJSON('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=12&page=1&price_change_percentage=24h');
        setTop(rows);
      } catch { setState(s => ({ ...s, usingProxy: true, demoData: true })); setTop(demoTop()); }
    })();
  }, []);
  function demoTop() {
    return Array.from({ length: 10 }).map((_, i) => ({ id: 'demo' + i, name: 'DEMO' + (i + 1), symbol: 'D' + (i + 1), current_price: (1000 - i * 20 + Math.random() * 5), price_change_percentage_24h: (Math.random() - 0.5) * 6, market_cap: (50000000000 - i * 2000000000) }));
  }
  return (
    <Card title="Rynek — kapitalizacja i top monety" subtitle="Źródło: CoinGecko">
      <div className="mb-3 flex items-baseline gap-3">
        <div className="text-3xl font-bold">{global.mcap ? `$${Intl.NumberFormat('en-US').format(Math.round(global.mcap))}` : '…'}</div>
        {global.change24h !== undefined && (
          <span className={`text-sm ${global.change24h >= 0 ? 'text-[#2ea043]' : 'text-[#f85149]'}`}>{(global.change24h >= 0 ? '+' : '') + (global.change24h).toFixed(2)}%</span>
        )}
      </div>
      <div className="overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="sticky top-0 bg-[#161b22] text-left text-[#a0a8b3]">
              <th className="py-2 pr-2">Moneta</th><th className="py-2 pr-2">Symbol</th><th className="py-2 pr-2">Cena</th><th className="py-2 pr-2">Zmiana 24h</th><th className="py-2 pr-2">Kapitalizacja</th>
            </tr>
          </thead>
          <tbody>
            {top.map(it => (
              <tr key={it.id} className="border-t border-[#30363d]">
                <td className="py-1 pr-2">{it.name}</td>
                <td className="py-1 pr-2">{it.symbol.toUpperCase()}</td>
                <td className="py-1 pr-2">${(it.current_price || 0).toLocaleString()}</td>
                <td className={`py-1 pr-2 ${(it.price_change_percentage_24h || 0) >= 0 ? 'text-[#2ea043]' : 'text-[#f85149]'}`}>{(it.price_change_percentage_24h || 0).toFixed(2)}%</td>
                <td className="py-1 pr-2">${(it.market_cap || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function OnChain() {
  const { settings } = useSettings();
  const [data, setData] = useState([]);
  useEffect(() => {
    (async () => {
      const url = `https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=btc&metrics=PriceUSD,CapMrktCurUSD,CapRealUSD,MvrvZscore&frequency=1d&page_size=100`;
      try {
        const res = await fetchJSON(url);
        setData(res.data || []);
      } catch {
        setData(Array.from({ length: 100 }).map((_, i) => ({ time: new Date(Date.now() - i * 86400000).toISOString(), PriceUSD: 65000 + Math.sin(i / 10) * 1000, MvrvZscore: 2 + Math.sin(i / 15) * 1 })));
      }
    })();
  }, [settings.interval]);

  const chartData = useMemo(() => data.map(d => ({
    date: new Date(d.time).toLocaleDateString(),
    price: d.PriceUSD || 0,
    mvrv: (d.CapMrktCurUSD || 0) / (d.CapRealUSD || 1),
    mvrvZscore: d.MvrvZscore || 0
  })), [data]);

  return (
    <Card title="On-Chain Wskaźniki" subtitle="Źródło: CoinMetrics (demo fallback)">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="price" stroke="#8884d8" name="Cena USD" />
          <Line yAxisId="right" type="monotone" dataKey="mvrv" stroke="#82ca9d" name="MVRV" />
          <Line yAxisId="right" type="monotone" dataKey="mvrvZscore" stroke="#ffc107" name="MVRV Z-Score" />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-2 text-xs text-[#a0a8b3]">MVRV > 7 = przegrzanie, Z-Score > 6 = szczyt (np. 2021).</div>
    </Card>
  );
}

function FundingOI() {
  const { settings } = useSettings();
  const [data, setData] = useState([]);
  useEffect(() => {
    (async () => {
      const urls = [
        'https://fapi.binance.com/fapi/v1/fundingRate?symbol=BTCUSDT&limit=50',
        'https://www.okx.com/api/v5/public/funding-rate?instId=BTC-USDT-SWAP'
      ];
      try {
        const [binance, okx] = await Promise.all(urls.map(url => fetchJSON(url)));
        setData([...(binance || []), ...(okx.data || [])]);
      } catch {
        setData(Array.from({ length: 50 }).map((_, i) => ({ fundingTime: Date.now() - i * 3600000, fundingRate: (Math.random() - 0.5) * 0.01, exchange: i % 2 ? 'OKX' : 'Binance' })));
      }
    })();
  }, [settings.interval]);

  return (
    <Card title="Funding & OI" subtitle="Źródło: Binance, OKX (demo fallback)">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="sticky top-0 bg-[#161b22] text-left text-[#a0a8b3]">
            <th className="py-2 pr-2">Giełda</th><th className="py-2 pr-2">Czas</th><th className="py-2 pr-2">Funding Rate</th>
          </tr>
        </thead>
        <tbody>
          {data.map((it, i) => (
            <tr key={i} className="border-t border-[#30363d]">
              <td className="py-1 pr-2">{it.exchange || 'Binance'}</td>
              <td className="py-1 pr-2">{new Date(it.fundingTime).toLocaleString()}</td>
              <td className="py-1 pr-2">{(it.fundingRate * 100).toFixed(4)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function LiquidationHeatmap() {
  const { setState } = useNet();
  const [buckets, setBuckets] = useState([]);

  useEffect(() => {
    let ws; let demoTimer; let noMsgTimer;
    const bucketSize = 100; const maxBuckets = 80; const map = new Map();

    function push(price, side, qty) {
      const b = Math.floor(price / bucketSize) * bucketSize;
      const cur = map.get(b) || { price: b, long: 0, short: 0 };
      if (side === 'BUY') cur.long += qty; else cur.short += qty;
      map.set(b, cur);
      const keys = Array.from(map.keys()).sort((a, b) => a - b);
      if (keys.length > maxBuckets) { keys.slice(0, keys.length - maxBuckets).forEach(k => map.delete(k)); }
      setBuckets(Array.from(map.values()).sort((a, b) => a.price - b.price));
    }

    try {
      ws = new WebSocket('wss://fstream.binance.com/ws/!forceOrder@arr');
      let got = false;
      ws.onmessage = (event) => { got = true; try { const arr = JSON.parse(event.data); (Array.isArray(arr) ? arr : [arr]).forEach((e) => { const o = e.o || e; const p = parseFloat(o.p); const s = o.S; const q = parseFloat(o.q) * (parseFloat(o.ap || '1')); if (Number.isFinite(p) && Number.isFinite(q)) push(p, s, q); }); } catch {} };
      ws.onerror = () => { setState(s => ({ ...s, wsMock: true })); startDemo(); };
      noMsgTimer = setTimeout(() => { if (!got) { try { ws.close(); } catch {}; setState(s => ({ ...s, wsMock: true })); startDemo(); } }, 5000);
    } catch (e) { setState(s => ({ ...s, wsMock: true })); startDemo(); }

    function startDemo() {
      let last = 65000;
      demoTimer = setInterval(() => {
        last += (Math.random() - 0.5) * 50;
        for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
          const price = last + (Math.random() - 0.5) * 1500;
          const side = Math.random() > 0.5 ? 'BUY' : 'SELL';
          const qty = Math.random() * 200000;
          push(price, side, qty);
        }
      }, 800);
    }

    return () => { try { ws && ws.close(); } catch {}; clearTimeout(noMsgTimer); clearInterval(demoTimer); };
  }, [setState]);

  return (
    <Card title="Mapa likwidacji — live (Binance)" subtitle="Grupowanie zdarzeń likwidacji do poziomów cenowych (demo fallback w sandboxie)">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <HeatmapTable rows={buckets} />
        <BarChart data={buckets.map(b => ({ x: b.price, y: b.long - b.short }))} label="Saldo: długie − krótkie" height={300} />
      </div>
      <div className="mt-2 text-xs text-[#a0a8b3]">W produkcji zalecane łączenie wielu giełd i normalizacja nominałów.</div>
    </Card>
  );
}

function SettingsPage() {
  const { settings, setSettings } = useSettings();
  const exportData = () => {
    const csv = "Dane,Czas,Wartość\n" + data.map(d => `${d.exchange},${d.fundingTime},${d.fundingRate}`).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cryptopolon_funding.csv';
    a.click();
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card title="Preferencje użytkownika" subtitle="Zapis w localStorage">
        <div className="flex flex-col gap-3 text-sm">
          <IntervalSelect value={settings.interval} onChange={(v) => setSettings({ ...settings, interval: v })} />
          <div>
            <label className="mr-2">Motyw:</label>
            <select value={settings.theme} onChange={e => setSettings({ ...settings, theme: e.target.value })} className="rounded-md border border-[#30363d] bg-transparent px-2 py-1">
              <option className="bg-[#0d1117]" value="dark">Ciemny</option>
              <option className="bg-[#0d1117]" value="light">Jasny</option>
            </select>
          </div>
          <button onClick={exportData} className="mt-2 px-4 py-2 bg-blue-500 rounded hover:bg-blue-600">Eksportuj CSV</button>
        </div>
      </Card>
      <Card title="Źródła i autorzy" subtitle="Hiperlinki do CheckOnChain (z poszanowaniem autorstwa)">
        <ul className="list-disc pl-5 text-sm">
          <li>MVRV Z-Score — <a className="text-[#58a6ff] underline" href="https://charts.checkonchain.com/" target="_blank" rel="noreferrer">Check on Chain</a></li>
          <li>RHODL Ratio — <a className="text-[#58a6ff] underline" href="https://charts.checkonchain.com/" target="_blank" rel="noreferrer">Check on Chain</a></li>
          <li>SOPR — <a className="text-[#58a6ff] underline" href="https://charts.checkonchain.com/" target="_blank" rel="noreferrer">Check on Chain</a></li>
          <li>Puell Multiple — <a className="text-[#58a6ff] underline" href="https://charts.checkonchain.com/" target="_blank" rel="noreferrer">Check on Chain</a></li>
        </ul>
      </Card>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#21262d] px-4 py-6 text-sm text-[#a0a8b3]">
      <div className="mx-auto max-w-7xl">
        © {new Date().getFullYear()} CryptoPolon. Dane: Binance, Bybit, CoinGecko, Coin Metrics (Community). Linki: charts.checkonchain.com (autorzy zachowani). Niepowiązane z CoinGlass/Coinank/CryptoQuant.
      </div>
    </footer>
  );
}