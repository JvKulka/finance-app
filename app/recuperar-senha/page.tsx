"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc/client";
import { useI18n } from "@/lib/i18n/useI18n";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function RecuperarSenhaPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState("");

  const mutation = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: () => {
      toast.success(t("forgotPassword.success"));
    },
    onError: (err) => {
      toast.error(`${t("forgotPassword.errorPrefix")}${err.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ email: email.trim() });
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
            <CardTitle className="text-2xl font-bold">{t("forgotPassword.title")}</CardTitle>
            <CardDescription>{t("forgotPassword.subtitle")}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fp-email">{t("forgotPassword.email")}</Label>
              <Input
                id="fp-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={mutation.isPending}
              />
            </div>
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("forgotPassword.submitting")}
                </>
              ) : (
                t("forgotPassword.submit")
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-primary hover:underline"
            >
              {t("forgotPassword.backToLogin")}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
