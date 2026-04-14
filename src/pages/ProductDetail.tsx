import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchProductByHandle } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart, Check } from "lucide-react";
import { toast } from "sonner";

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const { addItem, isLoading } = useCartStore();

  useEffect(() => {
    if (!handle) return;
    setLoading(true);
    fetchProductByHandle(handle)
      .then((p) => {
        setProduct(p);
        if (p?.options) {
          const defaults: Record<string, string> = {};
          p.options.forEach((opt: { name: string; values: string[] }) => {
            if (opt.name !== "Title") defaults[opt.name] = opt.values[0];
          });
          setSelectedOptions(defaults);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [handle]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-body text-lg text-muted-foreground">Producto no encontrado.</p>
      </div>
    );
  }

  const images = product.images?.edges || [];
  const options = (product.options || []).filter((o: { name: string }) => o.name !== "Title");

  const selectedVariant = product.variants?.edges?.find(
    (v: { node: { selectedOptions: Array<{ name: string; value: string }> } }) =>
      v.node.selectedOptions.every(
        (opt: { name: string; value: string }) => opt.name === "Title" || selectedOptions[opt.name] === opt.value
      )
  )?.node || product.variants?.edges?.[0]?.node;

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    await addItem({
      product: { node: product },
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions || [],
    });
    toast.success("Agregado al carrito", { position: "top-center" });
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Images */}
          <div>
            <div className="aspect-[3/4] bg-muted rounded-sm overflow-hidden mb-3">
              {images[selectedImage]?.node ? (
                <img
                  src={images[selectedImage].node.url}
                  alt={images[selectedImage].node.altText || product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground font-body">Sin imagen</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-sm overflow-hidden flex-shrink-0 border-2 transition-colors ${
                      i === selectedImage ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img src={img.node.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <h1 className="font-heading text-4xl md:text-5xl tracking-wider mb-4">{product.title.toUpperCase()}</h1>
            <p className="font-body text-2xl font-bold mb-6">
              ${parseFloat(selectedVariant?.price?.amount || product.priceRange.minVariantPrice.amount).toFixed(2)}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                {selectedVariant?.price?.currencyCode || product.priceRange.minVariantPrice.currencyCode}
              </span>
            </p>

            {/* Options */}
            {options.map((option: { name: string; values: string[] }) => (
              <div key={option.name} className="mb-6">
                <label className="font-body font-semibold text-sm uppercase tracking-wide mb-2 block">
                  {option.name}
                </label>
                <div className="flex flex-wrap gap-2">
                  {option.values.map((value: string) => (
                    <button
                      key={value}
                      onClick={() => setSelectedOptions((prev) => ({ ...prev, [option.name]: value }))}
                      className={`px-4 py-2 text-sm font-body border rounded-sm transition-colors ${
                        selectedOptions[option.name] === value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <Button
              onClick={handleAddToCart}
              disabled={isLoading || !selectedVariant?.availableForSale}
              size="lg"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-body uppercase tracking-wider"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : !selectedVariant?.availableForSale ? (
                "Agotado"
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Agregar al Carrito
                </>
              )}
            </Button>

            {product.description && (
              <div className="mt-8 pt-6 border-t border-border">
                <h3 className="font-heading text-xl tracking-wider mb-3">DESCRIPCIÓN</h3>
                <p className="font-body text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}

            {product.tags?.length > 0 && (
              <div className="mt-6">
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag: string) => (
                    <span key={tag} className="text-xs font-body bg-muted text-muted-foreground px-3 py-1 rounded-sm uppercase tracking-wide">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
