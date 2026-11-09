import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { Skeleton } from "./ui/skeleton";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { searchProducts, type ProductSearchResult } from "@/lib/productSearch";
import { formatColones } from "@/lib/supabaseProducts";
import { styleName } from "@/lib/catalog";

const SUGGESTION_LIMIT = 6;
const DEBOUNCE_MS = 250;

const Highlight = ({ text, query }: { text: string; query: string }) => {
  const start = text.toLowerCase().indexOf(query.toLowerCase());
  if (!query || start < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, start)}
      <span className="text-primary font-semibold">{text.slice(start, start + query.length)}</span>
      {text.slice(start + query.length)}
    </>
  );
};

const SuggestionSkeleton = () => (
  <li className="flex items-center gap-3 px-3 py-2" aria-hidden="true">
    <Skeleton className="w-10 h-10 rounded-sm flex-shrink-0" />
    <div className="flex-1 space-y-1.5">
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-2 w-1/3" />
    </div>
    <Skeleton className="h-3 w-10 flex-shrink-0" />
  </li>
);

interface LiveSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  /** Which edge the suggestions panel lines up with. */
  align?: "left" | "right";
  limit?: number;
}

/**
 * Search field that shows matching products while the person types.
 * While the request is in flight (slow connection) three skeleton rows are shown
 * instead of an empty box, so the panel never looks broken.
 */
export const LiveSearch = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Buscar productos...",
  className,
  inputClassName,
  align = "left",
  limit = SUGGESTION_LIMIT,
}: LiveSearchProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [results, setResults] = useState<ProductSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const trimmed = value.trim();
  const debounced = useDebouncedValue(trimmed, DEBOUNCE_MS);

  useEffect(() => {
    if (!debounced) {
      setResults([]);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    searchProducts(debounced, limit).then((rows) => {
      if (!active) return;
      setResults(rows);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [debounced, limit]);

  // A new page always starts with the panel closed.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const showPanel = open && trimmed.length > 0;

  return (
    <div ref={wrapperRef} className={`relative ${className ?? ""}`}>
      <form onSubmit={onSubmit} role="search">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
        <Input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder={placeholder}
          aria-label="Buscar productos"
          aria-expanded={showPanel}
          aria-controls="search-suggestions"
          className={`pl-9 font-body bg-background border-border ${inputClassName ?? ""}`}
        />
      </form>

      {showPanel && (
        <div
          id="search-suggestions"
          className={`absolute top-full mt-2 w-72 max-w-[85vw] ${
            align === "right" ? "right-0" : "left-0"
          } z-50 rounded-md border border-border bg-secondary shadow-[0_8px_32px_rgba(0,0,0,0.45)] overflow-hidden`}
        >
          {loading ? (
            <ul className="divide-y divide-border" aria-label="Buscando productos">
              <SuggestionSkeleton />
              <SuggestionSkeleton />
              <SuggestionSkeleton />
            </ul>
          ) : results.length === 0 ? (
            <p className="px-3 py-4 text-xs font-body text-muted-foreground">
              Sin resultados para "{trimmed}".
            </p>
          ) : (
            <ul id="search-suggestions" role="listbox" aria-label="Sugerencias de productos" className="max-h-80 overflow-y-auto divide-y divide-border">
              {results.map((product) => (
                <li key={product.id} role="option" aria-selected="false">
                  <Link
                    to={product.handle ? `/product/${product.handle}` : "/search"}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-primary/10 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-sm bg-background overflow-hidden flex-shrink-0">
                      {product.product_colors?.[0]?.image_url ? (
                        <img
                          src={product.product_colors[0].image_url}
                          alt=""
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-body text-foreground truncate">
                        <Highlight text={product.title} query={trimmed} />
                      </p>
                      <p className="text-[10px] font-body uppercase tracking-wide text-muted-foreground truncate">
                        {styleName(product.category)}
                      </p>
                    </div>
                    <span className="text-xs font-body font-bold text-primary flex-shrink-0">
                      {formatColones(product.price_colones)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-border">
            <Link
              to={`/search?q=${encodeURIComponent(trimmed)}`}
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-[11px] font-body uppercase tracking-wider text-primary hover:bg-primary/10 transition-colors"
            >
              Ver todos los resultados
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
