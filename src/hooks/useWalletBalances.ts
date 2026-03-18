import { useEffect, useState } from "react";
import { useRadixWallet } from "@/providers/RadixProvider";
import { RadixToken } from "@/hooks/useRadixPrices";

const GATEWAY = "https://mainnet.radixdlt.com";

export interface WalletAsset {
  resourceAddress: string;
  symbol: string;
  name: string;
  iconUrl: string;
  amount: number;
  priceUSD: number;
  priceXRD: number;
  valueUSD: number;
  change24hUSD: number;
  change7dUSD: number;
}

async function fetchAccountFungibles(address: string): Promise<Record<string, number>> {
  const result: Record<string, number> = {};
  let cursor: string | null = null;

  do {
    const body: Record<string, unknown> = { account_address: address };
    if (cursor) body.cursor = cursor;

    const res = await fetch(`${GATEWAY}/state/account/page/fungibles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) break;

    const data = await res.json();
    const items: { resource_address: string; amount: string }[] = data?.items ?? [];

    for (const item of items) {
      const amt = parseFloat(item.amount ?? "0");
      if (amt > 0) {
        result[item.resource_address] = (result[item.resource_address] ?? 0) + amt;
      }
    }

    cursor = data?.next_cursor ?? null;
  } while (cursor);

  return result;
}

export function useWalletBalances(tokens: RadixToken[]) {
  const { accounts, connected } = useRadixWallet();
  const [assets, setAssets] = useState<WalletAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!connected || accounts.length === 0 || tokens.length === 0) {
      setAssets([]);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const balances = await fetchAccountFungibles(accounts[0].address);

        const walletAssets: WalletAsset[] = [];

        for (const token of tokens) {
          const amount = balances[token.address] ?? 0;
          if (amount > 0) {
            const valueUSD = amount * token.priceUSD;
            walletAssets.push({
              resourceAddress: token.address,
              symbol: token.symbol,
              name: token.name,
              iconUrl: token.iconUrl,
              amount,
              priceUSD: token.priceUSD,
              priceXRD: token.priceXRD,
              valueUSD,
              change24hUSD: token.change24hUSD,
              change7dUSD: token.change7dUSD,
            });
          }
        }

        // Sort by value (highest first)
        walletAssets.sort((a, b) => b.valueUSD - a.valueUSD);

        if (!cancelled) {
          setAssets(walletAssets);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to fetch balances");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [connected, accounts, tokens]);

  return { assets, loading, error };
}
