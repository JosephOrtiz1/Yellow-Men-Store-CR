import { styleName } from "@/lib/catalog";
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ProductResult {
  id: string;
  title: string;
  handle: string | null;
  price_colones: number;
  category: string;
  product_colors: { image_url: string }[];
}


const SearchPage = () => {
  const [params, setParams] = useSearchParams();
  const initialQ = params.get("q") || "";
  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<ProductResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = (params.get("q") || "").trim();
    setQuery(q);
    if (!q) {
      setResults([]);
      return;
    }
    setLoading(true);
    // Sanitize input: strip characters meaningful to PostgREST filter syntax
    const sanitized = q.replace(/[,()."'\\*]/g, "").slice(0, 100);
    let query = supabase
      .from("products")
      .select("id, title, handle, price_colones, category, product_colors(image_url)")
      .eq("is_active", true);
    if (isUuid(q)) {
      query = query.eq("id", q);
    } else {
      query = query.ilike("title", `%${sanitized}%`);
    }
    query
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setResults((data as unknown as ProductResult[]) || []);
        setLoading(false);
      });
  }, [params]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setParams({ q: query.trim() });
  };

  return (
    <div className="min-h-screen pt-6 md:pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-heading text-3xl md:text-4xl tracking-wider mb-6">BÚSQUEDA</h1>

        <form onSubmit={submit} className="relative max-w-xl mb-8">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o ID..."
            className="pl-9 font-body bg-background"
          />
        </form>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !initialQ ? (
          <p className="text-muted-foreground font-body">Escribe algo para buscar.</p>
        ) : results.length === 0 ? (
          <p className="text-muted-foreground font-body">Sin resultados para "{initialQ}".</p>
        ) : (
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
                  <h3 className="font-body font-semibold text-sm truncate">{p.title}</h3>
                  <p className="text-primary font-body font-bold text-sm mt-1">
                    ₡{Math.round(p.price_colones).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function isUuid(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

export default SearchPage;
