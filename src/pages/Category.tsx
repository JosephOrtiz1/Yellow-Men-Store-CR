import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchSupabaseProducts, type SupabaseProductListItem } from "@/lib/supabaseProducts";
import { SupabaseProductCard } from "@/components/SupabaseProductCard";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { styleName, garmentName } from "@/lib/catalog";
import { STYLE_COVERS } from "@/components/HeroSlider";


const Category = ({ mode = "style" }: { mode?: "style" | "garment" }) => {
  const { slug } = useParams<{ slug: string }>();
  const [localProducts, setLocalProducts] = useState<SupabaseProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  // Bumping this re-runs the fetch, which shuffles the category again.
  const [shuffleKey, setShuffleKey] = useState(0);

  const categoryName = mode === "garment" ? garmentName(slug) : styleName(slug);

  useEffect(() => {
    if (!slug) return;
    let alive = true;
    setLoading(true);
    (mode === "garment"
      ? fetchSupabaseProducts(undefined, 50, { randomize: true, garmentType: slug })
      : fetchSupabaseProducts(slug, 50, { randomize: true }))
      .catch((e) => { console.error(e); return [] as SupabaseProductListItem[]; })
      .then((local) => { if (alive) setLocalProducts(local); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [slug, mode, shuffleKey]);

  const cover = mode === "style" && slug ? STYLE_COVERS[slug] : undefined;

  return (
    <div className="min-h-screen pt-6 md:pt-20">
      {cover && (
        <section key={slug} aria-label={`Portada ${categoryName}`} className="relative h-[42vh] min-h-[260px] overflow-hidden bg-background md:h-[480px]">
          {/* Desktop: blurred, dimmed copy fills the sides behind the full image */}
          <img
            src={cover}
            alt=""
            aria-hidden
            className="absolute inset-0 hidden h-full w-full scale-110 object-cover opacity-40 blur-2xl md:block animate-cover-reveal"
          />
          <div className="absolute inset-0 flex justify-center">
            <img
              src={cover}
              alt={`Estilo ${categoryName}`}
              className="h-full w-full object-cover object-top animate-cover-reveal md:w-auto md:max-w-none md:[mask-image:linear-gradient(to_right,transparent,black_18%,black_82%,transparent)]"
            />
          </div>
          <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-background via-transparent to-background" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent md:via-transparent" />
          <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-6 md:pb-8">
            <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl tracking-wider text-foreground animate-cover-title">
              {categoryName.toUpperCase()}
            </h1>
            <span className="mt-2 block h-1 w-24 origin-left bg-primary animate-cover-line" />
          </div>
        </section>
      )}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8 md:mb-10">
          {!cover && <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl tracking-wider">{categoryName.toUpperCase()}</h1>}
          <nav aria-label="Navegación de colección" className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="font-body">
              <Link to="/"><ArrowLeft />Volver al inicio</Link>
            </Button>
            <Button asChild className="font-body">
              <Link to={mode === "garment" ? "/categories" : "/styles"}>
                {mode === "garment" ? "Ver más categorías" : "Ver más estilos"}<ArrowRight />
              </Link>
            </Button>
          </nav>
        </div>

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
