import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable";

interface AdminLoginProps {
  onLogin: (email: string, password: string) => Promise<{ error: any }>;
}

const AdminLogin = ({ onLogin }: AdminLoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Email y contraseña son obligatorios", { position: "top-center" });
      return;
    }
    setLoading(true);
    const { error } = await onLogin(email, password);
    if (error) {
      toast.error("Credenciales incorrectas", { position: "top-center" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <Lock className="h-10 w-10 mx-auto mb-3 text-primary" />
          <CardTitle className="font-heading text-3xl tracking-wider">ADMIN</CardTitle>
          <p className="text-sm text-muted-foreground font-body mt-2">
            Ingresa con tu cuenta de administrador
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="font-body">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yellowmenstore.com"
                className="font-body"
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="password" className="font-body">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="font-body"
                autoComplete="current-password"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-body uppercase tracking-wider"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
