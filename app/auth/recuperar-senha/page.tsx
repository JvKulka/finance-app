"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc/client";
import { useI18n } from "@/lib/i18n/useI18n";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function AuthRecuperarSenhaPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [sessionReady, setSessionReady] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);
  const [booting, setBooting] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      try {
        const supabase = createSupabaseBrowserClient();
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          window.history.replaceState({}, "", url.pathname);
        } else {
          const rawHash = window.location.hash.replace(/^#/, "");
          const params = new URLSearchParams(rawHash);
          const access_token = params.get("access_token");
          const refresh_token = params.get("refresh_token");
          if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({ access_token, refresh_token });
            if (error) throw error;
            window.history.replaceState({}, "", url.pathname);
          } else {
            if (!cancelled) {
              setInvalidLink(true);
              setBooting(false);
            }
            return;
          }
        }
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token) {
          if (!cancelled) {
            setInvalidLink(true);
            setBooting(false);
          }
          return;
        }
        if (!cancelled) {
          setSessionReady(true);
          setBooting(false);
        }
      } catch {
        if (!cancelled) {
          setInvalidLink(true);
          setBooting(false);
        }
      }
    }
    boot();
    return () => {
      cancelled = true;
    };
  }, []);

  const completeMutation = trpc.auth.completePasswordRecovery.useMutation({
    onSuccess: async () => {
      toast.success(t("recoveryPassword.success"));
      try {
        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut();
      } catch {
        /* ignore */
      }
      router.push("/login");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error(t("recoveryPassword.mismatch"));
      return;
    }
    const supabase = createSupabaseBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      toast.error(t("recoveryPassword.invalidLink"));
      return;
    }
    completeMutation.mutate({ accessToken: session.access_token, newPassword });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <Image
              src="/images/LOGO.png"
              alt="FinanZap"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>
          <div className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">{t("recoveryPassword.title")}</CardTitle>
            <CardDescription>{t("recoveryPassword.subtitle")}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {booting ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : invalidLink ? (
            <div className="space-y-4 text-center text-sm">
              <p className="text-muted-foreground">{t("recoveryPassword.invalidLink")}</p>
              <Button variant="outline" className="w-full" onClick={() => router.push("/recuperar-senha")}>
                {t("forgotPassword.title")}
              </Button>
              <Button className="w-full" onClick={() => router.push("/login")}>
                {t("recoveryPassword.backToLogin")}
              </Button>
            </div>
          ) : sessionReady ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="np">{t("recoveryPassword.new")}</Label>
                <Input
                  id="np"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={completeMutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="npc">{t("recoveryPassword.confirm")}</Label>
                <Input
                  id="npc"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={completeMutation.isPending}
                />
              </div>
              <Button type="submit" className="w-full" disabled={completeMutation.isPending}>
                {completeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("recoveryPassword.submitting")}
                  </>
                ) : (
                  t("recoveryPassword.submit")
                )}
              </Button>
            </form>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
