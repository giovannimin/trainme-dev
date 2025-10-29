import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Dumbbell } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // Vérifie la session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate("/");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // --- Inscription email/password ---
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { full_name: fullName },
        },
      });

      if (error) throw error;
      toast.success("Inscription réussie ! Vérifiez vos emails pour confirmer votre compte.");
      setEmail("");
      setPassword("");
      setFullName("");
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  // --- Connexion email/password ---
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Connexion réussie !");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la connexion.");
    } finally {
      setLoading(false);
    }
  };

  // --- Connexion OAuth ---
  const handleOAuthSignIn = async (provider: "google" | "facebook" | "apple") => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || `Erreur lors de la connexion avec ${provider}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-full">
              <Dumbbell className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">CoachReserve</CardTitle>
          <CardDescription>Réservez vos séances de coaching en ligne</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Connexion</TabsTrigger>
              <TabsTrigger value="signup">Inscription</TabsTrigger>
            </TabsList>

            {/* ----------- CONNEXION ----------- */}
            <TabsContent value="signin">
              <div className="space-y-4">
                {/* OAuth */}
                <div className="space-y-3">
                  <Button variant="outline" className="w-full" onClick={() => handleOAuthSignIn("google")}>
                    Continuer avec Google
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => handleOAuthSignIn("facebook")}>
                    Continuer avec Facebook
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => handleOAuthSignIn("apple")}>
                    Continuer avec Apple
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Ou avec email</span>
                  </div>
                </div>

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Mot de passe</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Connexion..." : "Se connecter"}
                  </Button>
                </form>
              </div>
            </TabsContent>

            {/* ----------- INSCRIPTION ----------- */}
            <TabsContent value="signup">
              <div className="space-y-4">
                {/* OAuth */}
                <div className="space-y-3">
                  <Button variant="outline" className="w-full" onClick={() => handleOAuthSignIn("google")}>
                    Continuer avec Google
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => handleOAuthSignIn("facebook")}>
                    Continuer avec Facebook
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => handleOAuthSignIn("apple")}>
                    Continuer avec Apple
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Ou avec email</span>
                  </div>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nom complet</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Jean Dupont"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Inscription..." : "S'inscrire"}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
