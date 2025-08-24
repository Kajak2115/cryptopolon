import React, { useEffect, useState } from 'react';
import { useTicker } from '@/hooks/useTicker';
import { useSettings } from '@/context/SettingsContext';
import fetchJSON from '@/utils/fetchJSON';
import Card from '@/components/Card';
import OHLCChart from '@/components/OHLCChart';

export function LiveTicker() {
  const last = useTicker('BTCUSDT');
  const { settings } = useSettings();
  const [klines, setKlines] = useState<any[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const iv = settings.interval === 'tick' ? '1m' : settings.interval;
      const url = `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${iv}&limit=180`;
      try {
        const data = await fetchJSON(url);
        if (!alive) return;
        const rows = data.map((r: any) => ({
          t: r[0], o: +r[1], h: +r[2], l: +r[3], c: +r[4]
        }));
        setKlines(rows);
      } catch {
        const now = Date.now();
        setKlines(Array.from({ length: 180 }).map((_, i) => {
          const t = now - (180 - i) * 60000;
          const base = 65000 + Math.sin(i / 8) * 400 + Math.random() * 50;
          return { t, o: base - 30, h: base + 40, l: base - 60, c: base };
        }));
      }
    })();
    return () => { alive = false; };
  }, [settings.interval]);

  return (
    <Card title="BTC/USDT — cena" subtitle={`Interwał: ${settings.interval}`}>
      <OHLCChart data={klines} height={260} last={last ?? undefined} />
    </Card>
  );
}