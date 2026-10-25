import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GARMENT_TYPES } from "@/lib/catalog";

const Categories = () => {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const filtered = GARMENT_TYPES.filter((g) =>
    g.name.toLowerCase().includes(q.trim().toLowerCase()),
  );

  return (
    <div className="min-h-screen pt-6 md:pt-24">
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl tracking-wider mb-6">CATEGORÍAS</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (filtered[0]) navigate(`/categories/${filtered[0].slug}`);
          }}
          className="relative max-w-md mb-8"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar categoría (camisas, zapatos...)"
            className="pl-9 font-body bg-background border-border"
          />
        </form>
        {filtered.length === 0 ? (
          <p className="font-body text-muted-foreground">No hay categorías con ese nombre.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filtered.map((g) => (
              <Link
                key={g.slug}
                to={`/categories/${g.slug}`}
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
