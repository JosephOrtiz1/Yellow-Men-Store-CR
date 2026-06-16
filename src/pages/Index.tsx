import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SupabaseProductCard } from "@/components/SupabaseProductCard";
import { fetchSupabaseProducts, type SupabaseProductListItem } from "@/lib/supabaseProducts";
import { ArrowRight, Loader2 } from "lucide-react";
import techwearHero from "@/assets/hero/hero-techwear.jpg";

const categories = [
  { name: "Street Wear", slug: "street-wear", description: "Estilo urbano y audaz" },
  { name: "Casual", slug: "casual", description: "Comodidad con estilo" },
  { name: "Cyber Wear", slug: "cyber-wear", description: "Futurismo en cada prenda" },
  { name: "Old Money", slug: "old-money", description: "Elegancia atemporal" },
];

const Index = () => {
  const [localProducts, setLocalProducts] = useState<SupabaseProductListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupabaseProducts(undefined, 24)
      .catch((e) => { console.error(e); return [] as SupabaseProductListItem[]; })
      .then((local) => setLocalProducts(local))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-secondary min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/95 to-transparent z-10" />
        <img
          src={techwearHero}
          alt="Yellow Men Store - Techwear"
          decoding="async"
          width={1600}
          height={1600}
          className="absolute right-0 top-0 h-full w-1/2 object-cover object-top opacity-60 md:opacity-80"
        />
        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-2xl">
            <h1 className="font-heading text-6xl sm:text-7xl md:text-9xl tracking-wider leading-none mb-4">
              YELLOW<br />
              <span className="text-primary">MEN</span><br />
              STORE
            </h1>
            <p className="font-body text-base sm:text-lg md:text-xl text-muted-foreground mb-8 max-w-md">
              Ropa moderna para hombres que no siguen reglas. De Instagram al mundo.
            </p>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-body uppercase tracking-wider touch-manipulation">
              <a href="#products">
                Ver Colección <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-4xl md:text-5xl tracking-wider mb-8 md:mb-10 text-center">CATEGORÍAS</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="group bg-card text-card-foreground p-4 md:p-6 rounded-sm hover:bg-primary hover:text-primary-foreground transition-colors duration-200 touch-manipulation"
              >
                <h3 className="font-heading text-xl md:text-2xl tracking-wider mb-1 md:mb-2">{cat.name.toUpperCase()}</h3>
                <p className="font-body text-xs md:text-sm opacity-70">{cat.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-4xl md:text-5xl tracking-wider mb-8 md:mb-10 text-center">PRODUCTOS</h2>
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
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
