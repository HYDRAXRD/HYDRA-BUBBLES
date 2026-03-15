import { Search } from "lucide-react";
import { TimeFilter, PriceUnit, BubbleMode, VolumeFilter } from "@/hooks/useRadixPrices";
import hydraLogo from "@/assets/hydra-logo.png";

// Tell TypeScript about the Radix web component
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "radix-connect-button": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

interface HeaderProps {
  filter: TimeFilter;
  onFilterChange: (f: TimeFilter) => void;
  search: string;
  onSearchChange: (s: string) => void;
  tokenCount: number;
  priceUnit: PriceUnit;
  onPriceUnitChange: (u: PriceUnit) => void;
  bubbleMode: BubbleMode;
  onBubbleModeChange: (mode: BubbleMode) => void;
  volumeFilter: VolumeFilter;
  onVolumeFilterChange: (vf: VolumeFilter) => void;
}
const filters: { label: string; value: TimeFilter }[] = [
  { label: "24H", value: "24h" },
  { label: "7D", value: "7d" },
];
export default function Header({
  filter,
  onFilterChange,
  search,
  onSearchChange,
  tokenCount,
  priceUnit,
  onPriceUnitChange,
  bubbleMode,
  onBubbleModeChange,
  volumeFilter,
  onVolumeFilterChange,
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-surface-strong border-b border-primary/20">
      <div className="flex items-center justify-between px-4 md:px-6 h-14">
        <div className="flex items-center gap-2">
          <img src={hydraLogo} alt="Hydra Bubbles" className="w-5 h-5 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
          <h1 className="text-sm md:text-base font-bold text-foreground tracking-tight">
            HYDRA <span className="text-gradient-primary">BUBBLES</span>
          </h1>
        </div>
        <div className="hidden md:flex flex-1 max-w-sm mx-4">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search tokens..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-1.5 rounded-full bg-secondary/50 border border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all text-sm"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* VOL toggle */}
          <div className="flex flex-col items-center">
            <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5 leading-none">VOL</span>
            <div className="flex items-center rounded-md bg-secondary/50 border border-border/50 overflow-hidden">
              {(["vol24h", "vol7d"] as VolumeFilter[]).map((vf) => (
                <button
                  key={vf}
                  onClick={() => {
                    onVolumeFilterChange(vf);
                    if (bubbleMode !== "volume") onBubbleModeChange("volume");
                    else if (volumeFilter === vf) onBubbleModeChange("price");
                  }}
                  title={vf === "vol24h" ? "Sort bubbles by 24h volume" : "Sort bubbles by 7-day volume"}
                  className={`px-2.5 py-1.5 text-[10px] font-bold tracking-wider transition-all ${
                    bubbleMode === "volume" && volumeFilter === vf
                      ? "bg-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {vf === "vol24h" ? "24H" : "7D"}
                </button>
              ))}
            </div>
          </div>
          {/* XRD/USD toggle */}
          <div className="flex flex-col items-center">
            <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5 leading-none">Price</span>
            <div className="flex items-center rounded-md bg-secondary/50 border border-border/50 overflow-hidden">
              {(["USD", "XRD"] as PriceUnit[]).map((u) => (
                <button
                  key={u}
                  onClick={() => onPriceUnitChange(u)}
                  className={`px-2.5 py-1.5 text-[10px] font-bold tracking-wider transition-all ${
                    priceUnit === u
                      ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          {/* 24H / 7D filter buttons */}
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => onFilterChange(f.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                filter === f.value
                  ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
          <div className="hidden sm:block ml-2 px-3 py-1.5 rounded-md bg-secondary/30 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
            {tokenCount} Tokens
          </div>
          {/* Radix Wallet Connect Button */}
          <radix-connect-button />
        </div>
      </div>
      {/* Mobile search */}
      <div className="md:hidden px-4 pb-2 border-t border-border/10 mt-1 pt-2">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tokens..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 rounded-full bg-secondary/50 border border-border/50 focus:border-primary/50 outline-none text-sm"
          />
        </div>
      </div>
    </header>
  );
}
