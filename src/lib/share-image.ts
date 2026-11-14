export type ShareCaptureStatus = 'idle' | 'generating';

export interface ShareCaptureResult {
  dataUrl: string;
  isMobile: boolean;
}

/**
 * 检测当前是否为移动端或窄屏触控环境（微信/小红书/iOS Safari 等）
 */
export function isMobileShareEnvironment(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  const ua = navigator.userAgent || '';
  const mobileUa = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|MicroMessenger/i.test(
    ua
  );
  const coarseNarrow =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches &&
    window.innerWidth < 768;

  return mobileUa || coarseNarrow;
}

/**
 * 等待待截图节点内所有 <img> 资源完成解码，防止导出时 Logo 或图片留白
 */
async function waitForImagesReady(container: HTMLElement): Promise<void> {
  const images = Array.from(container.querySelectorAll('img'));
  await Promise.all(
    images.map(async (img) => {
      if (!img.complete) {
        await new Promise<void>((resolve) => {
          const done = () => resolve();
          img.addEventListener('load', done, { once: true });
          img.addEventListener('error', done, { once: true });
        });
      }
      if (typeof img.decode === 'function') {
        try {
          await img.decode();
        } catch {
          // 忽略个别图片解码异常，继续截图流程
        }
      }
    })
  );
}

/**
 * 触发浏览器下载 PNG 文件
 */
export function triggerPngDownload(dataUrl: string, fileName: string): void {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 动态引入 html-to-image 将指定 DOM 节点导出为 2x 高清 PNG（仅客户端调用）
 */
export async function exportElementToPng(
  node: HTMLElement,
  fileName: string,
  options?: { backgroundColor?: string; pixelRatio?: number }
): Promise<ShareCaptureResult> {
  await waitForImagesReady(node);

  // 客户端按需动态引入，避免 Next.js SSR 阶段访问 window/document 报错
  const { toPng } = await import('html-to-image');

  const dataUrl = await toPng(node, {
    cacheBust: true,
    pixelRatio: options?.pixelRatio ?? 2,
    skipFonts: true,
    backgroundColor: options?.backgroundColor ?? '#ffffff',
  });

  const isMobile = isMobileShareEnvironment();
  if (!isMobile) {
    triggerPngDownload(dataUrl, fileName);
  }

  return { dataUrl, isMobile };
}
