'use client';

import { useMemo, useSyncExternalStore } from 'react';

export const FAVORITES_STORAGE_KEY = 'ai_hub_favorite_slugs_v1';
const FAVORITES_EVENT_NAME = 'ai-hub-favorites-changed';

function getFavoritesSnapshot(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(FAVORITES_STORAGE_KEY);
  } catch {
    return null;
  }
}

function getFavoritesServerSnapshot(): string | null {
  return null;
}

function subscribeFavoritesStore(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(FAVORITES_EVENT_NAME, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(FAVORITES_EVENT_NAME, callback);
    window.removeEventListener('storage', callback);
  };
}

export function parseFavoriteIdsSnapshot(raw: string | null): Set<string> | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return new Set(parsed.filter((v): v is string => typeof v === 'string'));
  } catch {
    return null;
  }
}

/** 订阅并读取浏览器本地持久化的收藏 ID 集合（SSR 安全、零水合冲突） */
export function useStoredFavoriteIds(): Set<string> | null {
  const raw = useSyncExternalStore(
    subscribeFavoritesStore,
    getFavoritesSnapshot,
    getFavoritesServerSnapshot
  );
  return useMemo(() => parseFavoriteIdsSnapshot(raw), [raw]);
}

/** 写入浏览器本地收藏并通知同标签页订阅组件刷新 */
export function writeStoredFavoriteIds(ids: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(ids)));
    window.dispatchEvent(new CustomEvent(FAVORITES_EVENT_NAME));
  } catch {
    // 忽略隐私模式或存储配额异常
  }
}
