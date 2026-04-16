import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, X, LogOut, Trash2, Upload, Ruler, Search } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AdminLogin from "./AdminLogin";
import techwearImg from "@/assets/techwear-hero.jpg";

const CATEGORIES = [
  { value: "street-wear", label: "Street Wear" },
  { value: "casual", label: "Casual" },
  { value: "cyber-wear", label: "Cyber Wear" },
  { value: "old-money", label: "Old Money" },
];

const COMMON_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

interface ColorEntry {
  name: string;
  hex: string;
  imageFile: File | null;
  imagePreview: string;
}

interface ProductRow {
  id: string;
  title: string;
  price_colones: number;
  category: string;
  sizes: string[];
  is_active: boolean;
  product_colors: { color_name: string; image_url: string }[];
}

const Admin = () => {
  const { user, loading: authLoading, isAdmin, signIn, signOut } = useAuth();

  // Product form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("casual");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<ColorEntry[]>([]);
  const [sizeGuideFile, setSizeGuideFile] = useState<File | null>(null);
  const [sizeGuidePreview, setSizeGuidePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Products list
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isAdmin) loadProducts();
  }, [isAdmin]);

  const loadProducts = async () => {
    setLoadingProducts(true);
    const { data, error } = await supabase
      .from("products")
      .select("id, title, price_colones, category, sizes, is_active, product_colors(color_name, image_url)")
      .order("created_at", { ascending: false });

    if (!error && data) setProducts(data as unknown as ProductRow[]);
    setLoadingProducts(false);
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const addColor = () => {
    setColors((prev) => [...prev, { name: "", hex: "#000000", imageFile: null, imagePreview: "" }]);
  };

  const removeColor = (index: number) => {
    setColors((prev) => prev.filter((_, i) => i !== index));
  };

  const updateColor = (index: number, field: keyof ColorEntry, value: any) => {
    setColors((prev) => {
      const updated = [...prev];
      if (field === "imageFile" && value instanceof File) {
        updated[index] = {
          ...updated[index],
          imageFile: value,
          imagePreview: URL.createObjectURL(value),
        };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const handleSizeGuide = (file: File) => {
    setSizeGuideFile(file);
    setSizeGuidePreview(URL.createObjectURL(file));
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price.trim()) {
      toast.error("Título y precio son obligatorios", { position: "top-center" });
      return;
    }
    if (selectedSizes.length === 0) {
      toast.error("Selecciona al menos una talla", { position: "top-center" });
      return;
    }
    if (colors.length === 0 || colors.some((c) => !c.name.trim() || !c.imageFile)) {
      toast.error("Agrega al menos un color con imagen", { position: "top-center" });
      return;
    }

    setSubmitting(true);
    try {
      const timestamp = Date.now();

      // Upload size guide if provided
      let sizeGuideUrl: string | null = null;
      if (sizeGuideFile) {
        sizeGuideUrl = await uploadFile(
          sizeGuideFile,
          "size-guides",
          `${timestamp}-${sizeGuideFile.name}`
        );
      }

      // Insert product
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          price_colones: parseFloat(price),
          category,
          sizes: selectedSizes,
          size_guide_url: sizeGuideUrl,
          created_by: user!.id,
        })
        .select("id")
        .single();

      if (productError) throw productError;

      // Upload color images and insert colors
      for (let i = 0; i < colors.length; i++) {
        const c = colors[i];
        const imageUrl = await uploadFile(
          c.imageFile!,
          "product-images",
          `${product.id}/${timestamp}-${c.name.toLowerCase().replace(/\s+/g, "-")}.${c.imageFile!.name.split(".").pop()}`
        );

        const { error: colorError } = await supabase.from("product_colors").insert({
          product_id: product.id,
          color_name: c.name.trim(),
          color_hex: c.hex,
          image_url: imageUrl,
          sort_order: i,
        });

        if (colorError) throw colorError;
      }

      toast.success("Producto creado exitosamente", { position: "top-center" });

      // Reset form
      setTitle("");
      setDescription("");
      setPrice("");
      setCategory("casual");
      setSelectedSizes([]);
      setColors([]);
      setSizeGuideFile(null);
      setSizeGuidePreview("");
      loadProducts();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error al crear producto", { position: "top-center" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast.error("Error al eliminar", { position: "top-center" });
    } else {
      toast.success("Producto eliminado", { position: "top-center" });
      loadProducts();
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <AdminLogin onLogin={signIn} />;
  }

  // Logged in but not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 text-center">
          <CardContent className="pt-8 pb-6 space-y-4">
            <p className="font-body text-lg text-foreground">No tienes permisos de administrador.</p>
            <p className="font-body text-sm text-muted-foreground">
              Contacta al propietario para obtener acceso.
            </p>
            <Button onClick={signOut} variant="outline" className="font-body">
              <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Techwear banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <h1 className="font-heading text-4xl md:text-5xl tracking-wider">PANEL DE ADMIN</h1>
          <div className="flex items-center gap-4">
            <div className="hidden md:block w-40 h-16 rounded-sm overflow-hidden border border-border">
              <img src={techwearImg} alt="Techwear" className="w-full h-full object-cover" />
            </div>
            <Button onClick={signOut} variant="outline" size="sm" className="font-body">
              <LogOut className="w-4 h-4 mr-2" /> Salir
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Create product form */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-2xl tracking-wider">CREAR PRODUCTO</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateProduct} className="space-y-5">
                {/* Title */}
                <div>
                  <Label className="font-body">Título *</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nombre del producto"
                    className="font-body"
                  />
                </div>

                {/* Description */}
                <div>
                  <Label className="font-body">Descripción</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descripción del producto"
                    className="font-body"
                  />
                </div>

                {/* Price in colones */}
                <div>
                  <Label className="font-body">Precio (₡ Colones) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-body">₡</span>
                    <Input
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="15000"
                      type="number"
                      step="0.01"
                      min="0"
                      className="font-body pl-8"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <Label className="font-body">Categoría *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="font-body">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value} className="font-body">
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sizes */}
                <div>
                  <Label className="font-body">Tallas Disponibles *</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {COMMON_SIZES.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`px-4 py-2 text-sm font-body border rounded-sm transition-colors touch-manipulation ${
                          selectedSizes.includes(size)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-foreground border-border hover:border-primary"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors with images */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="font-body">Colores e Imágenes *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addColor} className="font-body">
                      <Plus className="w-4 h-4 mr-1" /> Color
                    </Button>
                  </div>

                  {colors.length === 0 && (
                    <p className="text-sm text-muted-foreground font-body py-4 text-center border border-dashed border-border rounded-sm">
                      Agrega al menos un color con su imagen
                    </p>
                  )}

                  <div className="space-y-3">
                    {colors.map((color, i) => (
                      <div key={i} className="border border-border rounded-sm p-3 space-y-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={color.hex}
                            onChange={(e) => updateColor(i, "hex", e.target.value)}
                            className="w-10 h-10 rounded-sm cursor-pointer border border-border"
                          />
                          <Input
                            value={color.name}
                            onChange={(e) => updateColor(i, "name", e.target.value)}
                            placeholder="Nombre del color (ej: Negro)"
                            className="font-body flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeColor(i)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <div>
                          {color.imagePreview ? (
                            <div className="relative w-full h-40 rounded-sm overflow-hidden border border-border">
                              <img src={color.imagePreview} alt={color.name} className="w-full h-full object-cover" />
                              <label className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                                <span className="font-body text-sm text-foreground">Cambiar imagen</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => e.target.files?.[0] && updateColor(i, "imageFile", e.target.files[0])}
                                />
                              </label>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-sm cursor-pointer hover:border-primary transition-colors">
                              <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                              <span className="text-sm text-muted-foreground font-body">Subir imagen para este color</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => e.target.files?.[0] && updateColor(i, "imageFile", e.target.files[0])}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Size guide */}
                <div>
                  <Label className="font-body flex items-center gap-2">
                    <Ruler className="w-4 h-4" /> Guía de Tallas
                  </Label>
                  {sizeGuidePreview ? (
                    <div className="relative mt-2 w-full h-48 rounded-sm overflow-hidden border border-border">
                      <img src={sizeGuidePreview} alt="Guía de tallas" className="w-full h-full object-contain bg-card" />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          onClick={() => { setSizeGuideFile(null); setSizeGuidePreview(""); }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-28 mt-2 border-2 border-dashed border-border rounded-sm cursor-pointer hover:border-primary transition-colors">
                      <Ruler className="w-6 h-6 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground font-body">Subir imagen de guía de tallas</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleSizeGuide(e.target.files[0])}
                      />
                    </label>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-body uppercase tracking-wider"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" /> Crear Producto
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Product list */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-heading text-2xl tracking-wider">PRODUCTOS</CardTitle>
              <Button variant="outline" size="sm" onClick={loadProducts} disabled={loadingProducts} className="font-body">
                {loadingProducts ? <Loader2 className="w-4 h-4 animate-spin" /> : "Actualizar"}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre o ID..."
                  className="font-body pl-9"
                />
              </div>
              {loadingProducts ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : products.length === 0 ? (
                <p className="text-center text-muted-foreground font-body py-10">No hay productos aún.</p>
              ) : (() => {
                const q = searchQuery.trim().toLowerCase();
                const filtered = q
                  ? products.filter((p) => p.title.toLowerCase().includes(q) || p.id.toLowerCase().includes(q))
                  : products;
                if (filtered.length === 0) {
                  return <p className="text-center text-muted-foreground font-body py-10">Sin coincidencias.</p>;
                }
                return (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {filtered.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 border border-border rounded-sm">
                      <div className="w-14 h-14 bg-card rounded-sm overflow-hidden flex-shrink-0 border border-border">
                        {p.product_colors?.[0]?.image_url ? (
                          <img src={p.product_colors[0].image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-body">
                            Sin img
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-body font-semibold text-sm truncate">{p.title}</h4>
                        <p className="text-xs text-primary font-body font-semibold">
                          ₡{p.price_colones.toLocaleString("es-CR")}
                        </p>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          <span className="text-[10px] px-1.5 py-0.5 bg-secondary rounded-sm font-body text-muted-foreground">
                            {CATEGORIES.find((c) => c.value === p.category)?.label || p.category}
                          </span>
                          {p.sizes?.slice(0, 3).map((s) => (
                            <span key={s} className="text-[10px] px-1.5 py-0.5 bg-secondary rounded-sm font-body text-muted-foreground">
                              {s}
                            </span>
                          ))}
                          {p.sizes?.length > 3 && (
                            <span className="text-[10px] px-1.5 py-0.5 text-muted-foreground font-body">
                              +{p.sizes.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteProduct(p.id)}
                        className="text-destructive hover:text-destructive flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;
