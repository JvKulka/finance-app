import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME } from "./shared/const";

// Rotas que não requerem autenticação
const publicRoutes = ["/login", "/register"];

// Rotas que requerem autenticação
const protectedRoutes = ["/dashboard", "/transactions", "/categories", "/goals", "/schedule", "/credit-cards", "/reports", "/profile", "/settings"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicRoute = publicRoutes.includes(pathname);
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Verificar cookie de sessão
  const sessionCookie = request.cookies.get(COOKIE_NAME);

  // Se acessar /, redirecionar baseado na autenticação
  if (pathname === "/") {
    if (sessionCookie) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Se está tentando acessar rota protegida sem autenticação, redirecionar para login
  if (isProtectedRoute && !sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Se está autenticado e tentando acessar login/register, redirecionar para dashboard
  if (isPublicRoute && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
