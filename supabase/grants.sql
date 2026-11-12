-- ============================================================================
-- 修复 Supabase 新版密钥 / 最小权限下的表级 GRANT 授权（在 SQL Editor 运行）
-- ============================================================================
grant usage on schema public to anon, authenticated, service_role;

-- 匿名与登录访客：仅允许读取公开表（受 RLS policy 限制）
grant select on table public.leaderboard_snapshots to anon, authenticated;
grant select on table public.ai_models to anon, authenticated;
grant select on table public.ai_resources to anon, authenticated;

-- 服务端 service_role：允许完整读写全部 4 张表（含 sync_logs 与写入）
grant all privileges on table public.leaderboard_snapshots to service_role;
grant all privileges on table public.ai_models to service_role;
grant all privileges on table public.ai_resources to service_role;
grant all privileges on table public.sync_logs to service_role;
