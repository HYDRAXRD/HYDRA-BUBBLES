import { useState, useMemo } from "react";
import {
  useRadixPrices,
  RadixToken,
  TimeFilter,
  PriceUnit,
  BubbleMode,
  VolumeFilter,
  getChange,
  getVolume,
} from "@/hooks/useRadixPrices";
import Header from "@/components/Header";
import BubbleCanvas from "@/components/BubbleCanvas";
import TokenModal from "@/components/TokenModal";
import { WalletPortfolio } from "@/components/WalletPortfolio";
import WalletAssets from "@/components/WalletAssets";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 100;

const SOCIAL_LINKS = [
  { href: "https://x.com/HYDRAXRD", label: "X", icon: (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  )},
  { href: "https://t.me/hydraxrd", label: "Telegram", icon: (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
  )},
  { href: "https://youtube.com/@hydraxrd", label: "YouTube", icon: (
    <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current stroke-[1.6]" fill="none">
      <polygon points="10 9 10 15 15 12 10 9" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21,15.8a3,3,0,0,1-2.76,3c-1.49.11-3.56.21-6.24.21s-4.75-.1-6.24-.21A3,3,0,0,1,3,15.8V8.2a3,3,0,0,1,2.76-3C7.25,5.1,9.32,5,12,5s4.75.1,6.24.21A3,3,0,0,1,21,8.2Z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )},
  { href: "https://instagram.com/hydraxrd", label: "Instagram", icon: (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
      <path d="M17.34,5.46h0a1.2,1.2,0,1,0,1.2,1.2A1.2,1.2,0,0,0,17.34,5.46Zm4.6,2.42a7.59,7.59,0,0,0-.46-2.43,4.94,4.94,0,0,0-1.16-1.77,4.7,4.7,0,0,0-1.77-1.15,7.3,7.3,0,0,0-2.43-.47C15.06,2,14.72,2,12,2s-3.06,0-4.12.06a7.3,7.3,0,0,0-2.43.47A4.78,4.78,0,0,0,3.68,3.68,4.7,4.7,0,0,0,2.53,5.45a7.3,7.3,0,0,0-.47,2.43C2,8.94,2,9.28,2,12s0,3.06.06,4.12a7.3,7.3,0,0,0,.47,2.43,4.7,4.7,0,0,0,1.15,1.77,4.78,4.78,0,0,0,1.77,1.15,7.3,7.3,0,0,0,2.43.47C8.94,22,9.28,22,12,22s3.06,0,4.12-.06a7.3,7.3,0,0,0,2.43-.47,4.7,4.7,0,0,0,1.77-1.15,4.85,4.85,0,0,0,1.16-1.77,7.59,7.59,0,0,0,.46-2.43c0-1.06.06-1.4.06-4.12S22,8.94,21.94,7.88ZM20.14,16a5.61,5.61,0,0,1-.34,1.86,3.06,3.06,0,0,1-.75,1.15,3.19,3.19,0,0,1-1.15.75,5.61,5.61,0,0,1-1.86.34c-1,.05-1.37.06-4,.06s-3,0-4-.06A5.73,5.73,0,0,1,6.1,19.8,3.27,3.27,0,0,1,5,19.05a3,3,0,0,1-.74-1.15A5.54,5.54,0,0,1,3.86,16c0-1-.06-1.37-.06-4s0-3,.06-4A5.54,5.54,0,0,1,4.21,6.1,3,3,0,0,1,5,5,3.14,3.14,0,0,1,6.1,4.2,5.73,5.73,0,0,1,8,3.86c1,0,1.37-.06,4-.06s3,0,4,.06a5.61,5.61,0,0,1,1.86.34A3.06,3.06,0,0,1,19.05,5,3.06,3.06,0,0,1,19.8,6.1,5.61,5.61,0,0,1,20.14,8c.05,1,.06,1.37.06,4S20.19,15,20.14,16ZM12,6.87A5.13,5.13,0,1,0,17.14,12,5.12,5.12,0,0,0,12,6.87Zm0,8.46A3.33,3.33,0,1,1,15.33,12,3.33,3.33,0,0,1,12,15.33Z"/>
    </svg>
  )},
  { href: "https://tiktok.com/@hydraxrd", label: "TikTok", icon: (
    <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current stroke-[1.2]" fill="none">
      <path d="M21 8V16C21 18.7614 18.7614 21 16 21H8C5.23858 21 3 18.7614 3 16V8C3 5.23858 5.23858 3 8 3H16C18.7614 3 21 5.23858 21 8Z" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 12C8.34315 12 7 13.3431 7 15C7 16.6569 8.34315 18 10 18C11.6569 18 13 16.6569 13 15V6C13.3333 7 14.6 9 17 9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )},
  { href: "https://www.pinterest.com/hydraxrd", label: "Pinterest", icon: (
    <svg viewBox="-2 -2 24 24" className="w-4 h-4 fill-current" preserveAspectRatio="xMinYMin">
      <path d="M9.355 11.614C9.1 12.99 8.79 14.31 7.866 15c-.284-2.08.419-3.644.745-5.303-.556-.964.067-2.906 1.24-2.427 1.445.588-1.25 3.586.56 3.96 1.888.392 2.66-3.374 1.488-4.6-1.692-1.768-4.927-.04-4.529 2.492.097.62.718.807.248 1.661-1.083-.247-1.406-1.127-1.365-2.3.067-1.92 1.675-3.263 3.289-3.45 2.04-.235 3.954.772 4.219 2.748.297 2.23-.921 4.646-3.103 4.472-.59-.047-.84-.35-1.303-.64z"/>
      <path d="M4 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4zm0-2h12a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z"/>
    </svg>
  )},
  { href: "https://hydraxrd.com", label: "Website", icon: (
    <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current stroke-[1.5]" fill="none">
      <rect x="3" y="4" width="18" height="12" rx="1"/>
      <rect x="10" y="16" width="5" height="4.5"/>
      <line x1="8.5" y1="9.5" x2="10.5" y2="9.5"/>
      <line x1="4.5" y1="16.5" x2="14.5" y2="16.5"/>
    </svg>
  )},
  { href: "https://hydraxrd.com/bubbles", label: "Bubbles", icon: (
    <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current stroke-[1.4]" fill="none">
      <circle cx="16" cy="16" r="5"/>
      <path d="M16 13c.7 0 1.4.35 1.8.9"/>
      <circle cx="7" cy="7" r="3"/>
      <circle cx="4" cy="15" r="2.5"/>
      <line x1="13" y1="2" x2="13" y2="5"/>
      <line x1="18" y1="8" x2="15" y2="8"/>
      <line x1="16.5" y1="4" x2="14.5" y2="6"/>
    </svg>
  )},
];

