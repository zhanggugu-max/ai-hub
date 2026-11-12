import Link from 'next/link';
import { ArrowLeft, FileQuestion, Search } from 'lucide-react';

export default function ResourceNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50/70 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-2xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <FileQuestion className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-slate-900">
          未找到该 AI 资料详情
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          该条目可能尚未在数据库中发布，或链接中的 Slug 标识有误。你可以返回搜索中心检索其他资料。
        </p>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <Search className="h-3.5 w-3.5" />
            <span>前往资料搜索</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-600"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>返回首页</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
