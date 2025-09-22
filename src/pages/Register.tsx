import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { toast } = useToast();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { 
          full_name: name, 
          phone, 
          app_role: "member" 
        },
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    
    if (error) {
      toast({
        title: "Chyba při registraci",
        description: error.message,
        variant: "destructive",
      });
    } else if (data.user) {
      toast({
        title: "Registrace úspěšná",
        description: "Zkontrolujte svůj email pro potvrzení účtu.",
      });
      nav("/profile");
    }
    
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-3 rounded-full">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Registrace</CardTitle>
          <CardDescription>
            Vytvořte si nový účet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Jméno a příjmení</Label>
              <Input
                id="name"
                placeholder="Jan Novák"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                placeholder="+420 123 456 789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                placeholder="vas@email.cz"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Heslo</Label>
              <Input
                id="password"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Vytvořit účet
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Již máte účet?{" "}
              <a 
                href="/login" 
                className="text-primary hover:text-primary/80 underline font-medium"
              >
                Přihlaste se
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}