const Index = () => {
  const { data: allTokens, isLoading, error } = useRadixPrices();
  const [filter, setFilter] = useState<TimeFilter>("24h");
  const [search, setSearch] = useState("");
  const [selectedToken, setSelectedToken] = useState<RadixToken | null>(null);
  const [priceUnit, setPriceUnit] = useState<PriceUnit>("USD");
  const [bubbleMode, setBubbleMode] = useState<BubbleMode>("price");
  const [volumeFilter, setVolumeFilter] = useState<VolumeFilter>("vol24h");
  const [page, setPage] = useState(0);

  const handleFilterChange = (f: TimeFilter) => {
    setFilter(f);
    setPage(0);
  };

  const filtered = useMemo(() => {
    if (!allTokens) return [];
    let tokens = allTokens;
    if (search.trim()) {
      const q = search.toLowerCase();
      tokens = tokens.filter(
        (t) =>
          t.symbol?.toLowerCase().includes(q) ||
          t.name?.toLowerCase().includes(q)
      );
    }
    return tokens;
  }, [allTokens, search, filter]);

  const sortedFiltered = useMemo(() => {
    if (bubbleMode !== "volume") return filtered;
    return [...filtered].sort(
      (a, b) => getVolume(b, volumeFilter) - getVolume(a, volumeFilter)
    );
  }, [filtered, bubbleMode, volumeFilter]);

  const totalPages = Math.ceil(sortedFiltered.length / PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(0, totalPages - 1));

  const pageTokens = useMemo(() => {
    const start = currentPage * PAGE_SIZE;
    return sortedFiltered.slice(start, start + PAGE_SIZE);
  }, [sortedFiltered, currentPage]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-sm">Loading Radix tokens...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <p className="text-destructive font-medium">Failed to load token data</p>
          <p className="text-muted-foreground text-sm">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header
        filter={filter}
        onFilterChange={handleFilterChange}
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(0); }}
        tokenCount={sortedFiltered.length}
        priceUnit={priceUnit}
        onPriceUnitChange={setPriceUnit}
        bubbleMode={bubbleMode}
        onBubbleModeChange={setBubbleMode}
        volumeFilter={volumeFilter}
        onVolumeFilterChange={setVolumeFilter}
      />

      <div className="flex-1 relative mt-24 md:mt-14">
        <BubbleCanvas
          tokens={pageTokens}
          filter={filter}
          onTokenClick={setSelectedToken}
          priceUnit={priceUnit}
          bubbleMode={bubbleMode}
          volumeFilter={volumeFilter}
        />

        {totalPages > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-card/80 backdrop-blur-sm border border-border/50 rounded-full px-4 py-2 text-sm text-muted-foreground z-10">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="p-1 rounded-full hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <span>
              {currentPage * PAGE_SIZE + 1}–
              {Math.min((currentPage + 1) * PAGE_SIZE, sortedFiltered.length)}{" "}
              / {sortedFiltered.length} tokens
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="p-1 rounded-full hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {selectedToken && (
        <TokenModal
          token={selectedToken}
          filter={filter}
          priceUnit={priceUnit}
          onClose={() => setSelectedToken(null)}
        />
      )}

* Rodapé com redes sociais */}
            <WalletAssets />
      <div className="flex items-center justify-center gap-4 px-6 py-4 border-t border-border/30 bg-background/80 backdrop-blur-sm z-10">
        {SOCIAL_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            className="text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            {link.icon}
          </a>
        ))}
      </div>
    </div>
  );
};

export default Index;
