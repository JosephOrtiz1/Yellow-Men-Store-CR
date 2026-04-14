import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchProducts, type ShopifyProduct } from "@/lib/shopify";
import { Loader2, Lock, Trash2, Plus, X } from "lucide-react";
import { toast } from "sonner";

const ADMIN_PASSWORD = "yellowadmin2024";

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(false);

  // New product form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [tags, setTags] = useState("");
  const [sizes, setSizes] = useState("S,M,L,XL");
  const [colors, setColors] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      loadProducts();
    } else {
      toast.error("Contraseña incorrecta", { position: "top-center" });
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts(50);
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price.trim()) {
      toast.error("Título y precio son obligatorios", { position: "top-center" });
      return;
    }

    setSubmitting(true);
    toast.info(
      "Para crear productos, usa el chat de Lovable: escribe el nombre del producto, precio, tallas y colores.",
      { position: "top-center", duration: 5000 }
    );
    setSubmitting(false);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Lock className="h-10 w-10 mx-auto mb-3 text-primary" />
            <CardTitle className="font-heading text-3xl tracking-wider">ADMIN</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="password" className="font-body">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa la contraseña"
                  className="font-body"
                />
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-body uppercase tracking-wider">
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-heading text-5xl tracking-wider mb-8">PANEL DE ADMIN</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create product form */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-2xl tracking-wider">CREAR PRODUCTO</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div>
                  <Label className="font-body">Título *</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nombre del producto" className="font-body" />
                </div>
                <div>
                  <Label className="font-body">Descripción</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción del producto" className="font-body" />
                </div>
                <div>
                  <Label className="font-body">Precio *</Label>
                  <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="29.99" type="number" step="0.01" className="font-body" />
                </div>
                <div>
                  <Label className="font-body">Tags (separados por coma)</Label>
                  <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="street-wear, casual" className="font-body" />
                </div>
                <div>
                  <Label className="font-body">Tallas (separadas por coma)</Label>
                  <Input value={sizes} onChange={(e) => setSizes(e.target.value)} placeholder="S,M,L,XL" className="font-body" />
                </div>
                <div>
                  <Label className="font-body">Colores (separados por coma)</Label>
                  <Input value={colors} onChange={(e) => setColors(e.target.value)} placeholder="Negro,Blanco,Amarillo" className="font-body" />
                </div>
                <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-body uppercase tracking-wider">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-2" /> Crear Producto</>}
                </Button>
                <p className="text-xs text-muted-foreground font-body text-center">
                  Los productos se crean desde el chat de Lovable con la integración de Shopify.
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Product list */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-heading text-2xl tracking-wider">PRODUCTOS</CardTitle>
              <Button variant="outline" size="sm" onClick={loadProducts} disabled={loading} className="font-body">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Actualizar"}
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : products.length === 0 ? (
                <p className="text-center text-muted-foreground font-body py-10">No hay productos aún.</p>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {products.map((p) => (
                    <div key={p.node.id} className="flex items-center gap-3 p-3 border border-border rounded-sm">
                      <div className="w-12 h-12 bg-muted rounded-sm overflow-hidden flex-shrink-0">
                        {p.node.images.edges[0]?.node && (
                          <img src={p.node.images.edges[0].node.url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-body font-semibold text-sm truncate">{p.node.title}</h4>
                        <p className="text-xs text-muted-foreground font-body">
                          ${parseFloat(p.node.priceRange.minVariantPrice.amount).toFixed(2)}
                        </p>
                      </div>
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
