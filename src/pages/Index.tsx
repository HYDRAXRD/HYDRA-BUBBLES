import { useState, useMemo } from "react";
import { useRadixPrices, RadixToken, TimeFilter } from "@/hooks/useRadixPrices";
import Header from "@/components/Header";
import BubbleCanvas from "@/components/BubbleCanvas";
import TokenModal from "@/components/TokenModal";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { data: tokens, isLoading, error } = useRadixPrices();
  const [filter, setFilter] = useState<TimeFilter>("24h");
  const [search, setSearch] = useState("");
  const [selectedToken, setSelectedToken] = useState<RadixToken | null>(null);

  const filtered = useMemo(() => {
    if (!tokens) return [];
    if (!search.trim()) return tokens;
    const q = search.toLowerCase();
    return tokens.filter(
      (t) => t.symbol?.toLowerCase().includes(q) || t.name?.toLowerCase().includes(q)
    );
  }, [tokens, search]);

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
        onFilterChange={setFilter}
        search={search}
        onSearchChange={setSearch}
        tokenCount={filtered.length}
      />
      <BubbleCanvas tokens={filtered} filter={filter} onSelectToken={setSelectedToken} />
      {selectedToken && (
        <TokenModal token={selectedToken} filter={filter} onClose={() => setSelectedToken(null)} />
      )}
    </div>
  );
};

export default Index;
