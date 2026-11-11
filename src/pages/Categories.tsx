import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GARMENT_TYPES, STYLES } from "@/lib/catalog";

const Categories = ({ mode = "garment" }: { mode?: "style" | "garment" }) => {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const isStyle = mode === "style";
  const title = isStyle ? "STYLES" : "CATEGORÍAS";
  const listingPath = isStyle ? "/styles" : "/categories";
  const productPath = isStyle ? "/category" : "/categories";
  const filtered = (isStyle ? STYLES : GARMENT_TYPES).filter((g) =>
    g.name.toLowerCase().includes(q.trim().toLowerCase()),
  );

  return (
    <div className="min-h-screen pt-6 md:pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (filtered[0]) navigate(`${productPath}/${filtered[0].slug}`);
          }}
          className="relative max-w-md mb-8"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={isStyle ? "Buscar estilo (Street Wear, Techwear...)" : "Buscar categoría (camisas, zapatos...)"}
            aria-label={isStyle ? "Buscar estilo" : "Buscar categoría"}
            className="pl-9 font-body bg-background border-border"
          />
        </form>
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
