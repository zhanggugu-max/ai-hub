/**
 * 解析当前站点绝对基准地址，用于 Metadata、Canonical 与 JSON-LD：
 * 优先使用显式配置的 NEXT_PUBLIC_SITE_URL；若部署在 Vercel 且未手动填写，
 * 自动回退至 Vercel 注入的 VERCEL_PROJECT_PRODUCTION_URL / VERCEL_URL。
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/+$/, '');
  }

  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProd) {
    return vercelProd.startsWith('http')
      ? vercelProd.replace(/\/+$/, '')
      : `https://${vercelProd.replace(/\/+$/, '')}`;
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return vercelUrl.startsWith('http')
      ? vercelUrl.replace(/\/+$/, '')
      : `https://${vercelUrl.replace(/\/+$/, '')}`;
  }

  return 'http://localhost:3000';
}
