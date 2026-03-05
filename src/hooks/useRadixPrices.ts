import { useQuery } from "@tanstack/react-query";

export interface RadixToken {
  address: string;
  symbol: string;
  name: string;
  description?: string;
  iconUrl?: string;
  icon_url?: string;
  infoUrl?: string;
  divisibility?: number;
  tokenPriceXRD: number;
  tokenPriceUSD: number;
  diff24H: number;
  diff24HUSD: number;
  diff7Days: number;
  diff7DaysUSD: number;
}

export type TimeFilter = "24h" | "7d";

const API_URL = "https://api.astrolescent.com/partner/hydraswap/prices";

async function fetchPrices(): Promise<RadixToken[]> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch prices");
  const data = await res.json();
  
  const all = (Object.values(data) as any[])
    .filter((t) => {
      // Must have symbol, price, and a valid icon URL
      if (!t.symbol || t.tokenPriceUSD <= 0) return false;
      const icon = t.iconUrl || t.icon_url || "";
      if (!icon || icon.trim() === "") return false;
      // Only Radix DLT tokens (resource_rdx addresses)
      if (t.address && !t.address.startsWith("resource_rdx")) return false;
      return true;
    })
    .map((t) => ({
      ...t,
      iconUrl: t.iconUrl || t.icon_url || "",
    })) as RadixToken[];

  // Sort by USD price as proxy for liquidity, take top 100
  all.sort((a, b) => b.tokenPriceUSD - a.tokenPriceUSD);
  return all.slice(0, 100);
}

export function getChange(token: RadixToken, filter: TimeFilter): number {
  switch (filter) {
    case "24h": return token.diff24HUSD * 100;
    case "7d": return token.diff7DaysUSD * 100;
  }
}

export function useRadixPrices() {
  return useQuery({
    queryKey: ["radix-prices"],
    queryFn: fetchPrices,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}
