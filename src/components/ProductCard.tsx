import { Link } from "react-router-dom";
import type { ShopifyProduct } from "@/lib/shopify";

interface ProductCardProps {
  product: ShopifyProduct;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { title, handle, priceRange, images } = product.node;
  const image = images.edges[0]?.node;
  const price = priceRange.minVariantPrice;

  return (
    <Link to={`/product/${handle}`} className="group block">
      <div className="aspect-[3/4] bg-muted rounded-xl overflow-hidden mb-3">
        {image ? (
          <img
            src={`${image.url}${image.url.includes("?") ? "&" : "?"}width=600`}
            srcSet={`${image.url}${image.url.includes("?") ? "&" : "?"}width=400 400w, ${image.url}${image.url.includes("?") ? "&" : "?"}width=600 600w, ${image.url}${image.url.includes("?") ? "&" : "?"}width=900 900w`}
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            alt={image.altText || title}
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
      <h3 className="font-body font-semibold text-sm uppercase tracking-wide truncate">{title}</h3>
      <p className="font-body text-sm text-muted-foreground mt-1">
        {price.currencyCode === "CRC"
          ? `₡${Math.round(parseFloat(price.amount)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}`
          : `$${parseFloat(price.amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))(?=.*\.)/g, " ")}`} {price.currencyCode !== "CRC" && price.currencyCode}
      </p>
    </Link>
  );
};
