import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GARMENT_TYPES, STYLES } from "@/lib/catalog";

const Categories = ({ mode = "garment" }: { mode?: "style" | "garment" }) => {
  const isStyle = mode === "style";
  const title = isStyle ? "STYLES" : "CATEGORÍAS";
  const listingPath = isStyle ? "/styles" : "/categories";
  const productPath = isStyle ? "/category" : "/categories";
  const filtered = isStyle ? STYLES : GARMENT_TYPES;

  return (
    <div className="min-h-screen pt-6 md:pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl tracking-wider">{title}</h1>
          <nav aria-label={isStyle ? "Navegación de estilos" : "Navegación de categorías"} className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="font-body">
              <Link to="/"><ArrowLeft />Volver al inicio</Link>
            </Button>
            <Button asChild className="font-body">
              <Link to={listingPath}>{isStyle ? "Ver más estilos" : "Ver más categorías"}<ArrowRight /></Link>
            </Button>
          </nav>
        </div>
        {filtered.length === 0 ? (
          <p className="font-body text-muted-foreground">{isStyle ? "No hay estilos con ese nombre." : "No hay categorías con ese nombre."}</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filtered.map((g) => (
              <Link
                key={g.slug}
                to={`${productPath}/${g.slug}`}
                className="bg-card text-card-foreground p-6 rounded-sm hover:bg-primary hover:text-primary-foreground transition-colors duration-200 touch-manipulation"
              >
                <h2 className="font-heading text-2xl tracking-wider">{g.name.toUpperCase()}</h2>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
