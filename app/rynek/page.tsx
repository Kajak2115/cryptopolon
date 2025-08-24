'use client';
import useSWR from 'swr';
import { fetcher } from '../../utils/fetcher';

export default function Rynek() {
  const { data: globalData } = useSWR('https://api.coingecko.com/api/v3/global', fetcher);
  const { data: topCoins } = useSWR('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1', fetcher);

  if (!globalData || !topCoins) return <div className="text-center">Ładowanie...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Rynek Krypto</h1>
      <p>Kapitalizacja globalna: ${globalData.data.total_market_cap.usd.toLocaleString()} (Zmiana 24h: <span className={globalData.data.market_cap_change_percentage_24h_usd > 0 ? 'positive' : 'negative'}>{globalData.data.market_cap_change_percentage_24h_usd}%</span>)</p>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700">
            <th className="p-2 text-left">Moneta</th>
            <th className="p-2 text-left">Cena USD</th>
            <th className="p-2 text-left">Zmiana 24h</th>
            <th className="p-2 text-left">Kapitalizacja</th>
          </tr>
        </thead>
        <tbody>
          {topCoins.map((coin: any) => (
            <tr key={coin.id} className="border-b dark:border-gray-600">
              <td className="p-2">{coin.name}</td>
              <td className="p-2">${coin.current_price.toLocaleString()}</td>
              <td className="p-2"><span className={coin.price_change_percentage_24h > 0 ? 'positive' : 'negative'}>{coin.price_change_percentage_24h}%</span></td>
              <td className="p-2">${coin.market_cap.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}