import { Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";

const About = () => (
  <div className="min-h-screen pt-20">
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
      <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl tracking-wider mb-8 text-center">
        SOBRE <span className="text-primary">NOSOTROS</span>
      </h1>

      <div className="space-y-6 font-body text-base md:text-lg text-muted-foreground leading-relaxed">
        <p>
          <strong className="text-foreground">Yellow Men Store</strong> nació como un proyecto de pasión en Instagram. 
          Lo que comenzó como una cuenta compartiendo las últimas tendencias de moda masculina, rápidamente se convirtió 
          en una comunidad de hombres que buscan vestirse diferente.
        </p>
        <p>
          Durante años, cada venta se hacía por mensaje directo: fotos del producto, tallas disponibles, precios, 
          y coordinar el envío, todo en un chat de Instagram. Funcionaba, pero sabíamos que podíamos ofrecer más.
        </p>
        <p>
          Hoy, Yellow Men Store es tu destino online para encontrar ropa que refleja tu personalidad. 
          Desde el <strong className="text-foreground">Street Wear</strong> más audaz hasta el estilo 
          <strong className="text-foreground"> Japan Style</strong> más refinado, pasando por 
          <strong className="text-foreground"> Cyber Wear</strong> futurista y piezas 
          <strong className="text-foreground"> Casual</strong> para el día a día.
        </p>
        <p>
          Nuestra misión es simple: traerte las mejores piezas de ropa moderna para hombres que no siguen reglas, 
          con una experiencia de compra directa y sin complicaciones.
        </p>
      </div>

      <div className="mt-12 text-center">
        <p className="font-heading text-2xl tracking-wider mb-4 text-primary">SÍGUENOS EN INSTAGRAM</p>
        <Button asChild variant="outline" size="lg" className="font-body uppercase tracking-wider border-primary text-primary hover:bg-primary hover:text-primary-foreground touch-manipulation">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <Instagram className="mr-2 h-5 w-5" />
            @yellowmenstore
          </a>
        </Button>
      </div>
    </div>
  </div>
);

export default About;
