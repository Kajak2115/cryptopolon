'use client';
import useSWR from 'swr';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { fetcher } from '../../utils/fetcher';

export default function OnChain() {
  const { data: metricsData } = useSWR(
    'https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=btc&metrics=CapMrktCurUSD,CapRealUSD,PriceUSD,RealProfitUSD,RealLossUSD,RevUSD&frequency=1d&page_size=365',
    fetcher,
    { refreshInterval: 60000 } // Refresh co 60s
  );

  if (!metricsData) return <div className="text-center">Ładowanie on-chain (aktualizacja co min)...</div>;

  const chartData = metricsData.data.map((item: any) => ({
    date: item.time.split('T')[0],
    price: parseFloat(item.PriceUSD || 0),
    mvrv: parseFloat(item.CapMrktCurUSD || 0) / parseFloat(item.CapRealUSD || 1),
    netPnl: parseFloat(item.RealProfitUSD || 0) - parseFloat(item.RealLossUSD || 0),
    puell: parseFloat(item.RevUSD || 0) / (parseFloat(item.RevUSD || 0) * 365 / 365), // Prosty Puell (rozszerzyć)
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-2 border shadow rounded">
          <p>Data: {label}</p>
          <p>Cena BTC: ${payload[0].value.toFixed(2)}</p>
          <p>MVRV: {payload[1].value.toFixed(2)} (Wysoki powyżej 7 = przegrzanie, np. 2021 powyżej 10)</p>
          <p>Net PnL: {payload[2].value.toFixed(0)} BTC (Dodatni = zyski holderów)</p>
          <p>Puell Multiple: {payload[3].value.toFixed(2)} (Niski poniżej 0.5 = niedowartościowanie)</p>
          <a href="https://checkonchain.com" className="text-blue-500">Więcej na CheckOnChain</a>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-6 chart-container">
      <h1 className="text-2xl font-bold">Wskaźniki On-Chain (BTC)</h1>
      <p>Inspiracja CheckOnChain/CoinAnk: Wykresy z auto-refresh.</p>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="price" stroke="#8884d8" name="Cena USD" />
          <Line yAxisId="right" type="monotone" dataKey="mvrv" stroke="#82ca9d" name="MVRV" />
          <Line yAxisId="right" type="monotone" dataKey="netPnl" stroke="#ffc107" name="Net PnL" />
          <Line yAxisId="right" type="monotone" dataKey="puell" stroke="#4caf50" name="Puell Multiple" />
        </LineChart>
      </ResponsiveContainer>
      <ul className="space-y-2">
        <li><a href="https://charts.checkonchain.com/btconchain/supply/rhodl/rhodl_light.html" className="text-blue-500">RHODL</a> - Hodlowanie.</li>
        {/* Więcej linków */}
      </ul>
    </motion.div>
  );
}