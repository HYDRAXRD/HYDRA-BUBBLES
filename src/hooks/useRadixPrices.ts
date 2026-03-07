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
  volume24hUSD?: number;
  volume7dUSD?: number;
}
export type TimeFilter = "24h" | "7d";
export type PriceUnit = "USD" | "XRD";
export type BubbleMode = "price" | "volume";
export type VolumeFilter = "vol24h" | "vol7d";
const API_URL = "https://api.astrolescent.com/partner/hydraswap/prices";
// Lista de símbolos explicitamente bloqueados
const BLOCKED_SYMBOLS = new Set(["RANTS", "RUNES", "PYUSD", "MCM"]);
// Símbolos que começam com X mas devem ser permitidos
const X_SYMBOL_WHITELIST = new Set(["XRD"]);
// Lista de prioridade manual (ordem do topo para baixo)
const PRIORITY_SYMBOLS = [
  "XRD", "HYDR", "REDDICKS", "ASTRL", "DFP2", "HWBTC", "HETH", "ILIS", "WEFT", "EARLY", "OCI", 
  "WOWO", "FOTON", "HUG", "DELIVER", "HIT", "CASSIE", "DAN", "BOB", "BLUEBALLS", "MOX", 
  "EDG", "PHNX", "DUCKK", "RWA", "HNY", "DOUBT", "GREAT", "RBX", "RWT", "BOSS", "DINO"
];
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
      // (exceto tokens na whitelist, como XRD)
      if (sym.startsWith("X") && !X_SYMBOL_WHITELIST.has(sym)) return false;
      
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
      // Estimate volume using price * |change| as proxy if not provided by API
      volume24hUSD: t.volume24hUSD ?? (t.tokenPriceUSD * Math.abs(t.diff24HUSD || 0) * 1000),
      volume7dUSD: t.volume7dUSD ?? (t.tokenPriceUSD * Math.abs(t.diff7DaysUSD || 0) * 1000),
    })) as RadixToken[];
  // Sort by USD price descending (as liquidity proxy)
  all.sort((a, b) => b.tokenPriceUSD - a.tokenPriceUSD);
  // Implementação da lista de prioridade manual
  const priorityList = [...PRIORITY_SYMBOLS].reverse();
  for (const sym of priorityList) {
    const idx = all.findIndex((t) => t.symbol?.toUpperCase() === sym);
    if (idx !== -1) {
      const [token] = all.splice(idx, 1);
      all.unshift(token);
    }
  }
  return all;
}
export function getChange(token: RadixToken, filter: TimeFilter, unit: PriceUnit = "USD"): number {
  if (unit === "XRD") {
    switch (filter) {
      case "24h": return (token.diff24H || 0) * 100;
      case "7d": return (token.diff7Days || 0) * 100;
      default: return 0;
    }
  }
  switch (filter) {
    case "24h": return (token.diff24HUSD || 0) * 100;
    case "7d": return (token.diff7DaysUSD || 0) * 100;
    default: return 0;
  }
}
export function getVolume(token: RadixToken, volumeFilter: VolumeFilter): number {
  switch (volumeFilter) {
    case "vol24h": return token.volume24hUSD ?? 0;
    case "vol7d": return token.volume7dUSD ?? 0;
    default: return 0;
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
