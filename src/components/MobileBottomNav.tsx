import { Link, useNavigate } from "react-router-dom";
import { Home, Search, User as UserIcon, Menu } from "lucide-react";
import { useState } from "react";
import { CartDrawer } from "./CartDrawer";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { useAuth } from "@/hooks/useAuth";

const categories = [
  { name: "Street Wear", slug: "street-wear" },
  { name: "Casual", slug: "casual" },
  { name: "Cyber Wear", slug: "cyber-wear" },
  { name: "Old Money", slug: "old-money" },
];

export const MobileBottomNav = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
      <div
        className="pointer-events-auto mx-auto max-w-md flex items-center justify-around rounded-2xl border border-white/10 bg-secondary/60 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.45)] px-2 py-2"
        style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}
      >
        <Link
          to="/"
          className="flex flex-col items-center gap-0.5 p-2 text-primary touch-manipulation"
          aria-label="Inicio"
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-body uppercase tracking-wider">Inicio</span>
        </Link>

        <Link
          to="/search"
          className="flex flex-col items-center gap-0.5 p-2 text-foreground/80 hover:text-primary transition-colors touch-manipulation"
          aria-label="Buscar"
        >
          <Search className="h-5 w-5" />
          <span className="text-[10px] font-body uppercase tracking-wider">Buscar</span>
        </Link>

        <div className="flex flex-col items-center gap-0.5 text-foreground/80 [&_button]:text-foreground/80">
          <CartDrawer />
          <span className="text-[10px] font-body uppercase tracking-wider -mt-1.5">Carrito</span>
        </div>

        <Link
          to={user ? "/orders" : "/auth"}
          className="flex flex-col items-center gap-0.5 p-2 text-foreground/80 hover:text-primary transition-colors touch-manipulation"
          aria-label="Cuenta"
        >
          <UserIcon className="h-5 w-5" />
          <span className="text-[10px] font-body uppercase tracking-wider">Cuenta</span>
        </Link>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <button
              className="flex flex-col items-center gap-0.5 p-2 text-foreground/80 hover:text-primary transition-colors touch-manipulation"
              aria-label="Menú"
            >
              <Menu className="h-5 w-5" />
              <span className="text-[10px] font-body uppercase tracking-wider">Menú</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl bg-secondary/95 backdrop-blur-xl border-t border-white/10">
            <SheetHeader>
              <SheetTitle className="font-heading text-2xl tracking-wider text-left">CATEGORÍAS</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1 pt-4 pb-6">
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(`/category/${cat.slug}`);
                  }}
                  className="text-left text-base font-medium text-muted-foreground hover:text-primary py-3 uppercase tracking-wide font-body touch-manipulation"
                >
                  {cat.name}
                </button>
              ))}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/about");
                }}
                className="text-left text-base font-medium text-muted-foreground hover:text-primary py-3 uppercase tracking-wide font-body touch-manipulation"
              >
                Nosotros
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};
