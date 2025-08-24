'use client';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { fetcher } from '../../utils/fetcher';

export default function FundingOI() {
  const { data: binanceFunding } = useSWR('https://fapi.binance.com/fapi/v1/fundingRate?symbol=BTCUSDT&limit=10', fetcher, { refreshInterval: 30000 }); // Real-time
  const { data: okxFunding } = useSWR('https://www.okx.com/api/v5/public/funding-rate?instId=BTC-USDT-SWAP', fetcher, { refreshInterval: 30000 });
  const { data: oiData } = useSWR('https://fapi.binance.com/fapi/v1/openInterest?symbol=BTCUSDT', fetcher, { refreshInterval: 30000 });

  if (!binanceFunding || !okxFunding || !oiData) return <div className="text-center">Ładowanie real-time danych...</div>;

  return (
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-6 chart-container">
      <h1 className="text-2xl font-bold">Funding Rates & Open Interest (Real-Time)</h1>
      <p>Open Interest (Binance): {oiData.openInterest} BTC</p>
      <table className="table">
        <thead>
          <tr>
            <th>Giełda</th>
            <th>Czas</th>
            <th>Funding Rate</th>
          </tr>
        </thead>
        <tbody>
          {binanceFunding.map((rate: any, index: number) => (
            <tr key={index}>
              <td>Binance</td>
              <td>{new Date(rate.fundingTime).toLocaleString()}</td>
              <td><span className={rate.fundingRate > 0 ? 'positive' : 'negative'}>{(rate.fundingRate * 100).toFixed(4)}%</span></td>
            </tr>
          ))}
          <tr>
            <td>OKX</td>
            <td>{new Date(okxFunding.data[0].fundingTime).toLocaleString()}</td>
            <td><span className={okxFunding.data[0].fundingRate > 0 ? 'positive' : 'negative'}>{(okxFunding.data[0].fundingRate * 100).toFixed(4)}%</span></td>
          </tr>
        </tbody>
      </table>
      <p>Inspiracja: CoinAnk funding rates – multi-exchange porównanie.</p>
    </motion.div>
  );
}