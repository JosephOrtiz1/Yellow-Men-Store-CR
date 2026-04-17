import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Nombre muy corto").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  phone: z.string().trim().min(6, "Teléfono inválido").max(30),
  address: z.string().trim().min(5, "Dirección muy corta").max(500),
  password: z.string().min(6, "Mínimo 6 caracteres").max(72),
});

const loginSchema = z.object({
  email: z.string().trim().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as any)?.from || "/";

  const [loading, setLoading] = useState(false);

  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message, { position: "top-center" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message, { position: "top-center" });
    } else {
      toast.success("¡Bienvenido!", { position: "top-center" });
      navigate(redirectTo, { replace: true });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signupSchema.safeParse({ fullName, email, phone, address, password });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message, { position: "top-center" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: parsed.data.fullName,
          phone: parsed.data.phone,
          address: parsed.data.address,
        },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message, { position: "top-center" });
    } else {
      toast.success("Cuenta creada. Revisa tu email para confirmar tu cuenta antes de iniciar sesión.", {
        position: "top-center",
        duration: 6000,
      });
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <UserIcon className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="font-heading text-3xl tracking-wider">CUENTA</CardTitle>
          <CardDescription className="font-body">Inicia sesión o regístrate para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid grid-cols-2 w-full mb-4">
              <TabsTrigger value="login" className="font-body">Iniciar sesión</TabsTrigger>
              <TabsTrigger value="signup" className="font-body">Registrarse</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label className="font-body">Email</Label>
                  <Input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="font-body" />
                </div>
                <div>
                  <Label className="font-body">Contraseña</Label>
                  <Input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="font-body" />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-body uppercase tracking-wider">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-3">
                <div>
                  <Label className="font-body">Nombre completo</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="font-body" />
                </div>
                <div>
                  <Label className="font-body">Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="font-body" />
                </div>
                <div>
                  <Label className="font-body">Teléfono</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+506 8888 8888" className="font-body" />
                </div>
                <div>
                  <Label className="font-body">Dirección</Label>
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} className="font-body" />
                </div>
                <div>
                  <Label className="font-body">Contraseña</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="font-body" />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-body uppercase tracking-wider">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear cuenta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-center text-xs text-muted-foreground font-body mt-4">
            <Link to="/" className="hover:text-primary">← Volver al inicio</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
