import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { CartDrawer } from "./CartDrawer";

const categories = [
  { name: "Street Wear", slug: "street-wear" },
  { name: "Casual", slug: "casual" },
  { name: "Cybertech", slug: "cybertech" },
  { name: "Japan Style", slug: "japan-style" },
];

export const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-secondary border-b border-secondary">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-heading text-3xl text-secondary-foreground tracking-wider">
          YELLOW MEN STORE
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className="text-sm font-medium text-muted-foreground hover:text-secondary-foreground transition-colors uppercase tracking-wide font-body"
            >
              {cat.name}
            </Link>
          ))}
          <Link
            to="/about"
            className="text-sm font-medium text-muted-foreground hover:text-secondary-foreground transition-colors uppercase tracking-wide font-body"
          >
            Nosotros
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <CartDrawer />
          <button
            className="md:hidden text-secondary-foreground"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden bg-secondary border-t border-border pb-4">
          <nav className="container mx-auto px-4 flex flex-col gap-3 pt-3">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-secondary-foreground py-2 uppercase tracking-wide font-body"
              >
                {cat.name}
              </Link>
            ))}
            <Link
              to="/about"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-muted-foreground hover:text-secondary-foreground py-2 uppercase tracking-wide font-body"
            >
              Nosotros
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
