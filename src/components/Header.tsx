import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { CartDrawer } from "./CartDrawer";
import isotipo from "@/assets/isotipo.png";

const categories = [
  { name: "Street Wear", slug: "street-wear" },
  { name: "Casual", slug: "casual" },
  { name: "Cyber Wear", slug: "cyber-wear" },
  { name: "Old Money", slug: "old-money" },
];

export const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-secondary border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/about" className="flex items-center gap-2">
          <img src={isotipo} alt="Yellow Men Store" className="h-10 w-10" />
          <span className="font-heading text-2xl md:text-3xl text-primary tracking-wider">YELLOW MEN STORE</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors uppercase tracking-wide font-body"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <CartDrawer />
          <button
            className="md:hidden text-foreground p-2 -mr-2 touch-manipulation"
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
          <nav className="container mx-auto px-4 flex flex-col gap-1 pt-3">
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
      )}
    </header>
  );
};
