"use client";

import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Edit, Loader2, Lock } from "lucide-react";
import { format } from "date-fns";
import { getDateLocale } from "@/lib/i18n/date";
import { useState, useEffect } from "react";
import { useSystemPreferences } from "@/lib/i18n/preferences";
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
import { useI18n } from "@/lib/i18n/useI18n";

export default function ProfilePage() {
  const { t } = useI18n();
  const { language } = useSystemPreferences();
  const dateLocale = getDateLocale(language);
  const { user, loading, refresh } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const utils = trpc.useUtils();

  // Buscar informações completas do usuário (com createdAt e lastSignedIn)
  const { data: fullUser, isLoading: userLoading } = trpc.auth.me.useQuery(undefined, {
    enabled: !loading && !!user,
  });

  const [name, setName] = useState(fullUser?.name || user?.name || "");

  const updateMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      toast.success(t("profile.saveSuccess"));
      setIsEditDialogOpen(false);
      refresh();
      utils.auth.me.invalidate();
    },
    onError: (error) => {
      toast.error(`${t("profile.saveErrorPrefix")}${error.message}`);
    },
  });

  const changePasswordMutation = trpc.auth.changePassword.useMutation({
    onSuccess: () => {
      toast.success(t("profile.passwordChangeSuccess"));
      setIsPasswordDialogOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      utils.auth.me.invalidate();
    },
    onError: (error) => {
      toast.error(`${t("profile.passwordChangeErrorPrefix")}${error.message}`);
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
    if (!date) return t("profile.notAvailable");
    return format(new Date(date), "dd/MM/yyyy", { locale: dateLocale });
  };

  const getRoleLabel = (role: string | null | undefined) => {
    if (role === "admin") return t("profile.admin");
    if (role === "user") return t("profile.user");
    return t("profile.undefinedRole");
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error(t("profile.nameRequired"));
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

  useEffect(() => {
    if (!isPasswordDialogOpen) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [isPasswordDialogOpen]);

  if (loading || userLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const displayUser = fullUser || user;
  const hasLocalPassword = Boolean(
    displayUser && "hasLocalPassword" in displayUser && displayUser.hasLocalPassword
  );

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast.error(t("profile.passwordMismatch"));
      return;
    }
    changePasswordMutation.mutate({
      newPassword,
      ...(hasLocalPassword ? { currentPassword } : {}),
    });
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">{t("profile.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("profile.subtitle")}</p>
      </div>

      {/* Información Personal */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("profile.personalInfo")}</CardTitle>
            <CardDescription>{t("profile.personalInfoDesc")}</CardDescription>
          </div>
          <Button onClick={() => setIsEditDialogOpen(true)} className="gap-2">
            <Edit className="w-4 h-4" />
            {t("profile.editProfile")}
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
              <p className="font-medium">{t("profile.profilePhoto")}</p>
              <p className="text-sm text-muted-foreground">
                {t("profile.profilePhotoHint")}
              </p>
            </div>
          </div>

          {/* Nombre Completo */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">{t("profile.fullName")}</label>
            <p className="text-lg font-medium mt-1">{displayUser?.name || t("profile.notInformed")}</p>
          </div>

          {/* Correo */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">{t("profile.email")}</label>
            <p className="text-lg font-medium mt-1">{displayUser?.email || t("profile.notInformed")}</p>
          </div>

          {/* Método de Login */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">{t("profile.loginMethod")}</label>
            <p className="text-lg font-medium mt-1">{displayUser?.loginMethod || t("profile.notInformed")}</p>
          </div>

          {/* Rol */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">{t("profile.role")}</label>
            <p className="text-lg font-medium mt-1">{getRoleLabel(displayUser?.role)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Información de la Cuenta */}
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.accountInfo")}</CardTitle>
          <CardDescription>{t("profile.accountInfoDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">{t("profile.createdAt")}</label>
              <p className="text-lg font-medium mt-1">
                {displayUser?.createdAt ? formatDate(displayUser.createdAt) : t("profile.notAvailable")}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">{t("profile.lastAccess")}</label>
              <p className="text-lg font-medium mt-1">
                {displayUser?.lastSignedIn ? formatDate(displayUser.lastSignedIn) : t("profile.notAvailable")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("profile.securityTitle")}</CardTitle>
            <CardDescription>{t("profile.securityDesc")}</CardDescription>
          </div>
          <Button
            onClick={() => setIsPasswordDialogOpen(true)}
            variant="outline"
            className="gap-2"
          >
            <Lock className="w-4 h-4" />
            {t("profile.changePasswordButton")}
          </Button>
        </CardHeader>
        <CardContent>
          {!hasLocalPassword ? (
            <div className="rounded-lg border border-muted bg-muted/40 p-4 space-y-2">
              <p className="font-medium">{t("profile.noLocalPasswordTitle")}</p>
              <p className="text-sm text-muted-foreground">{t("profile.noLocalPasswordBody")}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Dialog de Edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("profile.editTitle")}</DialogTitle>
            <DialogDescription>{t("profile.editDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t("profile.fullName")}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("profile.fullNamePlaceholder")}
                disabled={updateMutation.isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">{t("profile.email")}</Label>
              <Input
                id="email"
                value={displayUser?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                {t("profile.emailReadonly")}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={updateMutation.isPending}
            >
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("profile.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("profile.passwordDialogTitle")}</DialogTitle>
            <DialogDescription>
              {hasLocalPassword
                ? t("profile.passwordDialogDescription")
                : t("profile.definePasswordDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {hasLocalPassword ? (
              <div className="grid gap-2">
                <Label htmlFor="current-pw">{t("profile.passwordCurrent")}</Label>
                <Input
                  id="current-pw"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={changePasswordMutation.isPending}
                />
              </div>
            ) : null}
            <div className="grid gap-2">
              <Label htmlFor="new-pw">{t("profile.passwordNew")}</Label>
              <Input
                id="new-pw"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={changePasswordMutation.isPending}
                minLength={6}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-pw">{t("profile.passwordConfirm")}</Label>
              <Input
                id="confirm-pw"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={changePasswordMutation.isPending}
                minLength={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPasswordDialogOpen(false)}
              disabled={changePasswordMutation.isPending}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={
                changePasswordMutation.isPending ||
                !newPassword ||
                !confirmPassword ||
                (hasLocalPassword && !currentPassword)
              }
            >
              {changePasswordMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("profile.changePasswordButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
