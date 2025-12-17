import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserProfileSchema } from "@shared/schema";
import type { UserProfile, InsertUserProfile, GoogleProductCategory } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Loader2, User, Sparkles, ChevronDown, X, KeyRound, Trash2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useLocation } from "wouter";
import { handleAuthError } from "@/lib/authUtils";

type ProfileFormData = z.infer<typeof insertUserProfileSchema>;

export default function Profile() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deleteAccountPassword, setDeleteAccountPassword] = useState("");

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
    retry: (failureCount, error: any) => {
      if (error?.status === 404) return false;
      return failureCount < 3;
    },
    meta: {
      onError: (error: any) => {
        if (error?.status === 401) {
          handleAuthError(toast, setLocation);
        }
      },
    },
  });

  const { data: googleCategories = [] } = useQuery<GoogleProductCategory[]>({
    queryKey: ["/api/google-categories"],
  });

  const { register, handleSubmit, watch, setValue, reset } = useForm<ProfileFormData>({
    resolver: zodResolver(insertUserProfileSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (profile) {
      reset(profile);
    }
  }, [profile, reset]);

  const saveMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      return await apiRequest("/api/profile", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Perfil salvo!",
        description: "Suas preferências foram atualizadas com sucesso.",
      });
    },
    onError: (error: any) => {
      if (error?.status === 401) {
        handleAuthError(toast, setLocation);
      } else {
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar seu perfil. Tente novamente.",
          variant: "destructive",
        });
      }
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    saveMutation.mutate({ ...data, isCompleted: true });
  };

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      return await apiRequest("/api/auth/change-password", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Senha alterada!",
        description: "Sua senha foi atualizada com sucesso.",
      });
      setChangePasswordOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: any) => {
      if (error?.status === 401) {
        handleAuthError(toast, setLocation);
      } else {
        toast({
          title: "Erro ao alterar senha",
          description: error?.message || "Senha atual incorreta ou erro no servidor.",
          variant: "destructive",
        });
      }
    },
  });

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "A nova senha e a confirmação devem ser iguais.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  const deleteAccountMutation = useMutation({
    mutationFn: async (password: string) => {
      return await apiRequest("/api/auth/deactivate-account", "POST", { password });
    },
    onSuccess: () => {
      toast({
        title: "Conta excluída",
        description: "Sua conta foi desativada com sucesso. Você será redirecionado.",
      });
      setDeleteAccountOpen(false);
      setDeleteAccountPassword("");
      // Redirect to login
      setTimeout(() => setLocation("/login"), 1500);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir conta",
        description: error?.message || "Senha incorreta ou erro no servidor.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteAccount = () => {
    if (!deleteAccountPassword) {
      toast({
        title: "Senha obrigatória",
        description: "Digite sua senha para confirmar a exclusão.",
        variant: "destructive",
      });
      return;
    }
    deleteAccountMutation.mutate(deleteAccountPassword);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-12">
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="font-heading font-semibold text-3xl text-foreground">
                  Meu Perfil
                </h1>
                <p className="text-muted-foreground">
                  Conte mais sobre você para receber sugestões ainda mais personalizadas
                </p>
              </div>
            </div>
            
            <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="button-change-password">
                  <KeyRound className="w-4 h-4 mr-2" />
                  Alterar senha
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Alterar senha</DialogTitle>
                  <DialogDescription>
                    Digite sua senha atual e a nova senha desejada.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Senha atual</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Digite sua senha atual"
                      data-testid="input-current-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nova senha</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Digite a nova senha (mínimo 6 caracteres)"
                      data-testid="input-new-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirme a nova senha"
                      data-testid="input-confirm-password"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setChangePasswordOpen(false)}
                    data-testid="button-cancel-password"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleChangePassword}
                    disabled={changePasswordMutation.isPending || !currentPassword || !newPassword || !confirmPassword}
                    data-testid="button-confirm-password"
                  >
                    {changePasswordMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Alterando...
                      </>
                    ) : (
                      "Alterar senha"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Question 1 - Age Range */}
          <Card className="p-6">
            <Label className="text-base font-semibold mb-4 block">
              1. Qual sua faixa etária?
            </Label>
            <RadioGroup
              value={watch("ageRange") || ""}
              onValueChange={(value) => setValue("ageRange", value)}
            >
              <div className="space-y-3">
                {["18–24", "25–34", "35–44", "45–54", "55+"].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`age-${option}`} data-testid={`radio-age-${option}`} />
                    <Label htmlFor={`age-${option}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </Card>

          {/* Question 2 - Gender */}
          <Card className="p-6">
            <Label className="text-base font-semibold mb-4 block">
              2. Como você se identifica?
            </Label>
            <RadioGroup
              value={watch("gender") || ""}
              onValueChange={(value) => setValue("gender", value)}
            >
              <div className="space-y-3">
                {["Mulher", "Homem", "Não-binárie", "Prefiro não informar"].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`gender-${option}`} data-testid={`radio-gender-${option}`} />
                    <Label htmlFor={`gender-${option}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </Card>

          {/* Question 3 - Zodiac Sign */}
          <Card className="p-6">
            <Label className="text-base font-semibold mb-4 block">
              3. Qual é o seu signo?
            </Label>
            <RadioGroup
              value={watch("zodiacSign") || ""}
              onValueChange={(value) => setValue("zodiacSign", value)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem",
                  "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"
                ].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`zodiac-${option}`} data-testid={`radio-zodiac-${option}`} />
                    <Label htmlFor={`zodiac-${option}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </Card>

          {/* Question 4 - Gift Preference */}
          <Card className="p-6">
            <Label className="text-base font-semibold mb-4 block">
              4. O que te faz dizer: "esse presente foi feito pra mim!"?
            </Label>
            <RadioGroup
              value={watch("giftPreference") || ""}
              onValueChange={(value) => setValue("giftPreference", value)}
            >
              <div className="space-y-3">
                {[
                  "Algo super útil que eu nem sabia que precisava",
                  "Algo único e personalizado",
                  "Algo caro e de marca (sem vergonha de ser chique!)",
                  "Algo engraçado ou inesperado",
                  "Uma experiência inesquecível",
                  "Algo feito com intenção e carinho especialmente para mim"
                ].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`pref-${option}`} data-testid={`radio-preference-${option}`} />
                    <Label htmlFor={`pref-${option}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </Card>

          {/* Question 5 - Free Time Activity */}
          <Card className="p-6">
            <Label className="text-base font-semibold mb-4 block">
              5. O que você faz no seu tempo livre (sem julgamentos)?
            </Label>
            <RadioGroup
              value={watch("freeTimeActivity") || ""}
              onValueChange={(value) => setValue("freeTimeActivity", value)}
            >
              <div className="space-y-3">
                {[
                  "Maratono séries como se fosse profissão",
                  "Faço trilha, corro, ou me penduro em algo por aí",
                  "Cozinho receitas que aprendi no TikTok",
                  "Leio livros que compro e não termino (ou finjo que leio)",
                  "Tiro 3 sonecas e ainda reclamo de cansaço"
                ].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`activity-${option}`} data-testid={`radio-activity-${option}`} />
                    <Label htmlFor={`activity-${option}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </Card>

          {/* Question 6 - Musical Style */}
          <Card className="p-6">
            <Label className="text-base font-semibold mb-4 block">
              6. Se você fosse um estilo musical, qual seria?
            </Label>
            <RadioGroup
              value={watch("musicalStyle") || ""}
              onValueChange={(value) => setValue("musicalStyle", value)}
            >
              <div className="space-y-3">
                {[
                  "Rock alternativo com crise existencial",
                  "Pop que me faz dançar até lavando louça",
                  "Jazz, porque sou sofisticado(a)",
                  "Sertanejo/forró porque eu gosto mesmo é de festa",
                  "Lofi, porque sou de boas e meio introspectivo(a)"
                ].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`music-${option}`} data-testid={`radio-music-${option}`} />
                    <Label htmlFor={`music-${option}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </Card>

          {/* Question 7 - Monthly Gift Preference */}
          <Card className="p-6">
            <Label className="text-base font-semibold mb-4 block">
              7. Se pudesse ganhar um presente todo mês, o que seria?
            </Label>
            <RadioGroup
              value={watch("monthlyGiftPreference") || ""}
              onValueChange={(value) => setValue("monthlyGiftPreference", value)}
            >
              <div className="space-y-3">
                {[
                  "Kit surpresa de snacks ou bebidas diferentes",
                  "Livros ou HQs selecionados com base no meu gosto",
                  "Um objeto de decoração ou item criativo",
                  "Um vale para alguma experiência (massagem, escape room, curso, etc.)",
                  "Um mimo tech (acessórios, gadgets, apps)",
                  "Um almoço ou jantar especial com comidinhas que amo!"
                ].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`monthly-${option}`} data-testid={`radio-monthly-${option}`} />
                    <Label htmlFor={`monthly-${option}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </Card>

          {/* Question 8 - Surprise Reaction */}
          <Card className="p-6">
            <Label className="text-base font-semibold mb-4 block">
              8. Como você reage a surpresas?
            </Label>
            <RadioGroup
              value={watch("surpriseReaction") || ""}
              onValueChange={(value) => setValue("surpriseReaction", value)}
            >
              <div className="space-y-3">
                {[
                  "Amo! Se eu não tiver um mini infarto, nem valeu",
                  "Gosto, mas me avisa antes só pra eu me arrumar",
                  "Prefiro o previsível — mas bem escolhido",
                  "Só gosto se eu puder trocar depois 😅"
                ].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`surprise-${option}`} data-testid={`radio-surprise-${option}`} />
                    <Label htmlFor={`surprise-${option}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </Card>

          {/* Question 9 - Gift Priority */}
          <Card className="p-6">
            <Label className="text-base font-semibold mb-4 block">
              9. Quando o assunto é presente, você prefere:
            </Label>
            <RadioGroup
              value={watch("giftPriority") || ""}
              onValueChange={(value) => setValue("giftPriority", value)}
            >
              <div className="space-y-3">
                {[
                  "Praticidade acima de tudo",
                  "Beleza, mesmo que eu nunca vá usar",
                  "Emoção — quero sentir algo",
                  "Surpresa — não importa o quê",
                  "Customização — só meu, com minha cara"
                ].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`priority-${option}`} data-testid={`radio-priority-${option}`} />
                    <Label htmlFor={`priority-${option}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </Card>

          {/* Question 10 - Gift Giving Style */}
          <Card className="p-6">
            <Label className="text-base font-semibold mb-4 block">
              10. Complete: Eu sou do tipo que…
            </Label>
            <RadioGroup
              value={watch("giftGivingStyle") || ""}
              onValueChange={(value) => setValue("giftGivingStyle", value)}
            >
              <div className="space-y-3">
                {[
                  "Compra presente com um mês de antecedência e embrulha com perfeição",
                  "Lembra do presente no caminho pra festa",
                  "Dá presente criativo, mas duvidoso",
                  "Pede ajuda pra escolher",
                  "Finge que esqueceu e inventa uma desculpa (mas depois compensa)"
                ].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`style-${option}`} data-testid={`radio-style-${option}`} />
                    <Label htmlFor={`style-${option}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </Card>

          {/* Question 11 - Special Talent */}
          <Card className="p-6">
            <Label className="text-base font-semibold mb-4 block">
              11. Você tem algum talento ou habilidade especial?
            </Label>
            <RadioGroup
              value={watch("specialTalent") || ""}
              onValueChange={(value) => setValue("specialTalent", value)}
            >
              <div className="space-y-3">
                {[
                  "Sim, sou bom/boa em cozinhar (doces, pratos especiais, etc.)",
                  "Sim, faço artesanato ou DIY (decoração, lembrancinhas, etc.)",
                  "Sim, tenho habilidades com arte (pintura, desenho, caligrafia, etc.)",
                  "Sim, costuro, bordo ou faço crochê/tricô",
                  "Sim, sei escrever textos/cartas/poemas lindos",
                  "Sim, mas é outro talento (ex: música, fotografia, edição de vídeo)",
                  "Não tenho nenhum talento criativo (mas tô aqui pra compensar com um bom presente!)",
                  "Nunca tentei, mas toparia se tiver uma boa ideia!"
                ].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`talent-${option}`} data-testid={`radio-talent-${option}`} />
                    <Label htmlFor={`talent-${option}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </Card>

          {/* Question 12 - Gifts to Avoid */}
          <Card className="p-6">
            <Label htmlFor="gifts-to-avoid" className="text-base font-semibold mb-4 block">
              12. O que você não gosta de ganhar?
            </Label>
            <Textarea
              id="gifts-to-avoid"
              placeholder="Ex: Roupas, perfumes, chocolates, livros de autoajuda..."
              value={watch("giftsToAvoid") || ""}
              onChange={(e) => setValue("giftsToAvoid", e.target.value)}
              maxLength={256}
              rows={3}
              className="resize-none"
              data-testid="textarea-gifts-to-avoid"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {watch("giftsToAvoid")?.length || 0}/256 caracteres
            </p>
          </Card>

          {/* Question 13 - Interests */}
          <Card className="p-6">
            <Label className="text-base font-semibold mb-4 block">
              13. Quais são seus interesses?
            </Label>
            <p className="text-sm text-muted-foreground mb-4">
              Selecione as categorias que mais combinam com você
            </p>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  data-testid="button-interests-dropdown"
                >
                  <span className="text-muted-foreground">
                    {(watch("interests") || []).length > 0
                      ? `${(watch("interests") || []).length} interesse(s) selecionado(s)`
                      : "Selecionar interesses..."}
                  </span>
                  <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <div className="max-h-60 overflow-y-auto p-2">
                  {googleCategories.filter(cat => cat.isActive).map((category) => {
                    const currentInterests = watch("interests") || [];
                    const isSelected = currentInterests.includes(category.namePtBr);
                    
                    return (
                      <div
                        key={category.id}
                        className="flex items-center space-x-2 p-2 hover-elevate rounded-md cursor-pointer"
                        onClick={() => {
                          const newInterests = isSelected
                            ? currentInterests.filter((i) => i !== category.namePtBr)
                            : [...currentInterests, category.namePtBr];
                          setValue("interests", newInterests);
                        }}
                        data-testid={`checkbox-interest-${category.id}`}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            const newInterests = checked
                              ? [...currentInterests, category.namePtBr]
                              : currentInterests.filter((i) => i !== category.namePtBr);
                            setValue("interests", newInterests);
                          }}
                        />
                        <span className="text-sm">{category.namePtBr}</span>
                      </div>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>

            {(watch("interests") || []).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {(watch("interests") || []).map((interest) => (
                  <Badge
                    key={interest}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => {
                      const currentInterests = watch("interests") || [];
                      setValue("interests", currentInterests.filter((i) => i !== interest));
                    }}
                    data-testid={`badge-interest-${interest}`}
                  >
                    {interest}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </Card>

          <div className="flex justify-end gap-4 pt-6">
            <Button
              type="submit"
              size="lg"
              disabled={saveMutation.isPending}
              data-testid="button-save-profile"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Salvar Perfil
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Danger Zone */}
        <Card className="mt-12 p-6 border-destructive/50">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h2 className="text-lg font-semibold text-destructive">Zona de Perigo</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Ações irreversíveis que afetam permanentemente sua conta.
          </p>
          
          <Dialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="destructive" 
                data-testid="button-delete-account"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir minha conta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-destructive">Excluir conta</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja excluir sua conta? Esta ação desativará seu acesso ao sistema.
                  Seus dados serão mantidos para preservar o histórico, mas você não poderá mais fazer login.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="delete-password">Digite sua senha para confirmar</Label>
                  <Input
                    id="delete-password"
                    type="password"
                    value={deleteAccountPassword}
                    onChange={(e) => setDeleteAccountPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    data-testid="input-delete-password"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteAccountOpen(false);
                    setDeleteAccountPassword("");
                  }}
                  data-testid="button-cancel-delete"
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={deleteAccountMutation.isPending || !deleteAccountPassword}
                  data-testid="button-confirm-delete"
                >
                  {deleteAccountMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    "Excluir minha conta"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </Card>
      </main>
    </div>
  );
}
