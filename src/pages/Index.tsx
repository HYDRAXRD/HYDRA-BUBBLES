import { useState, useMemo } from "react";
import { useRadixPrices, RadixToken, TimeFilter, PriceUnit, BubbleMode, VolumeFilter, getChange, getVolume } from "@/hooks/useRadixPrices";
import Header from "@/components/Header";
import BubbleCanvas from "@/components/BubbleCanvas";
import TokenModal from "@/components/TokenModal";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
const PAGE_SIZE = 100;
const Index = () => {
  const { data: allTokens, isLoading, error } = useRadixPrices();
  const [filter, setFilter] = useState<TimeFilter>("24h");
  const [search, setSearch] = useState("");
  const [selectedToken, setSelectedToken] = useState<RadixToken | null>(null);
  const [priceUnit, setPriceUnit] = useState<PriceUnit>("USD");
  const [bubbleMode, setBubbleMode] = useState<BubbleMode>("price");
  const [volumeFilter, setVolumeFilter] = useState<VolumeFilter>("vol24h");
  const [page, setPage] = useState(0);
  // When filter changes, reset page
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
        (t) => t.symbol?.toLowerCase().includes(q) || t.name?.toLowerCase().includes(q)
      );
    }
    return tokens;
  }, [allTokens, search, filter]);
  // When in volume mode, sort tokens by volume descending so biggest bubbles = highest volume
  const sortedFiltered = useMemo(() => {
    if (bubbleMode !== "volume") return filtered;
    return [...filtered].sort((a, b) => getVolume(b, volumeFilter) - getVolume(a, volumeFilter));
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
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-mono">Loading Radix tokens...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive font-semibold">Failed to load token data</p>
          <p className="text-sm text-muted-foreground mt-1">Please try again later</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background overflow-hidden">
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
      <BubbleCanvas
        tokens={pageTokens}
        filter={filter}
        priceUnit={priceUnit}
        bubbleMode={bubbleMode}
        volumeFilter={volumeFilter}
        onSelectToken={setSelectedToken}
      />
      {totalPages > 1 && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-background/80 backdrop-blur border border-border rounded-full px-4 py-2 shadow-lg z-50"
        >
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="p-1 rounded-full hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-muted-foreground">
            {currentPage * PAGE_SIZE + 1}–{Math.min((currentPage + 1) * PAGE_SIZE, sortedFiltered.length)}
            {" "}/ {sortedFiltered.length} tokens
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="p-1 rounded-full hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
      {selectedToken && (
        <TokenModal token={selectedToken} filter={filter} onClose={() => setSelectedToken(null)} />
      )}
    </div>
  );
};
export default Index;
