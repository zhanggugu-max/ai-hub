'use client';

import { useEffect, useRef, useState } from 'react';
import { Bookmark, Check, ExternalLink, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useStoredFavoriteIds,
  writeStoredFavoriteIds,
} from '@/lib/search/favorites';

interface ResourceActionsClientProps {
  resourceId: string;
  initialFavoriteCount: number;
  defaultFavorited: boolean;
  externalUrl: string;
}

export function ResourceActionsClient({
  resourceId,
  defaultFavorited,
  externalUrl,
}: ResourceActionsClientProps) {
  const storedFavorites = useStoredFavoriteIds();
  const isFavorited = storedFavorites ? storedFavorites.has(resourceId) : defaultFavorited;

  const [copiedLink, setCopiedLink] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const handleToggleFavorite = () => {
    const next = new Set(storedFavorites ?? (defaultFavorited ? [resourceId] : []));
    if (next.has(resourceId)) {
      next.delete(resourceId);
    } else {
      next.add(resourceId);
    }
    writeStoredFavoriteIds(next);
  };

  const handleCopyPageLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // 忽略剪贴板权限拒绝
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Button
        type="button"
        variant={isFavorited ? 'secondary' : 'outline'}
        onClick={handleToggleFavorite}
        className={`h-9 gap-1.5 text-xs font-medium tabular-nums ${
          isFavorited
            ? 'border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
            : 'border-slate-200 bg-white text-slate-700 hover:border-amber-200 hover:bg-amber-50/50'
        }`}
      >
        <Bookmark
          className={`h-4 w-4 ${isFavorited ? 'fill-amber-500 text-amber-500' : ''}`}
        />
        <span>{isFavorited ? '已收藏' : '收藏'}</span>
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={handleCopyPageLink}
        className="h-9 gap-1.5 border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-blue-200 hover:text-blue-600"
      >
        {copiedLink ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-emerald-700">已复制链接</span>
          </>
        ) : (
          <>
            <Link2 className="h-3.5 w-3.5" />
            <span>复制本页链接</span>
          </>
        )}
      </Button>

      <a
        href={externalUrl}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-blue-700"
      >
        <span>访问原文官网</span>
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}
