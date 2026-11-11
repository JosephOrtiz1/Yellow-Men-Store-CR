import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Home, User as UserIcon, LogOut } from "lucide-react";
import { useState } from "react";
import { CartDrawer } from "./CartDrawer";
import { NotificationBell } from "./NotificationBell";
import { LiveSearch } from "./LiveSearch";
import { Button } from "./ui/button";
import { STYLES } from "@/lib/catalog";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import isotipo from "@/assets/brand/isotipo.png";

const categories = STYLES;

export const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setMenuOpen(false);
  };

  return (
    <header className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-secondary border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center gap-3 xl:gap-6">
        <Link to="/about" className="flex items-center gap-2 flex-shrink-0" aria-label="Yellow Men Store - Inicio">
          <img src={isotipo} alt="Yellow Men Store" className="h-10 w-10" />
          <span className="hidden xl:inline font-heading text-2xl text-primary tracking-wider whitespace-nowrap">
            YELLOW MEN STORE
          </span>
        </Link>


        <nav className="hidden lg:flex items-center justify-center gap-4 xl:gap-8 flex-1">
          <Link to="/styles" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors uppercase tracking-wide font-body whitespace-nowrap">
            Styles
          </Link>
          <Link to="/categories" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors uppercase tracking-wide font-body whitespace-nowrap">
            Categorías
          </Link>
          <Link to="/#featured" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors uppercase tracking-wide font-body whitespace-nowrap">
            Destacados
          </Link>
        </nav>

        <div className="hidden md:flex lg:hidden flex-1" />

        <div className="flex items-center gap-3 flex-shrink-0">
          <LiveSearch
            value={search}
            onChange={setSearch}
            onSubmit={submitSearch}
            align="right"
            className="hidden md:flex w-56 lg:w-64"
            inputClassName="h-9"
          />

          <div className="flex items-center gap-2 pl-1 md:border-l md:border-border md:pl-3">
            <Link
              to="/"
              className="p-2 text-foreground hover:text-primary transition-colors touch-manipulation"
              aria-label="Inicio"
            >
              <Home className="h-5 w-5" />
            </Link>
            <NotificationBell />
            <CartDrawer />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative gap-2 px-2 h-9 border border-primary/40 bg-primary/10 hover:bg-primary/20"
                    aria-label="Cuenta"
                  >
                    <div className="relative">
                      <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-heading text-sm tracking-wider">
                        {(user.email?.[0] || "U").toUpperCase()}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-secondary" />
                    </div>
                    <span className="hidden sm:inline font-body text-xs uppercase tracking-wider text-primary max-w-[100px] truncate">
                      {user.email?.split("@")[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-body truncate">{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/orders")} className="font-body cursor-pointer">
                    Mis pedidos
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/admin")} className="font-body cursor-pointer">
                      Panel admin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="font-body cursor-pointer text-destructive">
                    <LogOut className="w-4 h-4 mr-2" /> Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/auth"
                className="p-2 text-foreground hover:text-primary transition-colors touch-manipulation"
                aria-label="Iniciar sesión"
              >
                <UserIcon className="h-5 w-5" />
              </Link>
            )}

            <button
              className="lg:hidden text-foreground p-2 -mr-2 touch-manipulation"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden bg-secondary border-t border-border pb-4">
          <div className="container mx-auto px-4 pt-3 space-y-3">
            <LiveSearch
              value={search}
              onChange={setSearch}
              onSubmit={submitSearch}
              className="hidden md:block w-full"
            />
            <nav className="flex flex-col gap-1">
              <Link to="/styles" onClick={() => setMenuOpen(false)} className="text-base font-medium text-muted-foreground hover:text-primary py-3 uppercase tracking-wide font-body touch-manipulation">
                Styles
              </Link>
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
              <Link to="/categories" onClick={() => setMenuOpen(false)} className="text-base font-medium text-muted-foreground hover:text-primary py-3 uppercase tracking-wide font-body touch-manipulation">
                Categorías
              </Link>
              <Link to="/#featured" onClick={() => setMenuOpen(false)} className="text-base font-medium text-muted-foreground hover:text-primary py-3 uppercase tracking-wide font-body touch-manipulation">
                Destacados
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};
