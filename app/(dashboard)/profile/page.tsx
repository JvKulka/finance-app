"use client";

import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Edit } from "lucide-react";
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
import { Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/useI18n";

export default function ProfilePage() {
  const { t } = useI18n();
  const { language } = useSystemPreferences();
  const dateLocale = getDateLocale(language);
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
      toast.success(t("profile.saveSuccess"));
      setIsEditDialogOpen(false);
      refresh();
      utils.auth.me.invalidate();
    },
    onError: (error) => {
      toast.error(`${t("profile.saveErrorPrefix")}${error.message}`);
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
    </div>
  );
}
