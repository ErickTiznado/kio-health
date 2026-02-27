import DOMPurify from 'dompurify';
import { useMemo } from 'react';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps) {
  const htmlContent = useMemo(() => {
    if (!content) return '';

    let html = content
      // Escape HTML special characters first
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Headers
      .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold mb-2 mt-4 text-gray-900 dark:text-white">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold mb-2 mt-3 text-gray-800 dark:text-slate-200">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-base font-bold mb-1 mt-2 text-gray-800 dark:text-slate-300">$1</h3>')
      // Bold
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-kio/50 pl-4 py-1 my-2 italic text-gray-600 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/50 rounded-r">$1</blockquote>')
      // Lists (Unordered)
      .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc marker:text-gray-400">$1</li>')
      // Lists (Ordered)
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal marker:text-gray-400">$1</li>')
      // Line breaks
      .replace(/\n/gim, '<br />');

    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['h1', 'h2', 'h3', 'strong', 'em', 'blockquote', 'li', 'br'],
      ALLOWED_ATTR: ['class'],
    });
  }, [content]);

  return (
    <div
      className={`prose dark:prose-invert max-w-none text-sm leading-relaxed text-gray-700 dark:text-slate-300 ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
