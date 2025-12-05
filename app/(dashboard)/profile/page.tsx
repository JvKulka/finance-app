"use client";

import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Edit } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user, loading, refresh } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const utils = trpc.useUtils();

  // Buscar informações completas do usuário (com createdAt e lastSignedIn)
  const { data: fullUser, isLoading: userLoading } = trpc.auth.me.useQuery(undefined, {
    enabled: !loading && !!user,
  });

  const [name, setName] = useState(fullUser?.name || user?.name || "");

  const updateMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Perfil atualizado com sucesso!");
      setIsEditDialogOpen(false);
      refresh();
      utils.auth.me.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar perfil: ${error.message}`);
    },
  });

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "Não disponível";
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  };

  const getRoleLabel = (role: string | null | undefined) => {
    if (role === "admin") return "Administrador";
    if (role === "user") return "Usuário";
    return "Não definido";
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Por favor, informe o nome");
      return;
    }
    updateMutation.mutate({ name: name.trim() });
  };

  // Atualizar nome quando o diálogo abrir ou quando o usuário mudar
  useEffect(() => {
    if (isEditDialogOpen) {
      setName(fullUser?.name || user?.name || "");
    }
  }, [isEditDialogOpen, fullUser, user]);

  if (loading || userLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const displayUser = fullUser || user;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Perfil</h1>
        <p className="text-muted-foreground mt-1">Gerencie suas informações pessoais</p>
      </div>

      {/* Informações Pessoais */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>Atualize seus dados de perfil</CardDescription>
          </div>
          <Button onClick={() => setIsEditDialogOpen(true)} className="gap-2">
            <Edit className="w-4 h-4" />
            Editar Perfil
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarFallback className="text-2xl font-semibold bg-primary text-primary-foreground">
                {getInitials(displayUser?.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">Foto de perfil</p>
              <p className="text-sm text-muted-foreground">
                As iniciais do seu nome são usadas como avatar
              </p>
            </div>
          </div>

          {/* Nome Completo */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
            <p className="text-lg font-medium mt-1">{displayUser?.name || "Não informado"}</p>
          </div>

          {/* E-mail */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">E-mail</label>
            <p className="text-lg font-medium mt-1">{displayUser?.email || "Não informado"}</p>
          </div>

          {/* Método de Login */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Método de Login</label>
            <p className="text-lg font-medium mt-1">{displayUser?.loginMethod || "Não informado"}</p>
          </div>

          {/* Função */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Função</label>
            <p className="text-lg font-medium mt-1">{getRoleLabel(displayUser?.role)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Informações da Conta */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Conta</CardTitle>
          <CardDescription>Detalhes sobre sua conta no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Data de Criação</label>
              <p className="text-lg font-medium mt-1">
                {displayUser?.createdAt ? formatDate(displayUser.createdAt) : "Não disponível"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Último Acesso</label>
              <p className="text-lg font-medium mt-1">
                {displayUser?.lastSignedIn ? formatDate(displayUser.lastSignedIn) : "Não disponível"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>Atualize suas informações pessoais</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                disabled={updateMutation.isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                value={displayUser?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                O e-mail não pode ser alterado
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={updateMutation.isPending}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
