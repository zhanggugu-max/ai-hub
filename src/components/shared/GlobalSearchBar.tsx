'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { HOT_SEARCH_TAGS } from '@/data/search/mock-data';
import { cn } from '@/lib/utils';

interface GlobalSearchBarProps {
  /** 尺寸规格：lg 用于首页 Hero 与搜索页主框，sm 用于紧凑导航/区块 */
  size?: 'lg' | 'sm';
  /** 受控模式值（如 /search 页面）；不传则启用独立内部状态并跳转 /search */
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onTagClick?: (tag: string) => void;
  placeholder?: string;
  submitLabel?: string;
  showHotTags?: boolean;
  hotTags?: string[];
  className?: string;
}

export function GlobalSearchBar({
  size = 'lg',
  value,
  onChange,
  onSubmit,
  onTagClick,
  placeholder = '搜索关键词，例如：Agent、RAG、Cursor、开源模型、arXiv...',
  submitLabel = '立即搜索',
  showHotTags = true,
  hotTags = HOT_SEARCH_TAGS,
  className,
}: GlobalSearchBarProps) {
  const router = useRouter();
  const [internalValue, setInternalValue] = useState('');

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const updateValue = (next: string) => {
    if (onChange) {
      onChange(next);
    } else {
      setInternalValue(next);
    }
  };

  const navigateToSearch = (rawQuery: string) => {
    const trimmed = rawQuery.trim();
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search');
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(currentValue);
    } else {
      navigateToSearch(currentValue);
    }
  };

  const handleTagSelect = (tag: string) => {
    if (onTagClick) {
      onTagClick(tag);
    } else {
      navigateToSearch(tag);
    }
  };

  const isLarge = size === 'lg';

  return (
    <div className={cn('w-full', className)}>
      <form
        onSubmit={handleFormSubmit}
        className={cn('flex flex-col sm:flex-row', isLarge ? 'gap-2.5' : 'gap-2')}
      >
        <div className="relative flex-1">
          <Search
            className={cn(
              'pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-400',
              isLarge ? 'left-3.5 h-5 w-5' : 'left-3 h-4 w-4'
            )}
          />
          <Input
            type="search"
            value={currentValue}
            onChange={(e) => updateValue(e.target.value)}
            placeholder={placeholder}
            autoComplete="off"
            className={cn(
              isLarge
                ? 'h-12 rounded-xl pr-10 pl-11 text-base'
                : 'h-10 rounded-lg pr-9 pl-9 text-sm'
            )}
            aria-label="全局搜索 AI 资料"
          />
          {currentValue && (
            <button
              type="button"
              onClick={() => updateValue('')}
              className={cn(
                'absolute top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700',
                isLarge ? 'right-3' : 'right-2'
              )}
              aria-label="清空搜索关键词"
            >
              <X className={isLarge ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
            </button>
          )}
        </div>
        <Button
          type="submit"
          className={cn(
            'font-semibold',
            isLarge ? 'h-12 rounded-xl px-6 text-sm' : 'h-10 rounded-lg px-4 text-xs'
          )}
        >
          {submitLabel}
        </Button>
      </form>

      {showHotTags && hotTags.length > 0 && (
        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            热门检索：
          </span>
          {hotTags.map((tag) => {
            const isActive =
              currentValue.trim().toLowerCase() === tag.toLowerCase();
            return (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagSelect(tag)}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-xs transition-colors',
                  isActive
                    ? 'border-blue-500 bg-blue-50 font-medium text-blue-700'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
