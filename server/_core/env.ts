/**
 * Constrói a URL de conexão do banco de dados usando variáveis do Supabase
 * Usa NEXT_PUBLIC_SUPABASE_URL e SUPABASE_DB_PASSWORD do .env
 */
function getDatabaseUrl(): string {
  // Se DATABASE_URL já estiver definido, usa diretamente
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // Usa variáveis do Supabase
  const supabaseUrl = process.env.SUPABASE_URL || 
                      process.env.VITE_SUPABASE_URL || 
                      process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePassword = process.env.SUPABASE_DB_PASSWORD || 
                           process.env.SUPABASE_PASSWORD;
  const supabaseProjectRef = process.env.SUPABASE_PROJECT_REF;

  if (supabaseUrl && supabasePassword) {
    // Extrai o project ref da URL se não foi fornecido separadamente
    let projectRef = supabaseProjectRef;
    if (!projectRef && supabaseUrl) {
      const match = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/);
      if (match) {
        projectRef = match[1];
      }
    }

    if (projectRef) {
      // Constrói a URL de conexão direta (porta 5432)
      return `postgresql://postgres:${encodeURIComponent(supabasePassword)}@db.${projectRef}.supabase.co:5432/postgres`;
    }
  }

  return "";
}

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: getDatabaseUrl(),
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // Variáveis do Supabase (opcionais)
  supabaseUrl: process.env.SUPABASE_URL || 
               process.env.VITE_SUPABASE_URL || 
               process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 
                   process.env.VITE_SUPABASE_ANON_KEY || 
                   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
};
