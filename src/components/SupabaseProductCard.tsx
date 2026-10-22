import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { formatColones, type SupabaseProductListItem } from "@/lib/supabaseProducts";
import { useCartStore } from "@/stores/cartStore";

interface Props {
  product: SupabaseProductListItem;
}

export const SupabaseProductCard = ({ product }: Props) => {
  const { addItem } = useCartStore();
  const colors = [...(product.product_colors || [])].sort((a, b) => a.sort_order - b.sort_order);
  const image = colors[0]?.image_url;
  const hoverImage = colors[0]?.hover_image_url || null;
  const handle = product.handle || product.id;
  const canBuy = product.available !== false && (colors[0] ? colors[0].available !== false : true);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canBuy) return;
    const color = colors[0];
    const size = product.sizes?.[0] || null;
    addItem({
      id: `${product.id}:${color?.color_name ?? "default"}:${size || "default"}`,
      productId: product.id,
      title: product.title,
      handle,
      imageUrl: color?.image_url ?? null,
      color: color?.color_name ?? null,
      size,
      priceColones: Number(product.price_colones),
    });
    toast.success("Agregado al carrito", { position: "top-center" });
  };

  return (
    <div className="group block border border-border bg-card rounded-xl overflow-hidden">
      <Link to={`/product/${handle}`} className="block">
        <div className="relative aspect-[3/4] bg-muted overflow-hidden">
          {image ? (
            <>
              <img
                src={image}
                alt={product.title}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${
                  hoverImage ? "group-hover:opacity-0 group-hover:scale-105" : "group-hover:scale-105"
                }`}
                loading="lazy"
                decoding="async"
              />
              {hoverImage && (
                <img
                  src={hoverImage}
                  alt={`${product.title} alternativa`}
                  className="absolute inset-0 w-full h-full object-cover opacity-0 scale-105 group-hover:opacity-100 group-hover:scale-100 transition-all duration-700 ease-out"
                  loading="lazy"
                  decoding="async"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="font-body text-sm">Sin imagen</span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-3 md:p-4">
        <Link to={`/product/${handle}`}>
          <h3 className="font-body font-semibold text-sm uppercase tracking-wide truncate">{product.title}</h3>
          <p className="font-body text-sm text-muted-foreground mt-1">
            {formatColones(product.price_colones)}
          </p>
        </Link>
        <button
          onClick={handleQuickAdd}
          disabled={!canBuy}
          className="mt-3 w-full border border-foreground/40 py-2 font-body text-xs uppercase tracking-widest hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation flex items-center justify-center gap-2"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          Agregar
        </button>
      </div>
    </div>
  );
};
