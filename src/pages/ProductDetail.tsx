import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchSupabaseProductByHandle, formatColones, type SupabaseProductListItem } from "@/lib/supabaseProducts";
import { supabase } from "@/integrations/supabase/client";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart, Instagram, CreditCard } from "lucide-react";
import { toast } from "sonner";

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const [localProduct, setLocalProduct] = useState<SupabaseProductListItem | null>(null);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addItem, startBuyNow } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!handle) return;
    setLoading(true);
    (async () => {
      try {
        let local = await fetchSupabaseProductByHandle(handle);
        if (!local) {
          const { data } = await supabase
            .from("products")
            .select("id, title, handle, price_colones, category, description, sizes, size_guide_url, available, product_colors(color_name, color_hex, image_url, hover_image_url, sort_order, available)")
            .eq("id", handle)
            .eq("is_active", true)
            .is("deleted_at", null)
            .maybeSingle();
          local = (data as SupabaseProductListItem | null) || null;
        }
        if (local) {
          setLocalProduct(local);
          if (local.sizes?.length) setSelectedSize(local.sizes[0]);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [handle]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!localProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-body text-lg text-muted-foreground">Producto no encontrado.</p>
      </div>
    );
  }

  {
    const colors = [...(localProduct.product_colors || [])].sort((a, b) => a.sort_order - b.sort_order);
    const productAvailable = localProduct.available !== false;
    const currentColor = colors[selectedColor];
    const colorAvailable = currentColor ? currentColor.available !== false : true;
    const canBuy = productAvailable && colorAvailable;
    // All images flattened across colors (main + hover) for this product
    const allImages: { url: string; colorIndex: number; label: string }[] = colors.flatMap((c, i) => {
      const arr = [{ url: c.image_url, colorIndex: i, label: c.color_name }];
      if (c.hover_image_url) arr.push({ url: c.hover_image_url, colorIndex: i, label: `${c.color_name} (alt)` });
      return arr;
    });
    const currentImage = allImages[selectedImage]?.url ?? colors[selectedColor]?.image_url;
    const igMessage = encodeURIComponent(
      `Hola! Me interesa: ${localProduct.title}${selectedSize ? ` (Talla ${selectedSize})` : ""}${colors[selectedColor] ? ` - Color ${colors[selectedColor].color_name}` : ""}`
    );

    const selectedItem = () => {
      const color = colors[selectedColor];
      const lineId = `${localProduct.id}:${color?.color_name ?? "default"}:${selectedSize || "default"}`;
      return {
        id: lineId,
        productId: localProduct.id,
        title: localProduct.title,
        handle: localProduct.handle ?? localProduct.id,
        imageUrl: color?.image_url ?? null,
        color: color?.color_name ?? null,
        size: selectedSize || null,
        priceColones: Number(localProduct.price_colones),
      };
    };

    const handleBuyNow = () => {
      if (!canBuy) return;
      startBuyNow(selectedItem());
      navigate("/checkout?buyNow=1");
    };

    const handleAddLocalToCart = () => {
      if (!canBuy) return;
      addItem(selectedItem());
      toast.success("Agregado al carrito", { position: "top-center" });
    };

    return (
      <div className="min-h-screen pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <div className="aspect-[3/4] bg-muted rounded-2xl overflow-hidden mb-3">
                {currentImage ? (
                  <img src={currentImage} alt={localProduct.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground font-body">Sin imagen</div>
                )}
              </div>
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => { setSelectedImage(i); setSelectedColor(img.colorIndex); }}
                    className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-colors ${
                        i === selectedImage ? "border-primary" : "border-transparent"
                      }`}
                    >
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h1 className="font-heading text-4xl md:text-5xl tracking-wider mb-4">{localProduct.title.toUpperCase()}</h1>
              <p className="font-body text-2xl font-bold mb-6">{formatColones(localProduct.price_colones)}</p>

              {colors.length > 0 && (
                <div className="mb-6">
                  <label className="font-body font-semibold text-sm uppercase tracking-wide mb-2 block">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSelectedColor(i);
                          const idx = allImages.findIndex((im) => im.colorIndex === i);
                          if (idx >= 0) setSelectedImage(idx);
                        }}
                        disabled={c.available === false}
                        className={`px-4 py-2 text-sm font-body border rounded-xl transition-colors ${
                          i === selectedColor ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"
                        } ${c.available === false ? "opacity-40 line-through cursor-not-allowed" : ""}`}
                      >
                        {c.color_name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {localProduct.sizes?.length > 0 && (
                <div className="mb-6">
                  <label className="font-body font-semibold text-sm uppercase tracking-wide mb-2 block">Talla</label>
                  <div className="flex flex-wrap gap-2">
                    {localProduct.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-4 py-2 text-sm font-body border rounded-xl transition-colors ${
                          selectedSize === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={handleAddLocalToCart}
                size="lg"
                disabled={!canBuy}
                className="w-full mb-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-body uppercase tracking-wider"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {canBuy ? "Agregar al Carrito" : "Agotado"}
              </Button>

              <Button onClick={handleBuyNow} size="lg" disabled={!canBuy} className="w-full mb-3 rounded-xl font-body uppercase tracking-wider">
                <CreditCard className="w-4 h-4 mr-2" /> Comprar ahora
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full rounded-xl font-body uppercase tracking-wider"
              >
                <a href={`https://ig.me/m/yellowmen.store?text=${igMessage}`} target="_blank" rel="noopener noreferrer">
                  <Instagram className="w-4 h-4 mr-2" /> Consultar por Instagram
                </a>
              </Button>

              {localProduct.description && (
                <div className="mt-8 pt-6 border-t border-border">
                  <h3 className="font-heading text-xl tracking-wider mb-3">DESCRIPCIÓN</h3>
                  <p className="font-body text-muted-foreground leading-relaxed whitespace-pre-line">{localProduct.description}</p>
                </div>
              )}

              {localProduct.size_guide_url && (
                <div className="mt-6">
                  <a
                    href={localProduct.size_guide_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-sm underline text-muted-foreground hover:text-primary"
                  >
                    Ver guía de tallas
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default ProductDetail;
