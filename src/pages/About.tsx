import { Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";

const About = () => (
  <div className="min-h-screen pt-6 md:pt-20">
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
      <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl tracking-wider mb-8 text-center">
        SOBRE <span className="text-primary">NOSOTROS</span>
      </h1>

      <div className="space-y-6 font-body text-base md:text-lg text-muted-foreground leading-relaxed">
        <p>
          <strong className="text-foreground">Yellow Men Store</strong> es un espacio premium para quienes encuentran 
          en la moda una forma de expresión y personalidad. Aquí reunimos una variedad de estilos y prendas poco 
          convencionales, difíciles de encontrar en el mercado nacional, pensadas para quienes buscan algo más que vestir.
        </p>
        <p>
          Nuestra intención es ofrecer artículos únicos para personas únicas. Queremos romper con lo cotidiano, 
          salir de lo convencional y darle a cada persona la oportunidad de expresar su identidad a través de su estilo.
        </p>
        <p>
          Si buscas destacar, atraer miradas y marcar la diferencia, estás en el lugar indicado. Explora nuestras 
          colecciones, encuentra el estilo con el que más te identificas y deja que cada outfit hable por ti, 
          estés donde estés.
        </p>
        <p className="font-heading text-2xl md:text-3xl tracking-wider text-primary text-center pt-4">
          NO SIGAS TENDENCIAS. CONSTRUYE TU PROPIO ESTILO.
        </p>
      </div>

      <div className="mt-12 text-center">
        <p className="font-heading text-2xl tracking-wider mb-4 text-primary">SÍGUENOS EN INSTAGRAM</p>
        <Button asChild variant="outline" size="lg" className="font-body uppercase tracking-wider border-primary text-primary hover:bg-primary hover:text-primary-foreground touch-manipulation">
          <a href="https://www.instagram.com/yellowmenstore" target="_blank" rel="noopener noreferrer">
            <Instagram className="mr-2 h-5 w-5" />
            @yellowmenstore
          </a>
        </Button>
      </div>
    </div>
  </div>
);

export default About;
