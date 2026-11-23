import { STYLES, GARMENT_TYPES } from "@/lib/catalog";
import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";
import logoFull from "@/assets/brand/logo-full.png";

export const Footer = () => (
  <footer className="bg-secondary text-foreground py-12 mt-20 border-t border-border">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
        <div className="col-span-2 md:col-span-1 min-w-0">
          <img src={logoFull} alt="Yellow Men Store" className="h-12 mb-4" />
          <p className="text-muted-foreground text-sm font-body">
            Ropa moderna para hombres. De Instagram al mundo.
          </p>
        </div>
        <div className="min-w-0">
          <h4 className="font-heading text-lg tracking-wider mb-3 text-primary">STYLES</h4>
          <div className="flex flex-col gap-2">
            {STYLES.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors font-body touch-manipulation"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="min-w-0">
          <h4 className="font-heading text-lg tracking-wider mb-3 text-primary">CATEGORÍAS</h4>
          <div className="flex flex-col gap-2">
            {GARMENT_TYPES.map((g) => (
              <Link
                key={g.slug}
                to={`/categories/${g.slug}`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors font-body touch-manipulation"
              >
                {g.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="col-span-2 md:col-span-1 min-w-0">
          <h4 className="font-heading text-lg tracking-wider mb-3 text-primary">SÍGUENOS</h4>
          <a
            href="https://www.instagram.com/yellowmenstore"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-body touch-manipulation"
          >
            <Instagram className="h-5 w-5" />
            @yellowmenstore
          </a>
          <h4 className="font-heading text-lg tracking-wider mb-3 mt-6 text-primary">LEGAL</h4>
          <div className="flex flex-col gap-2">
            <Link
              to="/terminos"
              className="text-sm text-muted-foreground hover:text-primary transition-colors font-body touch-manipulation"
            >
              Términos y condiciones
            </Link>
            <Link
              to="/terminos#devoluciones"
              className="text-sm text-muted-foreground hover:text-primary transition-colors font-body touch-manipulation"
            >
              Devoluciones y garantías
            </Link>
            <Link
              to="/terminos#privacidad"
              className="text-sm text-muted-foreground hover:text-primary transition-colors font-body touch-manipulation"
            >
              Política de privacidad
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-border mt-8 pt-6 grid grid-cols-2 gap-4 text-left md:text-center">
        <p className="text-xs text-muted-foreground font-body">
          © {new Date().getFullYear()} Yellow Men Store. Todos los derechos reservados.
        </p>
        <p className="text-xs text-muted-foreground font-body">
          Desarrollado por Jortz Dev. Todos los derechos reservados.
        </p>
      </div>
    </div>
  </footer>
);
