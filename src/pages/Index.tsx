import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SupabaseProductCard } from "@/components/SupabaseProductCard";
import { HeroSlider } from "@/components/HeroSlider";
import { fetchSupabaseProducts, type SupabaseProductListItem } from "@/lib/supabaseProducts";
import { ArrowRight, Loader2 } from "lucide-react";

const categories = [
  { name: "Street Wear", slug: "street-wear", description: "Estilo urbano y audaz" },
  { name: "Casual", slug: "casual", description: "Comodidad con estilo" },
  { name: "Techwear", slug: "cyber-wear", description: "Futurismo en cada prenda" },
  { name: "Old Money", slug: "old-money", description: "Elegancia atemporal" },
];

const Index = () => {
  const [localProducts, setLocalProducts] = useState<SupabaseProductListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupabaseProducts(undefined, 50)
      .catch((e) => { console.error(e); return [] as SupabaseProductListItem[]; })
      .then((local) => setLocalProducts(local))
      .finally(() => setLoading(false));
  }, []);

  const byCategory = useMemo(() => {
    const map = new Map<string, SupabaseProductListItem[]>();
    for (const cat of categories) map.set(cat.slug, []);
    for (const p of localProducts) {
      const list = map.get(p.category);
      if (list) list.push(p);
    }
    return map;
  }, [localProducts]);

  return (
    <div className="min-h-screen">
      {/* Hero — editorial full-height */}
      <section className="relative bg-secondary min-h-[85vh] md:min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 hero-scrim z-10" />
        <HeroSlider />
        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-2xl">
            <p className="font-body text-xs md:text-sm uppercase tracking-[0.3em] text-primary mb-4">
              Nueva colección
            </p>
            <h1 className="font-heading text-7xl sm:text-8xl md:text-[10rem] tracking-wider leading-[0.85] mb-6">
              LAS CALLES
              <br />
              <span className="text-primary">SON TUYAS.</span>
            </h1>
            <p className="font-body text-base sm:text-lg md:text-xl text-muted-foreground mb-8 max-w-md">
              Ropa moderna para hombres que no siguen reglas. Diseñada para destacar. Hecha para durar.
            </p>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-foreground/50 bg-transparent text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary font-body uppercase tracking-widest touch-manipulation"
            >
              <a href="#products">
                Comprar ahora <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Mobile: carruseles horizontales por categoría */}
      <section className="md:hidden py-10 bg-background space-y-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {categories.map((cat) => {
              const items = byCategory.get(cat.slug) || [];
              if (items.length === 0) return null;
              return (
                <div key={cat.slug}>
                  <div className="flex items-baseline justify-between px-4 mb-4">
                    <h2 className="font-heading text-3xl tracking-wider">{cat.name.toUpperCase()}</h2>
                    <Link
                      to={`/category/${cat.slug}`}
                      className="font-body text-xs text-muted-foreground underline underline-offset-4 uppercase tracking-wider"
                    >
                      Ver todo
                    </Link>
                  </div>
                  <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {items.map((p) => (
                      <div key={`m-${p.id}`} className="w-44 flex-shrink-0 snap-start">
                        <SupabaseProductCard product={p} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <div id="products">
              <div className="px-4 mb-4">
                <h2 className="font-heading text-3xl tracking-wider">TODOS LOS PRODUCTOS</h2>
              </div>
              {localProducts.length === 0 ? (
                <div className="text-center py-16 mx-4 bg-card rounded-sm">
                  <p className="font-body text-lg text-muted-foreground">No hay productos aún.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 px-4">
                  {localProducts.map((p) => (
                    <SupabaseProductCard key={`all-${p.id}`} product={p} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* Desktop: categorías */}
      <section className="hidden md:block py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-5xl tracking-wider mb-10 text-center">CATEGORÍAS</h2>
          <div className="grid grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="group bg-card text-card-foreground p-6 rounded-sm hover:bg-primary hover:text-primary-foreground transition-colors duration-200 touch-manipulation"
              >
                <h3 className="font-heading text-2xl tracking-wider mb-2">{cat.name.toUpperCase()}</h3>
                <p className="font-body text-sm opacity-70">{cat.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Desktop: productos */}
      <section id="products" className="hidden md:block py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-5xl tracking-wider mb-10 text-center">PRODUCTOS</h2>
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : localProducts.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-sm">
              <p className="font-body text-lg text-muted-foreground">No hay productos aún.</p>
              <p className="font-body text-sm text-muted-foreground mt-2">Los productos aparecerán aquí cuando se agreguen a la tienda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 lg:grid-cols-4 gap-6">
              {localProducts.map((p) => (
                <SupabaseProductCard key={`local-${p.id}`} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About section */}
      <section className="py-12 md:py-16 bg-card">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-heading text-4xl md:text-5xl tracking-wider mb-6">NUESTRA HISTORIA</h2>
          <p className="font-body text-base md:text-lg text-muted-foreground leading-relaxed mb-6">
            Yellow Men Store nació en Instagram, vendiendo ropa de hombre que rompe esquemas.
            Después de años conectando con nuestra comunidad por mensajes directos, decidimos dar el salto
            y crear nuestra propia tienda online para ofrecerte una experiencia de compra más cómoda y directa.
          </p>
          <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-body uppercase tracking-wider touch-manipulation">
            <Link to="/about">Conoce más <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
