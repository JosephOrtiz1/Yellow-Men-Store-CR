import { useEffect, useState } from "react";
import heroTechwear from "@/assets/hero/hero-techwear.jpg";
import heroStreetwear from "@/assets/hero/hero-streetwear.jpg";
import heroOldMoney from "@/assets/hero/hero-old-money.jpg";
import heroCasual from "@/assets/hero/hero-casual.jpg";
import heroDarkwear from "@/assets/hero/hero-darkwear.jpg.asset.json";
import heroJapanStyle from "@/assets/hero/hero-japan-style.jpg.asset.json";

const SLIDE_DURATION_MS = 4000;

const slides = [
  { src: heroTechwear, label: "Techwear" },
  { src: heroStreetwear, label: "Street Wear" },
  { src: heroOldMoney, label: "Old Money" },
  { src: heroCasual, label: "Casual" },
  { src: heroDarkwear.url, label: "Darkwear" },
  { src: heroJapanStyle.url, label: "Japan Style" },
];

/**
 * Hero image slider with a segmented progress bar.
 * Each segment fills over SLIDE_DURATION_MS; when it completes, the next
 * image crossfades in. The bar restarts from zero on every slide change.
 */
export const HeroSlider = () => {
  const [active, setActive] = useState(0);
  // Bumping `cycle` remounts the filling bar so its animation restarts cleanly.
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setActive((prev) => (prev + 1) % slides.length);
      setCycle((c) => c + 1);
    }, SLIDE_DURATION_MS);
    return () => clearTimeout(timer);
  }, [cycle]);

  return (
    <>
      {/* Images — crossfade stack, dimmed so the headline stays legible on mobile */}
      {slides.map((slide, i) => (
        <img
          key={slide.label}
          src={slide.src}
          alt={`Yellow Men Store - ${slide.label}`}
          decoding="async"
          loading={i === 0 ? "eager" : "lazy"}
          width={1600}
          height={1600}
          aria-hidden={i !== active}
          className={`absolute right-0 top-0 h-full w-full md:w-1/2 object-cover object-top brightness-[0.62] md:brightness-75 transition-opacity duration-1000 ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Segmented progress bar */}
      <div className="absolute bottom-6 left-0 right-0 z-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 max-w-md">
            <div className="flex flex-1 gap-1.5">
              {slides.map((slide, i) => (
                <div
                  key={slide.label}
                  className="h-[3px] flex-1 overflow-hidden rounded-full bg-foreground/20"
                >
                  {i < active && <div className="h-full w-full bg-primary" />}
                  {i === active && (
                    <div
                      key={cycle}
                      className="hero-progress-fill h-full w-full bg-primary origin-left"
                      style={{ animationDuration: `${SLIDE_DURATION_MS}ms` }}
                    />
                  )}
                </div>
              ))}
            </div>
            <span className="font-body text-[10px] uppercase tracking-[0.25em] text-foreground/60 whitespace-nowrap">
              {slides[active].label}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
