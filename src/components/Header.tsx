import { Search } from "lucide-react";
import { TimeFilter, PriceUnit } from "@/hooks/useRadixPrices";
import hydraLogo from "@/assets/hydra-logo.png";
interface HeaderProps {
  filter: TimeFilter;
  onFilterChange: (f: TimeFilter) => void;
  search: string;
  onSearchChange: (s: string) => void;
  tokenCount: number;
  priceUnit: PriceUnit;
  onPriceUnitChange: (u: PriceUnit) => void;
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
