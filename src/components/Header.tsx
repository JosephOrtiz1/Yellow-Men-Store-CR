import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Home, Search } from "lucide-react";
import { useState } from "react";
import { CartDrawer } from "./CartDrawer";
import { Input } from "./ui/input";
import isotipo from "@/assets/isotipo.png";

const categories = [
  { name: "Street Wear", slug: "street-wear" },
  { name: "Casual", slug: "casual" },
  { name: "Cyber Wear", slug: "cyber-wear" },
  { name: "Old Money", slug: "old-money" },
];

export const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-secondary border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <Link to="/about" className="flex items-center gap-2 flex-shrink-0">
          <img src={isotipo} alt="Yellow Men Store" className="h-10 w-10" />
          <span className="font-heading text-xl md:text-3xl text-primary tracking-wider whitespace-nowrap">YELLOW MEN STORE</span>
        </Link>

        {/* Desktop search */}
        <form onSubmit={submitSearch} className="hidden md:flex flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="pl-9 font-body bg-background border-border h-9"
          />
        </form>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors uppercase tracking-wide font-body whitespace-nowrap"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 flex-shrink-0">
          <Link
            to="/"
            className="p-2 text-foreground hover:text-primary transition-colors touch-manipulation"
            aria-label="Inicio"
          >
            <Home className="h-5 w-5" />
          </Link>
          <CartDrawer />
          <button
            className="lg:hidden text-foreground p-2 -mr-2 touch-manipulation"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="lg:hidden bg-secondary border-t border-border pb-4">
          <div className="container mx-auto px-4 pt-3 space-y-3">
            <form onSubmit={submitSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar productos..."
                className="pl-9 font-body bg-background border-border"
              />
            </form>
            <nav className="flex flex-col gap-1">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/category/${cat.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="text-base font-medium text-muted-foreground hover:text-primary py-3 uppercase tracking-wide font-body touch-manipulation"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};
