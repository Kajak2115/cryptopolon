import { useEffect, useState } from 'react';
import { useNet } from '@/context/NetContext';
import fetchJSON from '@/utils/fetchJSON';

export function useTicker(symbol: string = 'BTCUSDT') {
  const { setState } = useNet();
  const [last, setLast] = useState<number | null>(null);

  useEffect(() => {
    let ws: WebSocket;
    let poller: NodeJS.Timeout;
    let got = false;

    const connectWS = () => {
      ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@miniTicker`);
      ws.onmessage = (ev) => {
        got = true;
        const d = JSON.parse(ev.data);
        setLast(parseFloat(d.c));
      };
      ws.onerror = () => {
        setState(s => ({ ...s, wsMock: true }));
        fallbackPoll();
      };
      setTimeout(() => {
        if (!got) {
          ws.close();
          setState(s => ({ ...s, wsMock: true }));
          fallbackPoll();
        }
      }, 5000);
    };

    const fallbackPoll = () => {
      const poll = async () => {
        try {
          const d = await fetchJSON(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
          setLast(parseFloat(d.price));
        } catch {
          setLast(v => (v || 60000) + (Math.random() - 0.5) * 100);
        }
        poller = setTimeout(poll, 6000);
      };
      poll();
    };

    connectWS();

    return () => {
      try { ws.close(); } catch {}
      clearTimeout(poller);
    };
  }, [symbol, setState]);

  return last;
}