import { Search } from "lucide-react";
import { TimeFilter } from "@/hooks/useRadixPrices";
import hydraLogo from "@/assets/hydra-logo.png";

interface HeaderProps {
  filter: TimeFilter;
  onFilterChange: (f: TimeFilter) => void;
  search: string;
  onSearchChange: (s: string) => void;
  tokenCount: number;
}

const filters: { label: string; value: TimeFilter }[] = [
  { label: "24H", value: "24h" },
  { label: "7D", value: "7d" },
];

export default function Header({ filter, onFilterChange, search, onSearchChange, tokenCount }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-surface-strong">
      <div className="flex items-center justify-between px-4 md:px-6 h-14">
        <div className="flex items-center gap-3">
          <img src={hydraLogo} alt="Hydra Bubbles" className="w-8 h-8 rounded-full" />
          <h1 className="text-lg md:text-xl font-bold text-foreground tracking-tight">
            HYDRA <span className="text-gradient-primary">BUBBLES</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => onFilterChange(f.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                filter === f.value
                  ? "bg-primary text-primary-foreground glow-primary"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search token..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-md bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-44"
            />
          </div>
          <span className="text-xs text-muted-foreground font-mono">{tokenCount} tokens</span>
        </div>
      </div>
    </header>
  );
}
