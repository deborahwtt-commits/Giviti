import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Edit } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from "@shared/schema";

const editUserProfileSchema = z.object({
  ageRange: z.string().optional(),
  gender: z.string().optional(),
  zodiacSign: z.string().optional(),
  giftPreference: z.string().optional(),
  freeTimeActivity: z.string().optional(),
  musicalStyle: z.string().optional(),
  monthlyGiftPreference: z.string().optional(),
  surpriseReaction: z.string().optional(),
  giftPriority: z.string().optional(),
  giftGivingStyle: z.string().optional(),
  specialTalent: z.string().optional(),
  giftsToAvoid: z.string().optional(),
  isCompleted: z.boolean().optional(),
});

type EditUserProfileFormData = z.infer<typeof editUserProfileSchema>;

interface EditUserProfileDialogProps {
  userId: string;
  userName: string;
}

export function EditUserProfileDialog({ userId, userName }: EditUserProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["/api/admin/users", userId, "profile"],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users/${userId}/profile`);
      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }
      return response.json();
    },
    enabled: open,
  });

  const form = useForm<EditUserProfileFormData>({
    resolver: zodResolver(editUserProfileSchema),
    defaultValues: {
      ageRange: "",
      gender: "",
      zodiacSign: "",
      giftPreference: "",
      freeTimeActivity: "",
      musicalStyle: "",
      monthlyGiftPreference: "",
      surpriseReaction: "",
      giftPriority: "",
      giftGivingStyle: "",
      specialTalent: "",
      giftsToAvoid: "",
      isCompleted: false,
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        ageRange: profile.ageRange || "",
        gender: profile.gender || "",
        zodiacSign: profile.zodiacSign || "",
        giftPreference: profile.giftPreference || "",
        freeTimeActivity: profile.freeTimeActivity || "",
        musicalStyle: profile.musicalStyle || "",
        monthlyGiftPreference: profile.monthlyGiftPreference || "",
        surpriseReaction: profile.surpriseReaction || "",
        giftPriority: profile.giftPriority || "",
        giftGivingStyle: profile.giftGivingStyle || "",
        specialTalent: profile.specialTalent || "",
        giftsToAvoid: profile.giftsToAvoid || "",
        isCompleted: profile.isCompleted || false,
      });
    }
  }, [profile, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: EditUserProfileFormData) => {
      return await apiRequest(`/api/admin/users/${userId}/profile`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users", userId, "profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/detailed"] });
      toast({
        title: "Perfil atualizado",
        description: "O perfil do usuário foi atualizado com sucesso.",
      });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Não foi possível atualizar o perfil do usuário.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditUserProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" data-testid={`button-edit-profile-${userId}`}>
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Perfil de {userName}</DialogTitle>
          <DialogDescription>
            Atualize as informações do perfil do usuário. As alterações serão registradas no log de auditoria.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Carregando perfil...
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ageRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Faixa Etária</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-age-range">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="18-25">18-25</SelectItem>
                          <SelectItem value="26-35">26-35</SelectItem>
                          <SelectItem value="36-45">36-45</SelectItem>
                          <SelectItem value="46-60">46-60</SelectItem>
                          <SelectItem value="60+">60+</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gênero</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-gender">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Masculino">Masculino</SelectItem>
                          <SelectItem value="Feminino">Feminino</SelectItem>
                          <SelectItem value="Não-binário">Não-binário</SelectItem>
                          <SelectItem value="Prefiro não informar">Prefiro não informar</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zodiacSign"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Signo do Zodíaco</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-zodiac">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Áries">Áries</SelectItem>
                          <SelectItem value="Touro">Touro</SelectItem>
                          <SelectItem value="Gêmeos">Gêmeos</SelectItem>
                          <SelectItem value="Câncer">Câncer</SelectItem>
                          <SelectItem value="Leão">Leão</SelectItem>
                          <SelectItem value="Virgem">Virgem</SelectItem>
                          <SelectItem value="Libra">Libra</SelectItem>
                          <SelectItem value="Escorpião">Escorpião</SelectItem>
                          <SelectItem value="Sagitário">Sagitário</SelectItem>
                          <SelectItem value="Capricórnio">Capricórnio</SelectItem>
                          <SelectItem value="Aquário">Aquário</SelectItem>
                          <SelectItem value="Peixes">Peixes</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="giftPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferência de Presentes</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-gift-preference">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Práticos">Práticos</SelectItem>
                          <SelectItem value="Experiências">Experiências</SelectItem>
                          <SelectItem value="Criativos">Criativos</SelectItem>
                          <SelectItem value="Luxuosos">Luxuosos</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="freeTimeActivity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Atividade de Tempo Livre</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ex: Leitura, Esportes, Viagens"
                          data-testid="input-free-time-activity"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="musicalStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estilo Musical</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ex: Rock, Pop, Jazz"
                          data-testid="input-musical-style"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="monthlyGiftPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequência de Presentes</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-monthly-gift">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Mensal">Mensal</SelectItem>
                          <SelectItem value="Ocasionalmente">Ocasionalmente</SelectItem>
                          <SelectItem value="Raramente">Raramente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="surpriseReaction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reação a Surpresas</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-surprise-reaction">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Adora">Adora</SelectItem>
                          <SelectItem value="Gosta">Gosta</SelectItem>
                          <SelectItem value="Indiferente">Indiferente</SelectItem>
                          <SelectItem value="Prefere saber antes">Prefere saber antes</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="giftPriority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridade em Presentes</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-gift-priority">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Qualidade">Qualidade</SelectItem>
                          <SelectItem value="Preço">Preço</SelectItem>
                          <SelectItem value="Personalização">Personalização</SelectItem>
                          <SelectItem value="Marca">Marca</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="giftGivingStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estilo de Presentear</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-gift-giving-style">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Planejado">Planejado</SelectItem>
                          <SelectItem value="Espontâneo">Espontâneo</SelectItem>
                          <SelectItem value="Last minute">Last minute</SelectItem>
                          <SelectItem value="DIY">DIY (Faço eu mesmo)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialTalent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Talento Especial</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ex: Fotografia, Culinária"
                          data-testid="input-special-talent"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="giftsToAvoid"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Presentes a Evitar</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ex: Perfumes, Roupas"
                          data-testid="input-gifts-to-avoid"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  data-testid="button-cancel-edit"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-save-profile"
                >
                  {updateProfileMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
