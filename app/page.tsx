"use client";

import React, { useEffect, useMemo, useRef, useState, createContext, useContext } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card } from "@/components/ui/card";

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
    const prox = "https://cors.isomorphic-git.org/" + url;
    const r = await fetch(prox, { ...opts, headers: { ...(opts.headers || {}), "x-cors-isomorphic-git": "1" } });
    if (!r.ok) throw new Error("HTTP proxy1 " + r.status);
    const text = await r.text();
    return JSON.parse(text);
  } catch (e) {}
  const prox = "https://api.allorigins.win/raw?url=" + encodeURIComponent(url);
  const r = await fetch(prox, { ...opts });
  if (!r.ok) throw new Error("HTTP proxy2 " + r.status);
  const text = await r.text();
  return JSON.parse(text);
}

function useSandboxNetState() {
  const [state, setState] = useState({ usingProxy: false, demoData: false, wsMock: false });
  return { state, setState };
}

const OHLCChart = ({ data, height, last }: { data: any[]; height: number; last: number }) => {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      time: new Date(item.t).toLocaleTimeString(),
      price: item.c,
    }));
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <XAxis dataKey="time" stroke="#a0a8b3" fontSize={12} />
        <YAxis domain={["auto", "auto"]} stroke="#a0a8b3" fontSize={12} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="price" stroke="#58a6ff" dot={false} />
        {last && (
          <Line
            type="monotone"
            data={[{ time: chartData[chartData.length - 1].time, price: last }]}
            stroke="#7ee787"
            dot={{ r: 4 }}
            name="Ostatnia cena"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default function App() {
  const [route, setRoute] = useState((typeof window !== "undefined" && window.location.hash.replace("#", "")) || "rynek");
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem("cp:settings");
      if (raw) return JSON.parse(raw);
    } catch {}
    return { interval: "1m", theme: "dark" };
  });
  const net = useSandboxNetState();

  useEffect(() => {
    const onHash = () => setRoute((typeof window !== "undefined" && window.location.hash.replace("#", "")) || "rynek");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("cp:settings", JSON.stringify(settings));
    } catch {}
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      <NetContext.Provider value={net}>
        <div className={(settings.theme === "dark" ? "bg-[#0d1117] text-[#e6edf3]" : "bg-white text-[#111]") + " min-h-screen"}>
          <header className="sticky top-0 z-20 border-b border-[#21262d] bg-black/60 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
              <a href="#rynek" className="flex items-center gap-2 font-bold">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-[#58a6ff] to-[#7ee787] text-[#0b1020] font-black">CP</span>
                <span>CryptoPolon</span>
              </a>
              <nav className="flex flex-wrap gap-2 text-sm">
                {[
                  { k: "rynek", label: "Rynek" },
                  { k: "onchain", label: "On-Chain" },
                  { k: "funding-oi", label: "Funding & OI" },
                  { k: "likwidacje", label: "Mapa Likwidacji" },
                  { k: "ustawienia", label: "Ustawienia" },
                ].map((it) => (
                  <a
                    key={it.k}
                    href={`#${it.k}`}
                    className={`rounded-lg px-3 py-1 ${route === it.k ? "bg-[#1f2530]" : "hover:bg-[#171b24]"}`}
                  >
                    {it.label}
                  </a>
                ))}
              </nav>
              <div className="ml-auto flex items-center gap-3">
                <select
                  value={settings.interval}
                  onChange={(e) => setSettings({ ...settings, interval: e.target.value })}
                  className="rounded-md border border-[#30363d] bg-transparent px-2 py-1 text-xs"
                >
                  {INTERVALS.map((iv) => (
                    <option key={iv} value={iv} className="bg-[#0d1117]">
                      {iv}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setSettings({ ...settings, theme: settings.theme === "dark" ? "light" : "dark" })}
                  className="rounded-lg border border-[#30363d] px-3 py-1 text-xs hover:bg-[#171b24]"
                >
                  {settings.theme === "dark" ? "Tryb: Ciemny" : "Tryb: Jasny"}
                </button>
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-4 py-6">
            {route === "rynek" && <Market />}
            {route === "onchain" && <OnChain />}
            {route === "funding-oi" && <FundingOI />}
            {route === "likwidacje" && <LiquidationHeatmap />}
            {route === "ustawienia" && <SettingsPage />}
          </main>
          <footer className="border-t border-[#21262d] bg-black/60 p-4 text-center text-xs text-[#a0a8b3]">
            Źródła: Binance, CoinGecko. Inspiracja: CoinAnk, react-three-fiber, shadcn-ui.
          </footer>
        </div>
      </NetContext.Provider>
    </SettingsContext.Provider>
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
  const [last, setLast] = useState<number | undefined>();
  const [klines, setKlines] = useState<any[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const iv = settings.interval === "tick" ? "1m" : settings.interval;
      const url = `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${iv}&limit=180`;
      try {
        const data = await fetchJSON(url);
        if (!alive) return;
        const rows = (data || []).map((r) => ({ t: r[0], o: +r[1], h: +r[2], l: +r[3], c: +r[4] }));
        setKlines(rows);
      } catch (e) {
        setState((s) => ({ ...s, usingProxy: true, demoData: true }));
        const now = Date.now();
        const rows = Array.from({ length: 180 }).map((_, i) => {
          const t = now - (180 - i) * 60_000;
          const base = 65000 + Math.sin(i / 8) * 400 + Math.random() * 50;
          return { t, o: base - 30, h: base + 40, l: base - 60, c: base };
        });
        setKlines(rows);
      }
    })();
    return () => {
      alive = false;
    };
  }, [settings.interval]);

  useEffect(() => {
    let ws;
    let timer;
    try {
      ws = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@miniTicker");
      let gotMsg = false;
      ws.onmessage = (event) => {
        try {
          const d = JSON.parse(event.data);
          gotMsg = true;
          setLast(parseFloat(d.c));
        } catch {}
      };
      ws.onerror = () => {
        setState((s) => ({ ...s, wsMock: true }));
      };
      timer = setTimeout(() => {
        if (!gotMsg) {
          try {
            ws.close();
          } catch {}
          setState((s) => ({ ...s, wsMock: true }));
          poll();
        }
      }, 5000);
    } catch (e) {
      setState((s) => ({ ...s, wsMock: true }));
      poll();
    }

    function poll() {
      let pTimer;
      const loop = async () => {
        try {
          const d = await fetchJSON("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
          setLast(parseFloat(d.price));
        } catch {
          setState((s) => ({ ...s, demoData: true }));
          setLast((v) => (v || 65000) + (Math.random() - 0.5) * 10);
        }
        pTimer = setTimeout(loop, settings.interval === "tick" ? 1000 : 6000);
      };
      loop();
      return () => clearTimeout(pTimer);
    }

    return () => {
      try {
        ws && ws.close();
      } catch {}
      clearTimeout(timer);
    };
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
        const d = await fetchJSON("https://api.coingecko.com/api/v3/global");
        setGlobal({ mcap: d.data.total_market_cap.usd, change24h: d.data.market_cap_change_percentage_24h_usd });
      } catch {
        setState((s) => ({ ...s, usingProxy: true, demoData: true }));
        setGlobal({ mcap: 2300000000000, change24h: 0.85 });
      }
      try {
        const rows = await fetchJSON(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=12&page=1&price_change_percentage=24h"
        );
        setTop(rows);
      } catch {
        setState((s) => ({ ...s, usingProxy: true, demoData: true }));
        setTop(demoTop());
      }
    })();
  }, []);

  function demoTop() {
    return Array.from({ length: 10 }).map((_, i) => ({
      id: "demo" + i,
      name: "DEMO" + (i + 1),
      symbol: "D" + (i + 1),
      current_price: 1000 - i * 20 + Math.random() * 5,
      price_change_percentage_24h: (Math.random() - 0.5) * 6,
      market_cap: 50000000000 - i * 2000000000,
    }));
  }

  return (
    <Card title="Rynek — kapitalizacja i top monety" subtitle="Źródło: CoinGecko">
      <div className="mb-3 flex items-baseline gap-3">
        <div className="text-3xl font-bold">
          {global.mcap ? `$${Intl.NumberFormat("en-US").format(Math.round(global.mcap))}` : "…"}
        </div>
        {global.change24h !== undefined && (
          <span className={`text-sm ${global.change24h >= 0 ? "text-[#2ea043]" : "text-[#f85149]"}`}>
            {(global.change24h >= 0 ? "+" : "") + global.change24h.toFixed(2)}%
          </span>
        )}
      </div>
      <div className="overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="sticky top-0 bg-[#161b22] text-left text-[#a0a8b3]">
              <th className="py-2 pr-2">Moneta</th>
              <th className="py-2 pr-2">Symbol</th>
              <th className="py-2 pr-2">Cena</th>
              <th className="py-2 pr-2">Zmiana 24h</th>
              <th className="py-2 pr-2">Kapitalizacja</th>
            </tr>
          </thead>
          <tbody>
            {top.map((it) => (
              <tr key={it.id} className="border-t border-[#30363d]">
                <td className="py-1 pr-2">{it.name}</td>
                <td className="py-1 pr-2">{it.symbol.toUpperCase()}</td>
                <td className="py-1 pr-2">${it.current_price.toFixed(2)}</td>
                <td className={`py-1 pr-2 ${it.price_change_percentage_24h >= 0 ? "text-[#2ea043]" : "text-[#f85149]"}`}>
                  {(it.price_change_percentage_24h >= 0 ? "+" : "") + it.price_change_percentage_24h.toFixed(2)}%
                </td>
                <td className="py-1 pr-2">${Intl.NumberFormat("en-US").format(Math.round(it.market_cap))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function OnChain() {
  return <div>Strona On-Chain (w budowie)</div>;
}

function FundingOI() {
  return <div>Funding & OI (w budowie)</div>;
}

function LiquidationHeatmap() {
  return <div>Mapa Likwidacji (w budowie)</div>;
}

function SettingsPage() {
  return <div>Ustawienia (w budowie)</div>;
}