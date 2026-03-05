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
  diff30Days?: number;
  diff30DaysUSD?: number;
}

export type TimeFilter = "24h" | "7d" | "30d";

const API_URL = "https://api.astrolescent.com/partner/hydraswap/prices";

async function fetchPrices(): Promise<RadixToken[]> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch prices");
  const data = await res.json();

  const all = (Object.values(data) as any[])
    .filter((t) => {
      if (!t.symbol || t.tokenPriceUSD <= 0) return false;

      // Only Radix DLT tokens (resource_rdx addresses)
      if (t.address && !t.address.startsWith("resource_rdx")) return false;

      // Remove tokens without image
      const icon = t.iconUrl || t.icon_url || "";
      if (!icon || icon.trim() === "") return false;

      const sym = (t.symbol || "").toUpperCase();
      const nm = (t.name || "").toUpperCase();

      // Bloqueio 1: qualquer token cujo NOME ou SIMBOLO contenha LSU
      if (sym.includes("LSU") || nm.includes("LSU")) return false;

      // Bloqueio 2: qualquer token cujo SIMBOLO comece com X
      if (sym.startsWith("X")) return false;

      return true;
    })
    .map((t) => ({
      ...t,
      iconUrl: t.iconUrl || t.icon_url || "",
      diff30Days: t.diff30Days ?? t.diff30DaysUSD ?? 0,
      diff30DaysUSD: t.diff30DaysUSD ?? t.diff30Days ?? 0,
    })) as RadixToken[];

  // Sort by USD price descending (as liquidity proxy)
  all.sort((a, b) => b.tokenPriceUSD - a.tokenPriceUSD);

  return all;
}

export function getChange(token: RadixToken, filter: TimeFilter): number {
  switch (filter) {
    case "24h": return token.diff24HUSD * 100;
    case "7d": return token.diff7DaysUSD * 100;
    case "30d": return (token.diff30DaysUSD ?? 0) * 100;
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
