import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * 服务端只读 Supabase 客户端工厂（受 RLS 策略限制，仅使用 anon/publishable key）。
 * 若环境变量缺失返回 null，由上层 data-loader 自动降级为本地 Mock 数据。
 */
export function createServerSupabaseClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (input, init) => {
        const timeoutSignal = AbortSignal.timeout(4000);
        const signal = init?.signal
          ? AbortSignal.any([init.signal, timeoutSignal])
          : timeoutSignal;
        return fetch(input, { ...init, signal });
      },
    },
  });
}
