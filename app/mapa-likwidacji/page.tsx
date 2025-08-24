'use client';
import useSWR from 'swr';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { fetcher } from '../../utils/fetcher';

export default function MapaLikwidacji() {
  const { data: liqData } = useSWR('https://api.coinglass.com/api/futures/liquidationChart?symbol=BTC&timeType=24h', fetcher, { refreshInterval: 10000 }); // Real-time co 10s

  if (!liqData) return <div className="text-center">Ładowanie real-time heatmapy...</div>;

  const chartData = liqData.data.map((item: any) => ({
    price: item.price,
    long: item.buyVolUsdt,
    short: -item.sellVolUsdt,
  }));

  return (
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-6 chart-container">
      <h1 className="text-2xl font-bold">Mapa Likwidacji (BTC/USDT - Real-Time)</h1>
      <p>Heatmapa long/short z Coinglass (inspiracja CoinAnk liqMap).</p>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <XAxis dataKey="price" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="long" fill="#4caf50" name="Long" />
          <Bar dataKey="short" fill="#f44336" name="Short" />
        </BarChart>
      </ResponsiveContainer>
      <p>Netto likwidacje: Long - Short (aktualizacja co 10s).</p>
    </motion.div>
  );
}