'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Ustawienia() {
  const [interval, setInterval] = useState('1d');

  const exportData = () => {
    // Logika eksportu (np. CSV z localStorage lub API)
    alert('Eksport danych do CSV...');
  };

  return (
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-6 chart-container">
      <h1 className="text-2xl font-bold">Ustawienia</h1>
      <p>Tryb ciemny/jasny: Ustawiony w headerze.</p>
      <label>Interwał wykresów:
        <select value={interval} onChange={(e) => setInterval(e.target.value)} className="ml-2 bg-gray-800 p-1 rounded">
          <option value="1d">1 Dzień</option>
          <option value="1w">1 Tydzień</option>
          <option value="1m">1 Miesiąc</option>
        </select>
      </label>
      <button onClick={exportData} className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600">Eksportuj Dane</button>
      <p>UX inspiracja CoinAnk: Szybkie filtry i eksport.</p>
    </motion.div>
  );
}