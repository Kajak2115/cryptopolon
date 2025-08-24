'use client';
import useSWR from 'swr';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { fetcher } from '../utils/fetcher';

export default function Home() {
  const { data: globalData } = useSWR('https://api.coingecko.com/api/v3/global', fetcher, { refreshInterval: 10000 });
  const { data: topCoins } = useSWR('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1&sparkline=true', fetcher, { refreshInterval: 10000 });

  if (!globalData || !topCoins) return <div className="text-center">Ładowanie dashboardu...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
      <h1 className="text-4xl font-bold text-center accent">Dashboard CryptoPolon</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="chart-container">
          <CardHeader>Kapitalizacja Rynku</CardHeader>
          <CardContent>
            <p className="text-2xl">${globalData.data.total_market_cap.usd.toLocaleString()}</p>
            <p>Zmiana 24h: <span className={globalData.data.market_cap_change_percentage_24h_usd > 0 ? 'positive' : 'negative'}>{globalData.data.market_cap_change_percentage_24h_usd.toFixed(2)}%</span></p>
          </CardContent>
        </Card>
        <Card className="chart-container">
          <CardHeader>3D Wizualizacja Rynku (react-three-fiber)</CardHeader>
          <CardContent>
            <Canvas className="canvas-3d">
              <OrbitControls />
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <Sphere args={[1, 32, 32]} position={[0, 0, 0]}>
                <meshStandardMaterial color="#ffc107" wireframe />
              </Sphere>
            </Canvas>
            <p className="text-center mt-2">Interaktywny globus symbolizujący globalny rynek krypto</p>
          </CardContent>
        </Card>
      </div>
      <Card className="chart-container">
        <CardHeader>Top 5 Monet (z sparklines z crypto-dashboard)</CardHeader>
        <CardContent>
          <table className="table">
            <thead><tr><th>Moneta</th><th>Cena</th><th>Zmiana</th><th>Sparkline</th></tr></thead>
            <tbody>
              {topCoins.map((coin: any) => (
                <tr key={coin.id}>
                  <td>{coin.name}</td>
                  <td>${coin.current_price.toLocaleString()}</td>
                  <td><span className={coin.price_change_percentage_24h > 0 ? 'positive' : 'negative'}>{coin.price_change_percentage_24h.toFixed(2)}%</span></td>
                  <td>
                    <Tooltip>
                      <TooltipTrigger>
                        <svg width="100" height="20">
                          <polyline points={coin.sparkline_in_7d.price.map((p: number, i: number) => `${i * 100 / (coin.sparkline_in_7d.price.length - 1)},${20 - (p / Math.max(...coin.sparkline_in_7d.price) * 20)}`).join(' ')} stroke="#4caf50" fill="none" />
                        </svg>
                      </TooltipTrigger>
                      <TooltipContent>Trend 7-dniowy</TooltipContent>
                    </Tooltip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <div className="text-center">
        <Link href="/rynek" className="text-blue-500 hover:underline">Pełny Screener</Link>
      </div>
    </motion.div>
  );
}