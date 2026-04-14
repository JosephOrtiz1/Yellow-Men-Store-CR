import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";

export const Footer = () => (
  <footer className="bg-secondary text-secondary-foreground py-12 mt-20">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-heading text-2xl tracking-wider mb-3">YELLOW MEN STORE</h3>
          <p className="text-muted-foreground text-sm font-body">
            Ropa moderna para hombres. De Instagram al mundo.
          </p>
        </div>
        <div>
          <h4 className="font-heading text-lg tracking-wider mb-3">CATEGORÍAS</h4>
          <div className="flex flex-col gap-2">
            {["street-wear", "casual", "cybertech", "japan-style"].map((slug) => (
              <Link
                key={slug}
                to={`/category/${slug}`}
                className="text-sm text-muted-foreground hover:text-secondary-foreground transition-colors font-body capitalize"
              >
                {slug.replace("-", " ")}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-heading text-lg tracking-wider mb-3">SÍGUENOS</h4>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-secondary-foreground transition-colors font-body"
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
