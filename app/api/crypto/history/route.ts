import { NextResponse } from 'next/server';

interface PricePoint {
  time: number;
  price: number;
}

// Map coin IDs to Kraken pair names
const ID_TO_KRAKEN: Record<string, string> = {
  bitcoin: 'XBT/USD',
  ethereum: 'ETH/USD',
  solana: 'SOL/USD',
  dogecoin: 'DOGE/USD',
  cardano: 'ADA/USD',
  ripple: 'XRP/USD',
  polkadot: 'DOT/USD',
  avalanche: 'AVAX/USD',
  chainlink: 'LINK/USD',
  polygon: 'MATIC/USD',
  litecoin: 'LTC/USD',
  cosmos: 'ATOM/USD',
  uniswap: 'UNI/USD',
  stellar: 'XLM/USD',
  near: 'NEAR/USD',
  algorand: 'ALGO/USD',
  vechain: 'VET/USD',
  filecoin: 'FIL/USD',
  decentraland: 'MANA/USD',
  axie: 'AXS/USD',
  'the sandbox': 'SAND/USD',
  enjincoin: 'ENJ/USD',
  holotoken: 'HOT/USD',
  fantom: 'FTM/USD',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids');
  const days = parseInt(searchParams.get('days') || '1', 10);

  if (!ids) {
    return NextResponse.json({ error: 'Missing ids parameter' }, { status: 400 });
  }

  // Kraken interval: 1=1m, 5=5m, 15=15m, 60=1h, 240=4h, 1440=1d
  const interval = 15;
  const limit = Math.min(days * 24 * (60 / interval), 720);

  const coinList = ids.split(',').map((id) => id.trim());

  try {
    const results: Record<string, PricePoint[]> = {};

    await Promise.all(
      coinList.map(async (id) => {
        const pair = ID_TO_KRAKEN[id];
        if (!pair) return;

        try {
          const response = await fetch(
            `https://api.kraken.com/0/public/OHLC?pair=${encodeURIComponent(pair)}&interval=${interval}`,
            {
              headers: { Accept: 'application/json' },
              next: { revalidate: 60 },
            }
          );

          if (response.ok) {
            const data = await response.json();
            const pairKey = Object.keys(data.result || {}).find(k => k !== 'last');
            const pairData = pairKey ? data.result[pairKey] : null;
            if (pairData && Array.isArray(pairData)) {
              const sliced = pairData.slice(-limit);
              results[id] = sliced.map((kline: [number, string, string, string, string, string, string, number]) => ({
                time: kline[0] * 1000,
                price: parseFloat(kline[4]),
              }));
            }
          }
        } catch {
          // Skip failed coins
        }
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error('[api/crypto/history] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
