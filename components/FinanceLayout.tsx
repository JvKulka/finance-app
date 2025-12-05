"use client";

import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  BarChart3,
  Calendar,
  CreditCard,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Moon,
  Receipt,
  Settings,
  Sun,
  Target,
  User,
} from "lucide-react";

interface FinanceLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transações", href: "/transactions", icon: Receipt },
  { name: "Categorias", href: "/categories", icon: FolderKanban },
  { name: "Metas", href: "/goals", icon: Target },
  { name: "Agenda", href: "/schedule", icon: Calendar },
  { name: "Cartões de Crédito", href: "/credit-cards", icon: CreditCard },
  { name: "Relatórios", href: "/reports", icon: FileText },
];

export default function FinanceLayout({ children }: FinanceLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evitar erro de hidratação - só renderizar após montar no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Não redirecionar aqui - o middleware já cuida disso
  // Removido para evitar loops de redirecionamento

  const handleLogout = async () => {
    await logout();
    // Usar window.location para garantir que o cookie seja limpo e evitar loops
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-60 border-r border-border bg-card flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">FinanceApp</span>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* User Section */}
        <div className="p-4 border-t border-border space-y-2">
          <Link href="/profile">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
              <User className="w-5 h-5" />
              Perfil
            </div>
          </Link>
          <Link href="/settings">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
              <Settings className="w-5 h-5" />
              Configurações
            </div>
          </Link>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors w-full"
            suppressHydrationWarning
          >
            {mounted && theme === "dark" ? (
              <>
                <Sun className="w-5 h-5" />
                Modo Claro
              </>
            ) : mounted ? (
              <>
                <Moon className="w-5 h-5" />
                Modo Escuro
              </>
            ) : (
              <>
                <Moon className="w-5 h-5" />
                Modo Escuro
              </>
            )}
          </button>
          <Separator className="my-2" />
          <div className="px-3 py-2 text-xs text-muted-foreground">
            <p className="font-medium text-foreground truncate">{user?.name}</p>
            <p className="truncate">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="h-full">{children}</div>
      </main>
    </div>
  );
}
