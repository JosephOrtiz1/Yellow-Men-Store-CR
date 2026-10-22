import { Link, useNavigate } from "react-router-dom";
import { Home, Search, User as UserIcon, Menu, Package, ShieldCheck, LogOut, LogIn } from "lucide-react";
import { useState } from "react";
import { CartDrawer } from "./CartDrawer";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { NotificationList } from "./NotificationBell";
import { useAuth } from "@/hooks/useAuth";

const categories = [
  { name: "Street Wear", slug: "street-wear" },
  { name: "Casual", slug: "casual" },
  { name: "Cyber Wear", slug: "cyber-wear" },
  { name: "Old Money", slug: "old-money" },
];

const sheetItem =
  "flex items-center gap-3 text-left text-base font-medium text-muted-foreground hover:text-primary py-3 uppercase tracking-wide font-body touch-manipulation";

export const MobileBottomNav = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  const go = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

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
          <SheetContent
            side="bottom"
            className="rounded-t-2xl bg-secondary/95 backdrop-blur-xl border-t border-white/10 max-h-[80vh] overflow-y-auto"
          >
            <SheetHeader>
              <SheetTitle className="font-heading text-2xl tracking-wider text-left">CATEGORÍAS</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1 pt-4 pb-6">
              {categories.map((cat) => (
                <button key={cat.slug} onClick={() => go(`/category/${cat.slug}`)} className={sheetItem}>
                  {cat.name}
                </button>
              ))}
              <button onClick={() => go("/about")} className={sheetItem}>
                Nosotros
              </button>

              <div className="mt-6 pt-4 border-t border-white/10">
                <h3 className="font-heading text-xl tracking-wider mb-1">CUENTA</h3>
                {user ? (
                  <>
                    <p className="text-xs font-body text-muted-foreground truncate pb-2">{user.email}</p>
                    <button onClick={() => go("/orders")} className={sheetItem}>
                      <Package className="h-4 w-4 flex-shrink-0" /> Mis pedidos
                    </button>
                    {isAdmin && (
                      <button onClick={() => go("/admin")} className={sheetItem}>
                        <ShieldCheck className="h-4 w-4 flex-shrink-0" /> Panel admin
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        signOut();
                      }}
                      className={`${sheetItem} text-destructive`}
                    >
                      <LogOut className="h-4 w-4 flex-shrink-0" /> Cerrar sesión
                    </button>
                  </>
                ) : (
                  <button onClick={() => go("/auth")} className={sheetItem}>
                    <LogIn className="h-4 w-4 flex-shrink-0" /> Iniciar sesión
                  </button>
                )}
              </div>

              {user && (
                <div className="mt-6 pt-4 border-t border-white/10">
                  <h3 className="font-heading text-xl tracking-wider mb-2">NOTIFICACIONES</h3>
                  <NotificationList />
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};
