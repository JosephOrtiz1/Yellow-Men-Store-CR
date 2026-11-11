import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { searchProducts, type ProductSearchResult } from "@/lib/productSearch";
import { formatColones } from "@/lib/supabaseProducts";
import { styleName } from "@/lib/catalog";

const RESULT_LIMIT = 60;
const DEBOUNCE_MS = 250;

const ResultSkeleton = () => (
  <div className="border border-border rounded-sm overflow-hidden bg-card" aria-hidden="true">
    <Skeleton className="aspect-square w-full rounded-none" />
    <div className="p-3 space-y-2">
      <Skeleton className="h-2 w-16" />
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-3 w-12" />
    </div>
  </div>
);

const SearchPage = () => {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [results, setResults] = useState<ProductSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const trimmed = query.trim();
  const debounced = useDebouncedValue(trimmed, DEBOUNCE_MS);

  // Results follow the typed text, so the person sees answers while writing.
  useEffect(() => {
    if (!debounced) {
      setResults([]);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    searchProducts(debounced, RESULT_LIMIT).then((rows) => {
      if (!active) return;
      setResults(rows);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [debounced]);

  // Keep the address bar shareable without adding a history entry per keystroke.
  useEffect(() => {
    const current = params.get("q") || "";
    if (debounced !== current) {
      setParams(debounced ? { q: debounced } : {}, { replace: true });
    }
  }, [debounced, params, setParams]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setParams(trimmed ? { q: trimmed } : {});
  };

  return (
    <div className="min-h-screen pt-6 md:pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-heading text-3xl md:text-4xl tracking-wider mb-6">BÚSQUEDA</h1>

        <form onSubmit={submit} className="relative max-w-xl mb-8">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o ID..."
            aria-label="Buscar productos"
            className="pl-9 font-body bg-background"
          />
        </form>

        {loading ? (
          <>
            <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Buscando...
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ResultSkeleton key={i} />
              ))}
            </div>
          </>
        ) : !trimmed ? (
          <p className="text-muted-foreground font-body">Escribe algo para buscar.</p>
        ) : results.length === 0 ? (
          <p className="text-muted-foreground font-body">Sin resultados para "{trimmed}".</p>
        ) : (
          <>
            <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-3">
              {results.length} {results.length === 1 ? "producto" : "productos"} para "{trimmed}"
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.map((p) => (
                <Link
                  key={p.id}
                  to={p.handle ? `/product/${p.handle}` : "#"}
                  className="group border border-border rounded-sm overflow-hidden bg-card hover:border-primary transition-colors"
                >
                  <div className="aspect-square bg-secondary overflow-hidden">
                    {p.product_colors?.[0]?.image_url ? (
                      <img
                        src={p.product_colors[0].image_url}
                        alt={p.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground font-body text-xs">
                        Sin imagen
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] text-muted-foreground uppercase font-body tracking-wide">
                      {styleName(p.category)}
                    </p>
                    <h2 className="font-body font-semibold text-sm truncate">{p.title}</h2>
                    <p className="text-primary font-body font-bold text-sm mt-1">
                      {formatColones(p.price_colones)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
