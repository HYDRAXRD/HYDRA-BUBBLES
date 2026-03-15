import { useState } from "react";
import { useRadixWallet } from "@/providers/RadixProvider";
import { useWalletBalances, WalletAsset } from "@/hooks/useWalletBalances";
import { RadixToken } from "@/hooks/useRadixPrices";
import { TrendingUp, TrendingDown, Wallet, ChevronDown, ChevronUp, X } from "lucide-react";

interface WalletPortfolioProps {
  tokens: RadixToken[];
  priceUnit?: "USD" | "XRD";
  filter?: "24h" | "7d";
}

function fmt(n: number, decimals = 2) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function AssetRow({ asset, priceUnit, filter }: { asset: WalletAsset; priceUnit: string; filter: string }) {
  const change = filter === "7d" ? asset.change7dUSD : asset.change24hUSD;
  const isUp = change >= 0;
  const displayValue =
    priceUnit === "XRD"
      ? `${fmt(asset.amount * asset.priceXRD, 4)} XRD`
      : `$${fmt(asset.valueUSD)}`;
  const displayPrice =
    priceUnit === "XRD"
      ? `${fmt(asset.priceXRD, 6)} XRD`
      : `$${fmt(asset.priceUSD, 6)}`;

  return (
    <li className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-muted/20 transition-colors">
      {asset.iconUrl ? (
        <img
          src={asset.iconUrl}
          alt={asset.symbol}
          className="w-7 h-7 rounded-full flex-shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      ) : (
        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-[8px] font-bold text-primary">{asset.symbol.slice(0, 2)}</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm leading-tight truncate">{asset.symbol}</p>
        <p className="text-xs text-muted-foreground truncate">
          {fmt(asset.amount, 4)} @ {displayPrice}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-medium">{displayValue}</p>
        <p
          className={`text-xs flex items-center justify-end gap-0.5 font-medium ${
            isUp ? "text-green-400" : "text-red-400"
          }`}
        >
          {isUp ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
          {Math.abs(change).toFixed(2)}%
        </p>
      </div>
    </li>
  );
}

export function WalletPortfolio({ tokens, priceUnit = "USD", filter = "24h" }: WalletPortfolioProps) {
  const { connected } = useRadixWallet();
  const { assets, loading } = useWalletBalances(tokens);
  const [expanded, setExpanded] = useState(true);
  const [visible, setVisible] = useState(true);

  if (!connected) return null;
  if (!visible) return null;

  const totalUSD = assets.reduce((s, a) => s + a.valueUSD, 0);
  const totalXRD = assets.reduce((s, a) => s + a.amount * a.priceXRD, 0);
  const totalDisplay =
    priceUnit === "XRD" ? `${fmt(totalXRD, 2)} XRD` : `$${fmt(totalUSD)}`;

  const overallChange = assets.length
    ? assets.reduce((acc, a) => {
        const w = a.valueUSD / (totalUSD || 1);
        const ch = filter === "7d" ? a.change7dUSD : a.change24hUSD;
        return acc + ch * w;
      }, 0)
    : 0;

  return (
    <div className="fixed right-4 top-20 w-72 z-50 rounded-xl overflow-hidden shadow-2xl border border-primary/20 glass-surface-strong">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 bg-primary/5">
        <div className="flex items-center gap-2">
          <Wallet size={14} className="text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">Minha Carteira</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1 rounded hover:bg-muted/40 transition-colors text-muted-foreground"
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          <button
            onClick={() => setVisible(false)}
            className="p-1 rounded hover:bg-muted/40 transition-colors text-muted-foreground"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Total */}
      <div className="px-4 py-2.5 border-b border-border/20 bg-muted/10">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">Portfolio Total</p>
        <div className="flex items-end gap-2">
          <p className="text-xl font-bold tracking-tight text-foreground">{totalDisplay}</p>
          {assets.length > 0 && (
            <p
              className={`text-xs font-semibold mb-0.5 flex items-center gap-0.5 ${
                overallChange >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {overallChange >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {Math.abs(overallChange).toFixed(2)}%
            </p>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">{assets.length} ativo{assets.length !== 1 ? "s" : ""} encontrado{assets.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Asset list */}
      {expanded && (
        loading ? (
          <div className="px-4 py-6 text-center">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Carregando ativos...</p>
          </div>
        ) : assets.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="text-xs text-muted-foreground">Nenhum token Radix encontrado nesta carteira.</p>
          </div>
        ) : (
          <ul className="max-h-72 overflow-y-auto divide-y divide-border/20">
            {assets.map((asset) => (
              <AssetRow
                key={asset.resourceAddress}
                asset={asset}
                priceUnit={priceUnit}
                filter={filter}
              />
            ))}
          </ul>
        )
      )}
    </div>
  );
}
