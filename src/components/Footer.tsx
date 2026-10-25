import { STYLES } from "@/lib/catalog";
import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";
import logoFull from "@/assets/brand/logo-full.png";

export const Footer = () => (
  <footer className="bg-secondary text-foreground py-12 mt-20 border-t border-border">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <img src={logoFull} alt="Yellow Men Store" className="h-12 mb-4" />
          <p className="text-muted-foreground text-sm font-body">
            Ropa moderna para hombres. De Instagram al mundo.
          </p>
        </div>
        <div>
          <h4 className="font-heading text-lg tracking-wider mb-3 text-primary">STYLES</h4>
          <div className="flex flex-col gap-2">
            {[...STYLES, { slug: "__cats", name: "Categorías de prendas" }].map((cat) => (
              <Link
                key={cat.slug}
                to={cat.slug === "__cats" ? "/categories" : `/category/${cat.slug}`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors font-body touch-manipulation"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-heading text-lg tracking-wider mb-3 text-primary">SÍGUENOS</h4>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-body touch-manipulation"
          >
            <Instagram className="h-5 w-5" />
            @yellowmenstore
          </a>
        </div>
      </div>
      <div className="border-t border-border mt-8 pt-6 text-center">
        <p className="text-xs text-muted-foreground font-body">
          © {new Date().getFullYear()} Yellow Men Store. Todos los derechos reservados.
        </p>
      </div>
    </div>
  </footer>
);
