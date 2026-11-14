'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  GraduationCap,
  Layers,
  Menu,
  Search,
  Trophy,
  Wand2,
  X,
  type LucideIcon,
} from 'lucide-react';
import { BrandLogo } from '@/components/shared/BrandLogo';
import { SITE_BRAND } from '@/config/brand';
import { cn } from '@/lib/utils';

interface NavLinkItem {
  href: string;
  label: string;
  icon?: LucideIcon;
  iconClass?: string;
  match: (p: string) => boolean;
}

const NAV_LINKS: NavLinkItem[] = [
  { href: '/', label: '首页', match: (p: string) => p === '/' },
  {
    href: '/guide',
    label: '新手教程',
    icon: GraduationCap,
    iconClass: 'text-emerald-600',
    match: (p: string) => p.startsWith('/guide'),
  },
  {
    href: '/matcher',
    label: 'AI 选型测试',
    icon: Wand2,
    iconClass: 'text-violet-600',
    match: (p: string) => p.startsWith('/matcher'),
  },
  {
    href: '/search',
    label: '资料搜索',
    icon: Search,
    iconClass: '',
    match: (p: string) => p.startsWith('/search') || p.startsWith('/resources'),
  },
  {
    href: '/nav',
    label: '场景导航',
    icon: Layers,
    iconClass: 'text-blue-600',
    match: (p: string) => p.startsWith('/nav'),
  },
  {
    href: '/leaderboard',
    label: '能力榜单',
    icon: Trophy,
    iconClass: 'text-amber-500',
    match: (p: string) => p.startsWith('/leaderboard'),
  },
];

export function SiteHeader() {
  const pathname = usePathname() ?? '/';
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap"
        >
          <BrandLogo size={32} />
          <span className="flex items-baseline gap-2 whitespace-nowrap">
            <span className="text-lg font-bold tracking-tight text-slate-900">
              {SITE_BRAND.name}
            </span>
            <span className="hidden text-xs font-medium whitespace-nowrap text-slate-400 xl:inline">
              {SITE_BRAND.shortTag}
            </span>
          </span>
        </Link>

        {/* 桌面端导航 */}
        <nav
          aria-label="主导航"
          className="hidden shrink-0 items-center md:flex md:gap-1 lg:gap-1.5"
        >
          {NAV_LINKS.map((item) => {
            const active = item.match(pathname);
            const Icon = 'icon' in item ? item.icon : null;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs whitespace-nowrap transition-colors lg:px-3 lg:text-sm',
                  active
                    ? 'bg-slate-100 font-semibold text-slate-900'
                    : 'font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                {Icon && <Icon className={cn('h-3.5 w-3.5 shrink-0', item.iconClass)} />}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* 移动端菜单按钮 */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 md:hidden"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? '收起导航菜单' : '展开导航菜单'}
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* 移动端折叠导航菜单 */}
      {mobileOpen && (
        <nav
          aria-label="移动端主导航"
          className="border-t border-slate-200/80 bg-white px-4 py-2.5 md:hidden"
        >
          <div className="grid grid-cols-2 gap-1.5">
            {NAV_LINKS.map((item) => {
              const active = item.match(pathname);
              const Icon = 'icon' in item ? item.icon : null;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors',
                    active
                      ? 'bg-slate-100 font-semibold text-slate-900'
                      : 'font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  {Icon && <Icon className={cn('h-3.5 w-3.5', item.iconClass)} />}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
