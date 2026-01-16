import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Gift, Eye, EyeOff, Loader2, PartyPopper, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { z } from "zod";

const inviteRegisterSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type InviteRegisterForm = z.infer<typeof inviteRegisterSchema>;

interface InviteRegisterProps {
  params: { token: string };
}

export default function InviteRegister({ params }: InviteRegisterProps) {
  const token = params.token;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const { data: validation, isLoading: validating, error: validationError } = useQuery<{
    valid: boolean;
    inviterName: string;
    inviteeEmail: string;
    expiresAt: string;
    message?: string;
  }>({
    queryKey: ["/api/invitations/validate", token],
    queryFn: async () => {
      const res = await fetch(`/api/invitations/validate/${token}`);
      return res.json();
    },
    enabled: !!token,
  });

  const form = useForm<InviteRegisterForm>({
    resolver: zodResolver(inviteRegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  useEffect(() => {
    if (validation?.inviteeEmail) {
      form.setValue("email", validation.inviteeEmail);
    }
  }, [validation, form]);

  const registerMutation = useMutation({
    mutationFn: async (data: InviteRegisterForm) => {
      return await apiRequest("/api/register-invite", "POST", {
        ...data,
        inviteToken: token,
      }) as any;
    },
    onSuccess: async (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Conta criada com sucesso!",
        description: `Bem-vindo ao Giviti${data.firstName ? `, ${data.firstName}` : ''}!`,
      });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      let errorMessage = "Não foi possível criar a conta";
      
      if (error.message) {
        const jsonMatch = error.message.match(/\{.*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            errorMessage = parsed.message || errorMessage;
          } catch {
            errorMessage = error.message;
          }
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InviteRegisterForm) => {
    registerMutation.mutate(data);
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Validando seu convite...</p>
        </div>
      </div>
    );
  }

  if (!validation?.valid || validationError) {
    const errorMessage = validation?.message || "Este convite não é válido ou já expirou.";
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <Gift className="h-8 w-8 text-red-500" />
            </div>
            <CardTitle className="text-xl">Convite Inválido</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => setLocation("/")} variant="outline" data-testid="button-go-home">
              Ir para a página inicial
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <PartyPopper className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Você foi escolhido(a)!
            <Sparkles className="h-5 w-5 text-yellow-500" />
          </CardTitle>
          <CardDescription className="mt-2">
            <strong>{validation.inviterName}</strong> te convidou para o Giviti!
            <br />
            <span className="text-primary font-medium">Seu convite já é seu Passe VIP.</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="seu@email.com"
                        disabled
                        data-testid="input-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Seu nome"
                          data-testid="input-first-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sobrenome</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Seu sobrenome"
                          data-testid="input-last-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Mínimo 6 caracteres"
                          data-testid="input-password"
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

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Senha</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="Digite a senha novamente"
                        data-testid="input-confirm-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending}
                data-testid="button-register"
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  <>
                    <Gift className="mr-2 h-4 w-4" />
                    Criar minha conta
                  </>
                )}
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Já tem uma conta?{" "}
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => setLocation("/")}
              data-testid="link-login"
            >
              Fazer login
            </Button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
