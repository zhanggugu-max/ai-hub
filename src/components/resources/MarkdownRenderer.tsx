'use client';

import { isValidElement, useRef, useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import { BookOpenText, Check, Copy, ExternalLink, FileEdit } from 'lucide-react';
import { isRealExternalUrl } from '@/lib/search/helpers';

interface MarkdownRendererProps {
  content?: string;
  description: string;
  externalUrl: string;
}

function extractTextFromNode(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractTextFromNode).join('');
  }
  if (isValidElement<{ children?: React.ReactNode }>(node)) {
    return extractTextFromNode(node.props.children);
  }
  return '';
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  let language = 'text';
  if (isValidElement<{ className?: string }>(children)) {
    const match = /language-([^\s]+)/.exec(children.props.className ?? '');
    if (match?.[1]) {
      language = match[1];
    }
  }

  const rawCode = extractTextFromNode(children).replace(/\n$/, '');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawCode);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      // 忽略剪贴板权限异常
    }
  };

  return (
    <div className="not-prose my-5 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-2 text-xs text-slate-400">
        <span className="font-mono uppercase tracking-wider text-slate-300">
          {language}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-300">已复制</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>复制</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-slate-100">
        {children}
      </pre>
    </div>
  );
}

const markdownComponents: Components = {
  pre({ children }) {
    return <CodeBlock>{children}</CodeBlock>;
  },
  code({ className, children, ...props }) {
    // 若带有 language-* 类名，说明处于 CodeBlock 的 <pre> 内，保留原始结构
    if (className && /language-/.test(className)) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em] font-medium text-rose-700"
        {...props}
      >
        {children}
      </code>
    );
  },
  a({ href, children, ...props }) {
    const isExternal = typeof href === 'string' && /^https?:\/\//i.test(href);
    return (
      <a
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer nofollow' : undefined}
        className="inline-flex items-center gap-0.5 font-medium text-blue-600 underline-offset-4 hover:underline"
        {...props}
      >
        <span>{children}</span>
        {isExternal && <ExternalLink className="inline h-3 w-3 shrink-0" />}
      </a>
    );
  },
  table({ children, ...props }) {
    return (
      <div className="my-5 overflow-x-auto rounded-xl border border-slate-200">
        <table className="m-0 min-w-full divide-y divide-slate-200" {...props}>
          {children}
        </table>
      </div>
    );
  },
};

export function MarkdownRenderer({
  content,
  description,
  externalUrl,
}: MarkdownRendererProps) {
  const hasRichContent = Boolean(content && content.trim().length > 0);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs sm:p-8">
      {/* 中文核心摘要卡片 */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 sm:p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
          <BookOpenText className="h-4 w-4" />
          <span>核心导读与中文摘要</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-700 sm:text-[15px]">
          {description}
        </p>
      </div>

      {/* Markdown 正文区或空正文兜底提示 */}
      {hasRichContent ? (
        <div className="prose prose-slate mt-7 max-w-none prose-headings:scroll-mt-20 prose-headings:font-bold prose-headings:tracking-tight prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-2 prose-h2:text-xl prose-h3:text-lg prose-p:leading-7 prose-blockquote:rounded-r-lg prose-blockquote:border-l-blue-500 prose-blockquote:bg-slate-50 prose-blockquote:px-4 prose-blockquote:py-1.5 prose-blockquote:not-italic prose-th:bg-slate-50 prose-th:px-3 prose-th:py-2 prose-td:px-3 prose-td:py-2 prose-code:before:content-none prose-code:after:content-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSlug]}
            components={markdownComponents}
          >
            {content}
          </ReactMarkdown>
        </div>
      ) : (
        <div className="mt-7 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-200/70 text-slate-500">
            <FileEdit className="h-5 w-5" />
          </div>
          <h2 className="mt-3 text-base font-semibold text-slate-800">
            暂未录入扩展指南或个人笔记
          </h2>
          <p className="mx-auto mt-1.5 max-w-lg text-xs leading-relaxed text-slate-500 sm:text-sm">
            该资料当前仅展示核心摘要与原文外链。后续可在 Supabase 后台{' '}
            <code className="rounded bg-slate-200/70 px-1.5 py-0.5 font-mono text-xs text-slate-700">
              ai_resources.content
            </code>{' '}
            字段中直接填入 Markdown 教程、实操复盘或提示词模板。
          </p>
          {isRealExternalUrl(externalUrl) && (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-600"
            >
              <span>先去原文官网查看</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      )}
    </article>
  );
}
