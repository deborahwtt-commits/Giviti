import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Gift, Heart, Calendar, Sparkles, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUserSchema, loginUserSchema, type RegisterUser, type LoginUser } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import heroImage from "@assets/generated_images/Hero_celebration_gift_exchange_b57996b1.png";

const SAVED_EMAIL_KEY = "giviti_saved_email";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Login form
  const loginForm = useForm<LoginUser>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterUser>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  // Auto-fill saved email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem(SAVED_EMAIL_KEY);
    if (savedEmail) {
      loginForm.setValue("email", savedEmail);
      setKeepLoggedIn(true);
    }
  }, [loginForm]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginUser) => {
      const params = new URLSearchParams();
      if (keepLoggedIn) {
        params.set("remember", "true");
      }
      return await apiRequest(`/api/login?${params.toString()}`, "POST", data) as any;
    },
    onSuccess: (data: any) => {
      // Save email if "keep logged in" is checked
      // Note: Password is NEVER saved - only the session cookie persists
      if (keepLoggedIn) {
        localStorage.setItem(SAVED_EMAIL_KEY, loginForm.getValues("email"));
      } else {
        localStorage.removeItem(SAVED_EMAIL_KEY);
      }

      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo de volta${data.firstName ? `, ${data.firstName}` : ''}!`,
      });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao fazer login",
        description: error.message || "E-mail ou senha incorretos",
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterUser) => {
      const params = new URLSearchParams();
      if (keepLoggedIn) {
        params.set("remember", "true");
      }
      return await apiRequest(`/api/register?${params.toString()}`, "POST", data) as any;
    },
    onSuccess: (data: any) => {
      // Save email if "keep logged in" is checked
      // Note: Password is NEVER saved - only the session cookie persists
      if (keepLoggedIn) {
        localStorage.setItem(SAVED_EMAIL_KEY, registerForm.getValues("email"));
      }

      toast({
        title: "Conta criada com sucesso!",
        description: `Bem-vindo${data.firstName ? `, ${data.firstName}` : ''}!`,
      });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Não foi possível criar sua conta",
        variant: "destructive",
      });
    },
  });

  const onLoginSubmit = (data: LoginUser) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterUser) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroImage})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-6 py-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left side - Branding */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/90 backdrop-blur-sm flex items-center justify-center">
                  <Gift className="w-9 h-9 text-primary-foreground" />
                </div>
              </div>

              <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-white mb-4">
                Giviti
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-6">
                Presentes Perfeitos, Sempre
              </p>
              <p className="text-lg text-white/80 max-w-lg">
                Nunca mais esqueça uma data importante ou fique sem ideias.
                Descubra presentes personalizados para cada pessoa especial da sua vida.
              </p>
            </div>

            {/* Right side - Auth forms */}
            <Card className="p-8 bg-background/95 backdrop-blur-sm">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login" data-testid="tab-login">Fazer Login</TabsTrigger>
                  <TabsTrigger value="register" data-testid="tab-register">Criar Conta</TabsTrigger>
                </TabsList>

                {/* Login Form */}
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-mail</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="seu@email.com"
                                data-testid="input-login-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Senha</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  type={showPassword ? "text" : "password"}
                                  placeholder="••••••••"
                                  data-testid="input-login-password"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-0 top-0 h-full px-3"
                                  onClick={() => setShowPassword(!showPassword)}
                                  data-testid="button-toggle-password"
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="keep-logged-in-login"
                          checked={keepLoggedIn}
                          onCheckedChange={(checked) => setKeepLoggedIn(checked === true)}
                          data-testid="checkbox-keep-logged-in"
                        />
                        <Label htmlFor="keep-logged-in-login" className="text-sm font-medium cursor-pointer">
                          Manter-me logado neste navegador
                        </Label>
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loginMutation.isPending}
                        data-testid="button-submit-login"
                      >
                        {loginMutation.isPending ? "Entrando..." : "Entrar"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                {/* Register Form */}
                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  value={field.value ?? ""}
                                  placeholder="João"
                                  data-testid="input-register-firstname"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sobrenome</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  value={field.value ?? ""}
                                  placeholder="Silva"
                                  data-testid="input-register-lastname"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-mail</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="seu@email.com"
                                data-testid="input-register-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Senha</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  type={showPassword ? "text" : "password"}
                                  placeholder="••••••••"
                                  data-testid="input-register-password"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-0 top-0 h-full px-3"
                                  onClick={() => setShowPassword(!showPassword)}
                                  data-testid="button-toggle-password-register"
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirmar Senha</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                data-testid="input-register-confirm-password"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="keep-logged-in-register"
                          checked={keepLoggedIn}
                          onCheckedChange={(checked) => setKeepLoggedIn(checked === true)}
                          data-testid="checkbox-keep-logged-in-register"
                        />
                        <Label htmlFor="keep-logged-in-register" className="text-sm font-medium cursor-pointer">
                          Manter-me logado neste navegador
                        </Label>
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={registerMutation.isPending}
                        data-testid="button-submit-register"
                      >
                        {registerMutation.isPending ? "Criando conta..." : "Criar Conta"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading font-semibold text-4xl md:text-5xl text-foreground mb-4">
              Tudo que você precisa para presentear com carinho
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Organize, planeje e encontre os presentes perfeitos com nossa plataforma inteligente
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="p-8 hover-elevate">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Heart className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-2xl text-foreground mb-3">
                Perfis Detalhados
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Crie perfis completos com interesses, hobbies, idade e preferências.
                Quanto mais detalhes, melhores as sugestões personalizadas.
              </p>
            </Card>

            <Card className="p-8 hover-elevate">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                <Calendar className="w-7 h-7 text-accent-foreground" />
              </div>
              <h3 className="font-heading font-semibold text-2xl text-foreground mb-3">
                Eventos Importantes
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Cadastre aniversários, formaturas, casamentos e outras datas especiais.
                Receba lembretes para nunca mais esquecer de presentear.
              </p>
            </Card>

            <Card className="p-8 hover-elevate">
              <div className="w-14 h-14 rounded-xl bg-chart-2/10 flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7 text-chart-2" />
              </div>
              <h3 className="font-heading font-semibold text-2xl text-foreground mb-3">
                Sugestões Inteligentes
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Explore nossa curadoria de presentes organizados por categoria, faixa de preço
                e interesses. Encontre o presente ideal em minutos.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 md:px-6 border-t border-border">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>© 2024 Giviti. Presentes Perfeitos, Sempre.</p>
        </div>
      </footer>
    </div>
  );
}
