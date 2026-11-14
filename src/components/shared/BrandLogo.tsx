import Image from 'next/image';
import { SITE_BRAND } from '@/config/brand';
import { cn } from '@/lib/utils';

const LOGO_ASSETS = {
  transparent: {
    src: '/brand/hailan-ai-logo-v2-transparent.png',
    width: 831,
    height: 243,
  },
  white: {
    src: '/brand/hailan-ai-logo-v2-white.png',
    width: 1024,
    height: 341,
  },
} as const;

interface BrandLogoProps {
  variant?: keyof typeof LOGO_ASSETS;
  priority?: boolean;
  className?: string;
}

/**
 * 海兰 AI v2 横版品牌 Logo Lockup：
 * 采用海浪 H 字母骨架与「海兰 AI」横版组合位图，适配浅色与纯白导航/页脚场景。
 */
export function BrandLogo({
  variant = 'transparent',
  priority = false,
  className,
}: BrandLogoProps) {
  const asset = LOGO_ASSETS[variant];

  return (
    <Image
      src={asset.src}
      alt={SITE_BRAND.name}
      width={asset.width}
      height={asset.height}
      priority={priority}
      className={cn('h-8 w-auto shrink-0 object-contain select-none sm:h-9', className)}
    />
  );
}
