import { RadixToken, getChange, TimeFilter, PriceUnit } from "@/hooks/useRadixPrices";
import { X, ExternalLink, TrendingUp, TrendingDown, ShoppingCart } from "lucide-react";
interface TokenModalProps {
  token: RadixToken;
  filter: TimeFilter;
  priceUnit?: PriceUnit;
  onClose: () => void;
}
const SWAP_URL = "https://hydraxrd.com/swap";
export default function TokenModal({ token, filter, onClose }: TokenModalProps) {
  const change24h = token.diff24HUSD * 100;
  const change7d = token.diff7DaysUSD * 100;
  const formatPrice = (p: number) =>
    p < 0.01 ? `$${p.toFixed(6)}` : p < 1 ? `$${p.toFixed(4)}` : `$${p.toFixed(2)}`;
  const changeColor = (v: number) =>
    v > 0 ? "text-success" : v < 0 ? "text-destructive" : "text-muted-foreground";
  const ChangeIcon = ({ value }: { value: number }) =>
    value >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  const formatPct = (v: number) => {
    const rounded = Math.round(v);
    return `${rounded > 0 ? "+" : ""}${rounded}%`;
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <div
        className="relative glass-surface-strong rounded-xl p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 mb-5">
          {token.iconUrl ? (
            <img src={token.iconUrl} alt={token.symbol} className="w-12 h-12 rounded-full bg-secondary" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-foreground font-bold">
              {token.symbol?.slice(0, 2)}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-foreground">{token.symbol}</h2>
            <p className="text-sm text-muted-foreground">{token.name}</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
            <span className="text-sm text-muted-foreground">Price (USD)</span>
            <span className="font-mono font-semibold text-foreground">{formatPrice(token.tokenPriceUSD)}</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
            <span className="text-sm text-muted-foreground">Price (XRD)</span>
            <span className="font-mono font-semibold text-foreground">{token.tokenPriceXRD.toFixed(4)}</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
            <span className="text-sm text-muted-foreground">24H Change</span>
            <span className={`flex items-center gap-1 font-mono font-semibold ${changeColor(change24h)}`}>
              <ChangeIcon value={change24h} />
              {formatPct(change24h)}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
            <span className="text-sm text-muted-foreground">7D Change</span>
            <span className={`flex items-center gap-1 font-mono font-semibold ${changeColor(change7d)}`}>
              <ChangeIcon value={change7d} />
              {formatPct(change7d)}
            </span>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          {token.infoUrl && (
            <a
              href={token.infoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-secondary text-foreground font-semibold text-sm hover:opacity-90 transition-opacity border border-border"
            >
              Visit Project <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <a
            href={SWAP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity ${
              token.infoUrl ? "flex-1" : "w-full"
            }`}
          >
            Buy Now <ShoppingCart className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
