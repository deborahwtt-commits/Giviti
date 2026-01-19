import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, User as UserIcon, AlertCircle, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useMemo, useState } from "react";
import { EditUserDialog } from "@/components/admin/EditUserDialog";
import { ResetPasswordButton } from "@/components/admin/ResetPasswordButton";

interface UserWithStats {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  deactivatedBy: string | null;
  deactivatedAt: string | null;
  createdAt: string;
  eventsCount: number;
  recipientsCount: number;
  purchasedGiftsCount: number;
  profileCompleted: boolean;
  registrationSource: string;
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

const ITEMS_PER_PAGE = 10;

export default function UserList() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data: users, isLoading, error } = useQuery<UserWithStats[]>({
    queryKey: ["/api/admin/users/detailed"],
  });

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!searchTerm.trim()) return users;
    
    const term = searchTerm.toLowerCase();
    return users.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const email = user.email.toLowerCase();
      const role = (roleLabels[user.role] || user.role).toLowerCase();
      
      return fullName.includes(term) || email.includes(term) || role.includes(term);
    });
  }, [users, searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar por nome, email ou perfil..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 max-w-md"
          data-testid="input-search-users"
        />
      </div>

      <div className="border rounded-lg">
        <div className="overflow-x-auto">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Questionário</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead className="text-center">Eventos</TableHead>
              <TableHead className="text-center">Presenteados</TableHead>
              <TableHead className="text-center">Presentes Comprados</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers && paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      {user.firstName} {user.lastName}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[180px] truncate" title={user.email}>
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
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        user.registrationSource === "event_invite"
                          ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700"
                          : "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700"
                      }
                      data-testid={`badge-source-${user.id}`}
                    >
                      {user.registrationSource === "event_invite" ? "Convite" : "VIP Pass"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {!user.isActive && user.deactivatedAt ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant="outline"
                            className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 cursor-help"
                            data-testid={`badge-status-${user.id}`}
                          >
                            Inativo
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-sm">
                            <p>
                              {user.deactivatedBy 
                                ? `Inativado por administrador` 
                                : "Auto-desativado pelo usuário"}
                            </p>
                            <p className="text-muted-foreground">
                              em {format(new Date(user.deactivatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Badge
                        variant="outline"
                        className={
                          user.isActive
                            ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600"
                        }
                        data-testid={`badge-status-${user.id}`}
                      >
                        {user.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        user.profileCompleted
                          ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600"
                      }
                      data-testid={`badge-questionnaire-${user.id}`}
                    >
                      {user.profileCompleted ? "Sim" : "Não"}
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
                    <div className="flex items-center justify-center gap-1">
                      <EditUserDialog user={user} />
                      <ResetPasswordButton user={user} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8">
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} de {filteredUsers.length} usuários
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              data-testid="button-prev-page"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              data-testid="button-next-page"
            >
              Próximo
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {filteredUsers.length === 0 && searchTerm && (
        <p className="text-center text-muted-foreground py-4">
          Nenhum usuário encontrado para "{searchTerm}"
        </p>
      )}
    </div>
  );
}
