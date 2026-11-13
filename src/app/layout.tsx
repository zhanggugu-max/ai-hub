import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "AI 智搜 - 全网 AI 资料聚合搜索、大模型能力榜单与工具指南",
    template: "%s",
  },
  description:
    "中文优先的 AI 资料聚合搜索、准实时模型能力排行榜与 AI 工具操作指南平台。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50/70 text-slate-900">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
