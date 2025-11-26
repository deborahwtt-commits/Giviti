import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, User as UserIcon, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { EditUserProfileDialog } from "@/components/admin/EditUserProfileDialog";

interface UserWithStats {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  eventsCount: number;
  recipientsCount: number;
  purchasedGiftsCount: number;
}

const roleLabels: Record<string, string> = {
  user: "Usuário",
  admin: "Administrador",
  manager: "Gerente",
  support: "Suporte",
  readonly: "Somente Leitura",
};

const roleVariants: Record<string, "default" | "secondary" | "destructive"> = {
  user: "secondary",
  admin: "destructive",
  manager: "default",
  support: "default",
  readonly: "secondary",
};

export default function UserList() {
  const { toast } = useToast();
  const { data: users, isLoading, error } = useQuery<UserWithStats[]>({
    queryKey: ["/api/admin/users/detailed"],
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Erro ao carregar usuários",
        description: "Não foi possível carregar a lista de usuários. Tente novamente.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando usuários...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon" data-testid="button-back-admin">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Lista de Usuários</h1>
            <p className="text-muted-foreground">
              Visualize todos os usuários da plataforma
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-destructive/10">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <p className="text-lg font-semibold text-destructive mb-2">
            Erro ao carregar usuários
          </p>
          <p className="text-muted-foreground mb-4">
            Não foi possível carregar a lista de usuários.
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon" data-testid="button-back-admin">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Lista de Usuários</h1>
          <p className="text-muted-foreground">
            Visualize todos os usuários da plataforma
          </p>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead className="text-center">Eventos</TableHead>
              <TableHead className="text-center">Presenteados</TableHead>
              <TableHead className="text-center">Presentes Comprados</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users && users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      {user.firstName} {user.lastName}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={roleVariants[user.role] || "secondary"}
                      data-testid={`badge-role-${user.id}`}
                    >
                      {roleLabels[user.role] || user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(user.createdAt), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell className="text-center" data-testid={`text-events-${user.id}`}>
                    {user.eventsCount}
                  </TableCell>
                  <TableCell className="text-center" data-testid={`text-recipients-${user.id}`}>
                    {user.recipientsCount}
                  </TableCell>
                  <TableCell className="text-center" data-testid={`text-gifts-${user.id}`}>
                    {user.purchasedGiftsCount}
                  </TableCell>
                  <TableCell className="text-center">
                    <EditUserProfileDialog
                      userId={user.id}
                      userName={`${user.firstName} ${user.lastName}`}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <p className="text-muted-foreground">
                    Nenhum usuário encontrado
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
