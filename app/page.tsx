import { redirect } from "next/navigation";

export default function Home() {
  // O middleware já cuida do redirecionamento baseado na autenticação
  // Esta função nunca será executada porque o middleware redireciona antes
  // Mas mantemos como fallback
  redirect("/login");
}

