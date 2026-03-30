import { NextResponse } from 'next/server';

// Map coin IDs to Coinbase currency codes
const ID_TO_COINBASE: Record<string, string> = {
  // Existing
  bitcoin: 'BTC',
  ethereum: 'ETH',
  solana: 'SOL',
  dogecoin: 'DOGE',
  cardano: 'ADA',
  ripple: 'XRP',
  polkadot: 'DOT',
  avalanche: 'AVAX',
  chainlink: 'LINK',
  polygon: 'MATIC',
  // Additional popular coins
  'shiba-inu': 'SHIB',
  shib: 'SHIB',
  litecoin: 'LTC',
  ltc: 'LTC',
  cosmos: 'ATOM',
  atom: 'ATOM',
  uniswap: 'UNI',
  uni: 'UNI',
  stellar: 'XLM',
  xlm: 'XLM',
  near: 'NEAR',
  'near protocol': 'NEAR',
  algorand: 'ALGO',
  algo: 'ALGO',
  vechain: 'VET',
  vet: 'VET',
  filecoin: 'FIL',
  fil: 'FIL',
  decentraland: 'MANA',
  mana: 'MANA',
  axie: 'AXS',
  axs: 'AXS',
  'the sandbox': 'SAND',
  sand: 'SAND',
  enjincoin: 'ENJ',
  enj: 'ENJ',
  holotoken: 'HOT',
  hot: 'HOT',
  fantom: 'FTM',
  ftm: 'FTM',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids');

  if (!ids) {
    return NextResponse.json({ error: 'Missing ids parameter' }, { status: 400 });
  }

  const coinList = ids.split(',').map((id) => id.trim());

  try {
    // Fetch prices from Coinbase for each coin
    const results: Record<string, { usd: number }> = {};

    await Promise.all(
      coinList.map(async (id) => {
        const symbol = ID_TO_COINBASE[id] || id.toUpperCase();
        try {
          const response = await fetch(
            `https://api.coinbase.com/v2/prices/${symbol}-USD/spot`,
            {
              headers: { Accept: 'application/json' },
              next: { revalidate: 10 },
            }
          );

          if (response.ok) {
            const data = await response.json();
            results[id] = { usd: parseFloat(data.data.amount) };
          }
        } catch {
          // Skip failed coins
        }
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error('[api/crypto/prices] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
}