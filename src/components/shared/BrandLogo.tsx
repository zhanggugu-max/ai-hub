import { useId } from 'react';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  size?: number;
  className?: string;
}

/**
 * 海兰 AI 32x32 极简几何品牌 Logo：
 * 融合海浪弧线与兰花/星芒轮廓，深海蓝至青蓝克制渐变，在浅色背景下保持高锐度。
 */
export function BrandLogo({ size = 32, className }: BrandLogoProps) {
  const uid = useId().replace(/:/g, '');
  const bgId = `hailan-bg-${uid}`;
  const petalId = `hailan-petal-${uid}`;
  const waveId = `hailan-wave-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn('shrink-0', className)}
    >
      <defs>
        <linearGradient id={bgId} x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#EFF6FF" />
        </linearGradient>
        <linearGradient id={petalId} x1="8" y1="5" x2="24" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="55%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <linearGradient id={waveId} x1="5" y1="21" x2="27" y2="27" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0369A1" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>

      {/* 浅色锐利圆角底框 */}
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="8.5"
        fill={`url(#${bgId})`}
        stroke="#BAE6FD"
        strokeWidth="1"
      />

      {/* 兰花瓣与四芒星融合几何轮廓 */}
      <path
        d="M16 5.2C17.25 10.1 19.8 12.65 24.7 13.9C19.8 15.15 17.25 17.55 16 21.2C14.75 17.55 12.2 15.15 7.3 13.9C12.2 12.65 14.75 10.1 16 5.2Z"
        fill={`url(#${petalId})`}
      />

      {/* 双重海浪灵动弧线 */}
      <path
        d="M6.2 21.8C9.8 19.6 13.2 23.6 17.4 21.8C20.5 20.5 23.2 20.6 25.8 22.1"
        stroke={`url(#${waveId})`}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8.6 25.8C11.9 24.1 14.8 26.8 18.7 25.5C20.8 24.8 22.4 24.9 23.8 25.5"
        stroke="#0EA5E9"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeOpacity="0.82"
      />

      {/* 星芒微光点 */}
      <circle cx="23.4" cy="8.2" r="1.25" fill="#06B6D4" />
    </svg>
  );
}
