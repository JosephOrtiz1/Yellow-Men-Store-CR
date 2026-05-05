import { Link } from "react-router-dom";
import { formatColones, type SupabaseProductListItem } from "@/lib/supabaseProducts";

interface Props {
  product: SupabaseProductListItem;
}

export const SupabaseProductCard = ({ product }: Props) => {
  const colors = [...(product.product_colors || [])].sort((a, b) => a.sort_order - b.sort_order);
  const image = colors[0]?.image_url;
  const hoverImage = colors[0]?.hover_image_url || null;
  const handle = product.handle || product.id;

  return (
    <Link to={`/product/${handle}`} className="group block">
      <div className="relative aspect-[3/4] bg-muted rounded-xl overflow-hidden mb-3">
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
      <h3 className="font-body font-semibold text-sm uppercase tracking-wide truncate">{product.title}</h3>
      <p className="font-body text-sm text-muted-foreground mt-1">
        {formatColones(product.price_colones)}
      </p>
    </Link>
  );
};