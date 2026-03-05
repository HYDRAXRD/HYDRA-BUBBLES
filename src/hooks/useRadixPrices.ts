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

export type TimeFilter = "24h" | "7d";

const API_URL = "https://api.astrolescent.com/partner/hydraswap/prices";

// Lista de símbolos explicitamente bloqueados
const BLOCKED_SYMBOLS = new Set(["RANTS", "RUNES", "PYUSD", "MCM"]);

async function fetchPrices(): Promise<RadixToken[]> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch prices");
  const data = await res.json();

  const seenAddresses = new Set<string>();
  const seenSymbols = new Set<string>();

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

      // Bloqueio 1: lista explícita de tokens banidos
      if (BLOCKED_SYMBOLS.has(sym)) return false;

      // Bloqueio 2: qualquer token que contenha SASTRL no nome ou símbolo
      if (sym.includes("SASTRL") || nm.includes("SASTRL")) return false;

      // Bloqueio 3: qualquer token cujo nome ou símbolo contenha LSU
      if (sym.includes("LSU") || nm.includes("LSU")) return false;

      // Bloqueio 4: qualquer token cujo símbolo comece com X
      if (sym.startsWith("X")) return false;

      // Bloqueio 5: remover duplicados por endereço
      if (t.address && seenAddresses.has(t.address)) return false;
      if (t.address) seenAddresses.add(t.address);

      // Bloqueio 6: remover duplicados por símbolo (mantém o primeiro/maior)
      if (seenSymbols.has(sym)) return false;
      seenSymbols.add(sym);

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

  // HYDR sempre na primeira posição
  const hydrIndex = all.findIndex((t) => t.symbol?.toUpperCase() === "HYDR");
  if (hydrIndex > 0) {
    const [hydr] = all.splice(hydrIndex, 1);
    all.unshift(hydr);
  }

  return all;
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
