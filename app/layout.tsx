"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) setDarkMode(JSON.parse(savedMode));
  }, []);

  useEffect(() => {
    if (isMounted) localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode, isMounted]);

  const htmlClassName = isMounted ? (darkMode ? 'dark' : '') : 'dark';

  return (
    <html lang="pl" className={htmlClassName}>
      <body>
        <header className="sticky top-0 bg-slate-900 shadow p-4 flex justify-between items-center z-10">
          <Link href="/" className="text-2xl font-bold accent">CP CryptoPolon</Link>
          <div className="flex items-center space-x-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" className="md:hidden">☰</Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-slate-900">
                <nav className="space-y-4">
                  <Link href="/" className="block hover:accent">Dashboard</Link>
                  <Link href="/rynek" className="block hover:accent">Rynek</Link>
                  <Link href="/on-chain" className="block hover:accent">On-Chain</Link>
                  <Link href="/funding-oi" className="block hover:accent">Funding & OI</Link>
                  <Link href="/mapa-likwidacji" className="block hover:accent">Mapa Likwidacji</Link>
                  <Link href="/ustawienia" className="block hover:accent">Ustawienia</Link>
                </nav>
              </SheetContent>
            </Sheet>
            <nav className="space-x-4 hidden md:flex">
              <Link href="/" className="hover:accent">Dashboard</Link>
              <Link href="/rynek" className="hover:accent">Rynek</Link>
              <Link href="/on-chain" className="hover:accent">On-Chain</Link>
              <Link href="/funding-oi" className="hover:accent">Funding & OI</Link>
              <Link href="/mapa-likwidacji" className="hover:accent">Mapa Likwidacji</Link>
              <Link href="/ustawienia" className="hover:accent">Ustawienia</Link>
            </nav>
            <span>PL (Demo)</span>
            <Button onClick={() => setDarkMode(!darkMode)} variant="outline">
              {darkMode ? 'Jasny' : 'Ciemny'}
            </Button>
          </div>
        </header>
        <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="p-6">
          {children}
        </motion.main>
        <footer className="bg-slate-900 p-4 text-center text-sm">
          Źródła: CoinGecko, CoinMetrics, Coinglass,@Checkmatey-Checonchain,@TomasOnMarkets Inspiracja: Prof. Adam aka Young Finance
        </footer>
      </body>
    </html>
  );
}