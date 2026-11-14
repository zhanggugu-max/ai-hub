import Link from 'next/link';
import { BrandLogo } from '@/components/shared/BrandLogo';
import { FooterInfoActions } from '@/components/shared/FooterInfoActions';
import { SITE_BRAND } from '@/config/brand';

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 text-xs leading-relaxed text-slate-500 lg:flex-row lg:items-center lg:justify-between sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-2.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/" className="inline-flex shrink-0 items-center">
              <BrandLogo className="h-7 w-auto sm:h-8" />
            </Link>
            <span className="text-slate-300">·</span>
            <span className="font-medium text-slate-700">{SITE_BRAND.positioning}</span>
            <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700">
              {SITE_BRAND.slogan}
            </span>
          </div>

          <p>
            © 2026 {SITE_BRAND.name}（{SITE_BRAND.positioning}）。本站仅索引公开 AI 资料元数据、自编中文摘要与官方外链，不抓取或存储第三方全文内容；模型排行榜采用定时同步与缓存机制并标注来源，数据仅供参考。
          </p>
        </div>

        <nav
          aria-label="页脚快速导航"
          className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2 font-medium text-slate-700"
        >
          <Link href="/guide" className="transition-colors hover:text-blue-600">
            新手教程
          </Link>
          <Link href="/matcher" className="transition-colors hover:text-blue-600">
            AI 选型测试
          </Link>
          <Link href="/search" className="transition-colors hover:text-blue-600">
            资料搜索
          </Link>
          <Link href="/nav" className="transition-colors hover:text-blue-600">
            场景导航
          </Link>
          <Link href="/leaderboard" className="transition-colors hover:text-blue-600">
            能力榜单
          </Link>
          <FooterInfoActions />
        </nav>
      </div>
    </footer>
  );
}
