"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { UserPlus, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [language, setLanguage] = useState("pt-BR");
  const [currency, setCurrency] = useState("BRL");

  const utils = trpc.useUtils();

  // Listar usuários
  const { data: users, isLoading: usersLoading } = trpc.users.list.useQuery(undefined, {
    enabled: !!currentUser,
  });

  // Mutations
  const inviteUserMutation = trpc.users.invite.useMutation({
    onSuccess: () => {
      toast.success("Usuário convidado com sucesso!");
      setIsInviteDialogOpen(false);
      setInviteEmail("");
      setInviteName("");
      utils.users.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao convidar usuário: ${error.message}`);
    },
  });

  const deleteUserMutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      toast.success("Usuário removido com sucesso!");
      setIsDeleteUserDialogOpen(false);
      setSelectedUserId(null);
      utils.users.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao remover usuário: ${error.message}`);
    },
  });

  const deleteAccountMutation = trpc.auth.deleteAccount.useMutation({
    onSuccess: () => {
      toast.success("Conta excluída com sucesso!");
      router.push("/login");
    },
    onError: (error) => {
      toast.error(`Erro ao excluir conta: ${error.message}`);
    },
  });

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "Não disponível";
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  };

  const getRoleBadge = (role: string | null | undefined) => {
    if (role === "admin") {
      return <Badge className="bg-primary text-primary-foreground">Administrador</Badge>;
    }
    return <Badge variant="outline">Usuário</Badge>;
  };

  const handleInviteUser = () => {
    if (!inviteEmail.trim() || !inviteName.trim()) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    inviteUserMutation.mutate({
      email: inviteEmail.trim(),
      name: inviteName.trim(),
    });
  };

  const handleDeleteUser = (userId: number) => {
    setSelectedUserId(userId);
    setIsDeleteUserDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (selectedUserId) {
      deleteUserMutation.mutate({ id: selectedUserId });
    }
  };

  const confirmDeleteAccount = () => {
    deleteAccountMutation.mutate();
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerencie as configurações do sistema e usuários</p>
      </div>

      {/* Gerenciamento de Usuários */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Gerenciamento de Usuários</CardTitle>
            <CardDescription>Convide e gerencie usuários que têm acesso à sua conta</CardDescription>
          </div>
          <Button onClick={() => setIsInviteDialogOpen(true)} className="gap-2">
            <UserPlus className="w-4 h-4" />
            Convidar Usuário
          </Button>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : users && users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Data de Entrada</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name || "Não informado"}</TableCell>
                    <TableCell>{user.email || "Não informado"}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      {user.id !== currentUser?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum usuário encontrado
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preferências do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Preferências do Sistema</CardTitle>
          <CardDescription>Configure as preferências gerais do sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="language">Idioma</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language" className="w-full">
                <SelectValue placeholder="Selecione o idioma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                <SelectItem value="en-US">English (US)</SelectItem>
                <SelectItem value="es-ES">Español (España)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Funcionalidade em desenvolvimento</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Moeda</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency" className="w-full">
                <SelectValue placeholder="Selecione a moeda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BRL">Real (R$)</SelectItem>
                <SelectItem value="USD">Dólar (US$)</SelectItem>
                <SelectItem value="EUR">Euro (€)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Funcionalidade em desenvolvimento</p>
          </div>
        </CardContent>
      </Card>

      {/* Zona de Perigo */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
          <CardDescription>Ações irreversíveis que afetam sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Excluir Conta</p>
              <p className="text-sm text-muted-foreground">
                Exclui permanentemente sua conta e todos os dados associados
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteAccountDialogOpen(true)}
            >
              Excluir Conta
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Convidar Usuário */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convidar Usuário</DialogTitle>
            <DialogDescription>
              Envie um convite para um novo usuário acessar sua conta
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="invite-name">Nome</Label>
              <Input
                id="invite-name"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="Nome do usuário"
                disabled={inviteUserMutation.isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="invite-email">E-mail</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@exemplo.com"
                disabled={inviteUserMutation.isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsInviteDialogOpen(false)}
              disabled={inviteUserMutation.isPending}
            >
              Cancelar
            </Button>
            <Button onClick={handleInviteUser} disabled={inviteUserMutation.isPending}>
              {inviteUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Convidar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog de Excluir Usuário */}
      <AlertDialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este usuário? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteUserMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Dialog de Excluir Conta */}
      <AlertDialog open={isDeleteAccountDialogOpen} onOpenChange={setIsDeleteAccountDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Conta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir sua conta permanentemente? Esta ação não pode ser desfeita e todos os seus dados serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteAccountMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteAccountMutation.isPending}
            >
              {deleteAccountMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir Conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
