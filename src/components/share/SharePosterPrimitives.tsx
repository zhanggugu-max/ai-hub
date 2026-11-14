'use client';

import { useEffect } from 'react';
import { CheckCircle2, Download, Smartphone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { triggerPngDownload } from '@/lib/share-image';

export const POSTER_FONT_STACK =
  'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';

export const SHARE_SITE_DOMAIN = 'hailanai.com';

interface ShareImageModalProps {
  open: boolean;
  dataUrl: string | null;
  fileName: string;
  title: string;
  isMobile: boolean;
  onClose: () => void;
}

/**
 * 分享长图预览弹窗：
 * - 移动端突出提示「长按保存到相册，分享给朋友 ↗」
 * - 桌面端在自动下载后同步提供高清预览与一键重新下载
 */
export function ShareImageModal({
  open,
  dataUrl,
  fileName,
  title,
  isMobile,
  onClose,
}: ShareImageModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open || !dataUrl) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 sm:text-base">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭预览"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-100/90 p-4 sm:p-5">
          <div className="mx-auto overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element -- 渲染实时生成的 data:image/png 长图预览，需支持移动端长按保存 */}
            <img
              src={dataUrl}
              alt={title}
              className="block h-auto w-full select-all"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          {isMobile ? (
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 sm:text-sm">
              <Smartphone className="h-4 w-4 shrink-0" />
              <span>长按保存到相册，分享给朋友 ↗</span>
            </p>
          ) : (
            <p className="text-xs text-slate-500">
              已为你生成 2x 高清分享图并开始下载（也可右键图片复制发送给好友）
            </p>
          )}

          <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              关闭
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => triggerPngDownload(dataUrl, fileName)}
              className="gap-1.5 bg-slate-900 text-xs text-white hover:bg-blue-600"
            >
              <Download className="h-3.5 w-3.5" />
              <span>下载 PNG</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 极简品牌几何二维码装饰（无外部网络依赖，截图 100% 稳定渲染）
 */
export function MiniQrGraphic({
  size = 64,
  dark = false,
}: {
  size?: number;
  dark?: boolean;
}) {
  const fg = dark ? '#E2E8F0' : '#0F172A';
  const accent = dark ? '#22D3EE' : '#2563EB';
  const bg = dark ? '#0F172A' : '#FFFFFF';

  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        borderRadius: 10,
        padding: 5,
        border: dark ? '1px solid rgba(148,163,184,0.28)' : '1px solid #CBD5E1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg
        width={size - 10}
        height={size - 10}
        viewBox="0 0 21 21"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* 三个定位角 */}
        <rect x="0.5" y="0.5" width="6" height="6" rx="1.2" stroke={fg} strokeWidth="1.3" />
        <rect x="2.2" y="2.2" width="2.6" height="2.6" rx="0.5" fill={accent} />

        <rect x="14.5" y="0.5" width="6" height="6" rx="1.2" stroke={fg} strokeWidth="1.3" />
        <rect x="16.2" y="2.2" width="2.6" height="2.6" rx="0.5" fill={accent} />

        <rect x="0.5" y="14.5" width="6" height="6" rx="1.2" stroke={fg} strokeWidth="1.3" />
        <rect x="2.2" y="16.2" width="2.6" height="2.6" rx="0.5" fill={fg} />

        {/* 中心星芒点阵 */}
        <rect x="9" y="1" width="1.8" height="1.8" rx="0.4" fill={fg} />
        <rect x="11.5" y="3.2" width="1.8" height="1.8" rx="0.4" fill={accent} />
        <rect x="9" y="5.5" width="1.8" height="1.8" rx="0.4" fill={fg} />

        <rect x="1.2" y="9" width="1.8" height="1.8" rx="0.4" fill={fg} />
        <rect x="4" y="10.2" width="1.8" height="1.8" rx="0.4" fill={accent} />
        <rect x="6.5" y="8.8" width="1.8" height="1.8" rx="0.4" fill={fg} />

        <rect x="9" y="9" width="3" height="3" rx="0.7" fill={accent} />
        <rect x="14" y="9" width="1.8" height="1.8" rx="0.4" fill={fg} />
        <rect x="17" y="9" width="2.5" height="1.8" rx="0.4" fill={fg} />

        <rect x="9" y="14" width="1.8" height="1.8" rx="0.4" fill={fg} />
        <rect x="11.5" y="15.5" width="1.8" height="1.8" rx="0.4" fill={accent} />
        <rect x="14.5" y="13.5" width="2.2" height="2.2" rx="0.4" fill={fg} />
        <rect x="18" y="13.5" width="2" height="2" rx="0.4" fill={accent} />
        <rect x="9" y="18" width="2.5" height="2" rx="0.4" fill={fg} />
        <rect x="13.5" y="18" width="1.8" height="2" rx="0.4" fill={fg} />
        <rect x="17" y="17.5" width="3" height="2.5" rx="0.6" fill={fg} />
      </svg>
    </div>
  );
}
