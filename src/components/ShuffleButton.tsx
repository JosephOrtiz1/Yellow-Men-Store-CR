import { Shuffle } from "lucide-react";

/**
 * Re-runs the product fetch, which shuffles the catalog again.
 */
export const ShuffleButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="Mezclar productos"
    className="inline-flex items-center gap-1.5 font-body text-[11px] md:text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors touch-manipulation"
  >
    <Shuffle className="h-3.5 w-3.5" />
    Mezclar
  </button>
);
