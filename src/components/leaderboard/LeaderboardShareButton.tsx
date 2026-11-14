'use client';

import { useRef, useState } from 'react';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import type { LeaderboardSnapshot } from '@/data/leaderboard/mock-data';
import { exportElementToPng } from '@/lib/share-image';
import { ShareImageModal } from '@/components/share/SharePosterPrimitives';
import { LeaderboardSharePoster } from './LeaderboardSharePoster';

interface LeaderboardShareButtonProps {
  snapshot: LeaderboardSnapshot;
  className?: string;
}

const LEADERBOARD_SHARE_FILENAME = '海兰AI_2026大模型Top3对比.png';

/**
 * 大模型 Top 3 对比长图触发按钮（可复用于首页 Top 3 预览区块与 `/leaderboard` 页面）
 */
export function LeaderboardShareButton({ snapshot, className }: LeaderboardShareButtonProps) {
  const posterRef = useRef<HTMLDivElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isMobileModal, setIsMobileModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (isGenerating || !posterRef.current) return;
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const result = await exportElementToPng(posterRef.current, LEADERBOARD_SHARE_FILENAME, {
        backgroundColor: '#0F172A',
        pixelRatio: 2,
      });
      setPreviewDataUrl(result.dataUrl);
      setIsMobileModal(result.isMobile);
    } catch {
      setErrorMessage('对比卡生成失败，请稍后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating}
        title={errorMessage ?? '一键生成高清 Top 3 模型对比长图'}
        className={
          className ??
          'inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-sky-200 bg-gradient-to-r from-sky-50 via-blue-50 to-cyan-50 px-3 py-2 text-xs font-semibold text-blue-700 shadow-2xs transition-all hover:border-blue-300 hover:from-sky-100 hover:via-blue-100 hover:to-cyan-100 disabled:cursor-not-allowed disabled:opacity-70'
        }
      >
        {isGenerating ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
        ) : (
          <ImageIcon className="h-3.5 w-3.5 text-blue-600" />
        )}
        <span>{isGenerating ? '正在生成对比卡...' : '生成对比卡'}</span>
      </button>

      {errorMessage && (
        <span className="text-xs font-medium text-rose-600" role="status">
          {errorMessage}
        </span>
      )}

      <LeaderboardSharePoster posterRef={posterRef} snapshot={snapshot} />

      <ShareImageModal
        open={Boolean(previewDataUrl)}
        dataUrl={previewDataUrl}
        fileName={LEADERBOARD_SHARE_FILENAME}
        title="2026 大模型 Top 3 对比长图"
        isMobile={isMobileModal}
        onClose={() => setPreviewDataUrl(null)}
      />
    </>
  );
}
