
'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from '@/components/ui/card';
import { useSettings } from '@/context/SettingsContext';
import { useTicker } from '@/hooks/useTicker';
import { cn } from '@/utils/cn';
import fetchJSON from '@/utils/fetchJSON';

const INTERVALS = ['tick', '1m', '15m', '1d', '1w', '1M'];

const HomePage: React.FC = () => {
  const { settings, setSettings } = useSettings();
  const lastPrice = useTicker('BTCUSDT');
  const [klines, setKlines] = React.useState<any[]>([]);

  useEffect(() => {
    let alive = true;

    const fetchKlines = async () => {
      const interval = settings.interval === 'tick' ? '1m' : settings.interval;
      const url = 'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=' + interval + '&limit=180';
      try {
        const data = await fetchJSON(url);
        if (!alive) return;
        const rows = data.map((r: any) => ({
          t: r[0],
          o: +r[1],
          h: +r[2],
          l: +r[3],
          c: +r[4],
        }));
        setKlines(rows);
      } catch {
        const now = Date.now();
        setKlines(
          Array.from({ length: 180 }).map((_, i) => {
            const t = now - (180 - i) * 60000;
            const base = 65000 + Math.sin(i / 8) * 400 + Math.random() * 50;
            return { t, o: base - 30, h: base + 40, l: base - 60, c: base };
          })
        );
      }
    };

    fetchKlines();

    return () => {
      alive = false;
    };
  }, [settings.interval]);

  const toggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    setSettings({ ...settings, theme: newTheme });
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
  };

  return (
    <div
      className={cn(
        'min-h-screen',
        settings.theme === 'dark' ? 'bg-[#0d1117] text-[#e6edf3]' : 'bg-white text-[#111]'
      )}
    >
      <header className="sticky top-0 bg-inherit shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
          <a href="/" className="text-xl font-bold">
            CryptoPolon
          </a>
          <nav className="ml-auto flex items-center gap-4">
            <select
              value={settings.interval}
              onChange={(e) => setSettings({ ...settings, interval: e.target.value })}
              className="rounded-lg border border-[#30363d] px-3 py-1 text-sm"
            >
              {INTERVALS.map((interval) => (
                <option key={interval} value={interval}>
                  {interval}
                </option>
              ))}
            </select>
            <button
              onClick={toggleTheme}
              className="rounded-lg border border-[#30363d] px-3 py-1 text-sm hover:bg-[#171b24]"
            >
              Tryb: {settings.theme === 'dark' ? 'Ciemny' : 'Jasny'}
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card title="BTC/USDT — cena" subtitle={'Interwał: ' + settings.interval}>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={klines}>
                <XAxis dataKey="t" tickFormatter={(t) => new Date(t).toLocaleTimeString()} />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="c" stroke="#8884d8" dot={false} name="Cena zamknięcia" />
                {lastPrice && (
                  <Line
                    type="monotone"
                    dataKey={() => lastPrice}
                    stroke="#ff7300"
                    dot={false}
                    name="Ostatnia cena"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default HomePage;