"use client";

import { useEffect, useState } from "react";
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
import { getDateLocale } from "@/lib/i18n/date";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/useI18n";

export default function SettingsPage() {
  const SYSTEM_LANGUAGE_STORAGE_KEY = "system-preference-language";
  const SYSTEM_CURRENCY_STORAGE_KEY = "system-preference-currency";
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const { t, locale } = useI18n();
  const isPt = locale === "pt";
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteWhatsapp, setInviteWhatsapp] = useState("");
  const [savedLanguage, setSavedLanguage] = useState("es-PY");
  const [savedCurrency, setSavedCurrency] = useState("PYG");
  const [language, setLanguage] = useState("es-PY");
  const [currency, setCurrency] = useState("PYG");
  const dateLocale = getDateLocale(language);

  const utils = trpc.useUtils();

  // Listar usuários
  const { data: users, isLoading: usersLoading } = trpc.users.list.useQuery(undefined, {
    enabled: !!currentUser,
  });

  // Mutations
  const inviteUserMutation = trpc.users.invite.useMutation({
    onSuccess: () => {
      toast.success(isPt ? "Usuário convidado com sucesso!" : "¡Usuario invitado con éxito!");
      setIsInviteDialogOpen(false);
      setInviteEmail("");
      setInviteName("");
      setInviteWhatsapp("");
      utils.users.list.invalidate();
    },
    onError: (error) => {
      toast.error(`${isPt ? "Erro ao convidar usuário" : "Error al invitar al usuario"}: ${error.message}`);
    },
  });

  const deleteUserMutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      toast.success(isPt ? "Usuário removido com sucesso!" : "¡Usuario eliminado con éxito!");
      setIsDeleteUserDialogOpen(false);
      setSelectedUserId(null);
      utils.users.list.invalidate();
    },
    onError: (error) => {
      toast.error(`${isPt ? "Erro ao remover usuário" : "Error al eliminar el usuario"}: ${error.message}`);
    },
  });

  const deleteAccountMutation = trpc.auth.deleteAccount.useMutation({
    onSuccess: () => {
      toast.success(isPt ? "Conta removida com sucesso!" : "¡Cuenta eliminada con éxito!");
      router.push("/login");
    },
    onError: (error) => {
      toast.error(`${isPt ? "Erro ao remover conta" : "Error al eliminar la cuenta"}: ${error.message}`);
    },
  });

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return isPt ? "Não disponível" : "No disponible";
    return format(new Date(date), "dd/MM/yyyy", { locale: dateLocale });
  };

  const getRoleBadge = (role: string | null | undefined) => {
    if (role === "admin") {
      return <Badge className="bg-primary text-primary-foreground">{isPt ? "Administrador" : "Administrador"}</Badge>;
    }
    return <Badge variant="outline">{isPt ? "Usuário" : "Usuario"}</Badge>;
  };

  const handleInviteUser = () => {
    if (!inviteEmail.trim() || !inviteName.trim() || !inviteWhatsapp.trim()) {
      toast.error(isPt ? "Por favor, preencha todos os campos" : "Por favor, completá todos los campos");
      return;
    }
    inviteUserMutation.mutate({
      email: inviteEmail.trim(),
      name: inviteName.trim(),
      whatsapp: inviteWhatsapp.trim(),
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

  useEffect(() => {
    const storedLanguage = localStorage.getItem(SYSTEM_LANGUAGE_STORAGE_KEY);
    const storedCurrency = localStorage.getItem(SYSTEM_CURRENCY_STORAGE_KEY);

    if (storedLanguage) {
      setSavedLanguage(storedLanguage);
      setLanguage(storedLanguage);
    }

    if (storedCurrency) {
      setSavedCurrency(storedCurrency);
      setCurrency(storedCurrency);
    }
  }, []);

  const hasSystemPreferenceChanges = language !== savedLanguage || currency !== savedCurrency;

  const handleSaveSystemPreferences = () => {
    localStorage.setItem(SYSTEM_LANGUAGE_STORAGE_KEY, language);
    localStorage.setItem(SYSTEM_CURRENCY_STORAGE_KEY, currency);
    document.documentElement.lang = language.startsWith("pt") ? "pt-BR" : "es";
    setSavedLanguage(language);
    setSavedCurrency(currency);
    toast.success(t("settings.saved"));
    window.location.reload();
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">{t("settings.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("settings.subtitle")}</p>
      </div>

      {/* Gestión de Usuarios */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{isPt ? "Gestão de Usuários" : "Gestión de Usuarios"}</CardTitle>
            <CardDescription>{isPt ? "Convide e gerencie os usuários que têm acesso à sua conta" : "Invitá y gestioná a los usuarios que tienen acceso a tu cuenta"}</CardDescription>
          </div>
          <Button onClick={() => setIsInviteDialogOpen(true)} className="gap-2">
            <UserPlus className="w-4 h-4" />
            {isPt ? "Convidar Usuário" : "Invitar Usuario"}
          </Button>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="text-center py-8 text-muted-foreground">{isPt ? "Carregando..." : "Cargando..."}</div>
          ) : users && users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isPt ? "Nome" : "Nombre"}</TableHead>
                  <TableHead>{isPt ? "E-mail" : "Correo electrónico"}</TableHead>
                  <TableHead>{isPt ? "Perfil" : "Rol"}</TableHead>
                  <TableHead>{isPt ? "Data de Entrada" : "Fecha de Ingreso"}</TableHead>
                  <TableHead className="text-right">{isPt ? "Ações" : "Acciones"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name || (isPt ? "Não informado" : "No informado")}</TableCell>
                    <TableCell>{user.email || (isPt ? "Não informado" : "No informado")}</TableCell>
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
              {isPt ? "Nenhum usuário encontrado" : "No se encontraron usuarios"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preferencias del Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.systemPreferences")}</CardTitle>
          <CardDescription>{t("settings.systemPreferencesDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="language">{t("settings.language")}</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language" className="w-full">
                <SelectValue placeholder="Seleccioná el idioma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es-PY">{t("settings.languageOptionEs")}</SelectItem>
                <SelectItem value="pt-BR">{t("settings.languageOptionPt")}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{t("settings.inDevelopment")}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">{t("settings.currency")}</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency" className="w-full">
                <SelectValue placeholder="Seleccioná la moneda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PYG">{t("settings.currencyOptionPyg")}</SelectItem>
                <SelectItem value="BRL">{t("settings.currencyOptionBrl")}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{t("settings.inDevelopment")}</p>
          </div>
          <Button onClick={handleSaveSystemPreferences} disabled={!hasSystemPreferenceChanges}>
            {t("settings.save")}
          </Button>
        </CardContent>
      </Card>

      {/* Zona de Peligro */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">{isPt ? "Zona de Perigo" : "Zona de Peligro"}</CardTitle>
          <CardDescription>{isPt ? "Ações irreversíveis que afetam sua conta" : "Acciones irreversibles que afectan tu cuenta"}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{isPt ? "Excluir Conta" : "Eliminar Cuenta"}</p>
              <p className="text-sm text-muted-foreground">
                {isPt ? "Exclui permanentemente sua conta e todos os dados associados" : "Elimina permanentemente tu cuenta y todos los datos asociados"}
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteAccountDialogOpen(true)}
            >
              {isPt ? "Excluir Conta" : "Eliminar Cuenta"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Invitar Usuario */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isPt ? "Convidar Usuário" : "Invitar Usuario"}</DialogTitle>
            <DialogDescription>
              {isPt ? "Envie um convite para um novo usuário acessar sua conta" : "Enviá una invitación a un nuevo usuario para acceder a tu cuenta"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="invite-name">{isPt ? "Nome" : "Nombre"}</Label>
              <Input
                id="invite-name"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder={isPt ? "Nome do usuário" : "Nombre del usuario"}
                disabled={inviteUserMutation.isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="invite-email">{isPt ? "E-mail" : "Correo electrónico"}</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                disabled={inviteUserMutation.isPending}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="invite-whatsapp">{isPt ? "Telefone WhatsApp" : "Teléfono WhatsApp"}</Label>
              <Input
                id="invite-whatsapp"
                type="tel"
                value={inviteWhatsapp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setInviteWhatsapp(value);
                }}
                placeholder="0981234567"
                disabled={inviteUserMutation.isPending}
                required
                maxLength={15}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsInviteDialogOpen(false)}
              disabled={inviteUserMutation.isPending}
            >
              {isPt ? "Cancelar" : "Cancelar"}
            </Button>
            <Button onClick={handleInviteUser} disabled={inviteUserMutation.isPending}>
              {inviteUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPt ? "Convidar" : "Invitar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog de Eliminar Usuario */}
      <AlertDialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isPt ? "Excluir Usuário" : "Eliminar Usuario"}</AlertDialogTitle>
            <AlertDialogDescription>
              {isPt ? "Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita." : "¿Estás seguro de que querés eliminar este usuario? Esta acción no se puede deshacer."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteUserMutation.isPending}>{isPt ? "Cancelar" : "Cancelar"}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPt ? "Excluir" : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Dialog de Eliminar Cuenta */}
      <AlertDialog open={isDeleteAccountDialogOpen} onOpenChange={setIsDeleteAccountDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isPt ? "Excluir Conta" : "Eliminar Cuenta"}</AlertDialogTitle>
            <AlertDialogDescription>
              {isPt ? "Tem certeza que deseja excluir sua conta permanentemente? Esta ação não pode ser desfeita e todos os seus dados serão perdidos." : "¿Estás seguro de que querés eliminar tu cuenta de forma permanente? Esta acción no se puede deshacer y todos tus datos se perderán."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteAccountMutation.isPending}>{isPt ? "Cancelar" : "Cancelar"}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteAccountMutation.isPending}
            >
              {deleteAccountMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPt ? "Excluir Conta" : "Eliminar Cuenta"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
