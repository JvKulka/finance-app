import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Verificar se estamos em build time (Next.js define isso)
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                    process.env.NODE_ENV === 'production' && !process.env.VERCEL;

let supabaseServerInstance: SupabaseClient | null = null;

function createSupabaseClient(): SupabaseClient {
  if (!supabaseServerInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Durante o build, usar valores padrão para evitar erros
    if (isBuildTime && !supabaseUrl) {
      // Criar um cliente mock durante o build
      supabaseServerInstance = createClient(
        'https://placeholder.supabase.co',
        'placeholder-key',
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );
    } else {
      if (!supabaseUrl) {
        throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
      }

      if (!supabaseServiceRoleKey) {
        throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
      }

      supabaseServerInstance = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    }
  }
  
  return supabaseServerInstance;
}

/**
 * Cliente Supabase para uso no servidor
 * Usa SERVICE_ROLE_KEY quando disponível para bypass de RLS quando necessário
 * Inicialização lazy para evitar erros durante o build
 */
export const supabaseServer = new Proxy({} as SupabaseClient, {
  get(_target, prop, _receiver) {
    const client = createSupabaseClient();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

