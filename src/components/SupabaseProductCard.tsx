import { Link } from "react-router-dom";
import { formatColones, type SupabaseProductListItem } from "@/lib/supabaseProducts";

interface Props {
  product: SupabaseProductListItem;
}

export const SupabaseProductCard = ({ product }: Props) => {
  const colors = [...(product.product_colors || [])].sort((a, b) => a.sort_order - b.sort_order);
  const image = colors[0]?.image_url;
  const handle = product.handle || product.id;

  return (
    <Link to={`/product/${handle}`} className="group block">
      <div className="aspect-[3/4] bg-muted rounded-sm overflow-hidden mb-3">
        {image ? (
          <img
            src={image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            decoding="async"
          />
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