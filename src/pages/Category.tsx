import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchSupabaseProducts, type SupabaseProductListItem } from "@/lib/supabaseProducts";
import { SupabaseProductCard } from "@/components/SupabaseProductCard";
import { Loader2 } from "lucide-react";

const categoryNames: Record<string, string> = {
  "street-wear": "Street Wear",
  "casual": "Casual",
  "cyber-wear": "Cyber Wear",
  "old-money": "Old Money",
};

const Category = () => {
  const { slug } = useParams<{ slug: string }>();
  const [localProducts, setLocalProducts] = useState<SupabaseProductListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryName = categoryNames[slug || ""] || slug || "";

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchSupabaseProducts(slug, 50)
      .catch((e) => { console.error(e); return [] as SupabaseProductListItem[]; })
      .then((local) => setLocalProducts(local))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl tracking-wider mb-8 md:mb-10">{categoryName.toUpperCase()}</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : localProducts.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-sm">
            <p className="font-body text-lg text-muted-foreground">No hay productos en esta categoría.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {localProducts.map((p) => (
              <SupabaseProductCard key={`local-${p.id}`} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Category;
