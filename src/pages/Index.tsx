import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { fetchProducts, type ShopifyProduct } from "@/lib/shopify";
import { ArrowRight, Loader2 } from "lucide-react";

const categories = [
  { name: "Street Wear", slug: "street-wear", description: "Estilo urbano y audaz" },
  { name: "Casual", slug: "casual", description: "Comodidad con estilo" },
  { name: "Cybertech", slug: "cybertech", description: "Futurismo en cada prenda" },
  { name: "Japan Style", slug: "japan-style", description: "Inspiración oriental moderna" },
];

const Index = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts(12).then(setProducts).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-secondary text-secondary-foreground min-h-[80vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary to-primary/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="font-heading text-7xl md:text-9xl tracking-wider leading-none mb-4">
              YELLOW<br />
              <span className="text-primary">MEN</span><br />
              STORE
            </h1>
            <p className="font-body text-lg md:text-xl text-muted-foreground mb-8 max-w-md">
              Ropa moderna para hombres que no siguen reglas. De Instagram al mundo.
            </p>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-body uppercase tracking-wider">
              <a href="#products">
                Ver Colección <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-4xl md:text-5xl tracking-wider mb-10 text-center">CATEGORÍAS</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="group bg-secondary text-secondary-foreground p-6 rounded-sm hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
              >
                <h3 className="font-heading text-2xl tracking-wider mb-2">{cat.name.toUpperCase()}</h3>
                <p className="font-body text-sm opacity-70">{cat.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-4xl md:text-5xl tracking-wider mb-10 text-center">PRODUCTOS</h2>
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-muted rounded-sm">
              <p className="font-body text-lg text-muted-foreground">No hay productos aún.</p>
              <p className="font-body text-sm text-muted-foreground mt-2">Los productos aparecerán aquí cuando se agreguen a la tienda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.node.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About section */}
      <section className="py-16 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-heading text-4xl md:text-5xl tracking-wider mb-6">NUESTRA HISTORIA</h2>
          <p className="font-body text-lg text-muted-foreground leading-relaxed mb-6">
            Yellow Men Store nació en Instagram, vendiendo ropa de hombre que rompe esquemas. 
            Después de años conectando con nuestra comunidad por mensajes directos, decidimos dar el salto 
            y crear nuestra propia tienda online para ofrecerte una experiencia de compra más cómoda y directa.
          </p>
          <Button asChild variant="outline" className="border-secondary-foreground text-secondary-foreground hover:bg-secondary-foreground hover:text-secondary font-body uppercase tracking-wider">
            <Link to="/about">Conoce más <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
