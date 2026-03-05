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
  
  return Object.values(data)
    .filter((t: any) => t.symbol && t.tokenPriceUSD > 0)
    .map((t: any) => ({
      ...t,
      iconUrl: t.iconUrl || t.icon_url || "",
    })) as RadixToken[];
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
