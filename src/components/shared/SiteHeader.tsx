'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  GraduationCap,
  Layers,
  Menu,
  Search,
  Trophy,
  X,
  type LucideIcon,
} from 'lucide-react';
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
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="inline-flex items-center gap-2.5"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
            <Compass className="h-5 w-5" />
          </span>
          <span className="flex items-baseline gap-2">
            <span className="text-lg font-bold tracking-tight text-slate-900">AI 智搜</span>
            <span className="hidden text-xs font-medium text-slate-400 sm:inline">
              AISearchHub
            </span>
          </span>
        </Link>

        {/* 桌面端导航 */}
        <nav aria-label="主导航" className="hidden items-center gap-1.5 sm:flex">
          {NAV_LINKS.map((item) => {
            const active = item.match(pathname);
            const Icon = 'icon' in item ? item.icon : null;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors',
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
        </nav>

        {/* 移动端菜单按钮 */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 sm:hidden"
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
          className="border-t border-slate-200/80 bg-white px-4 py-2.5 sm:hidden"
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
                    item.href === '/' && 'col-span-2',
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
