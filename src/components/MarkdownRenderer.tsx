import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  isReply?: boolean;
}

export const MarkdownRenderer = ({ content, className, isReply = false }: MarkdownRendererProps) => {
  const baseClasses = isReply
    ? "prose prose-invert prose-sm max-w-none reply-content"
    : "prose prose-invert prose-sm max-w-none";

  return (
    <div className={cn(baseClasses, className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom styling for different markdown elements with enhanced reply styling
          h1: ({ children }) => (
            <h1 className={cn(
              "font-bold mb-3 mt-4 first:mt-0",
              isReply
                ? "text-xl text-white/95 border-b border-white/10 pb-2"
                : "text-xl text-white"
            )}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className={cn(
              "font-semibold mb-2 mt-3 first:mt-0",
              isReply
                ? "text-lg text-white/90 border-l-2 border-[#3ABCF7]/50 pl-3"
                : "text-lg text-white"
            )}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className={cn(
              "font-medium mb-2 mt-3 first:mt-0",
              isReply
                ? "text-base text-white/85"
                : "text-base text-white"
            )}>
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className={cn(
              "mb-2 last:mb-0 leading-relaxed",
              isReply
                ? "text-gray-50/90 text-sm leading-[1.6]"
                : "text-gray-100"
            )}>
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className={cn(
              "list-disc mb-2 space-y-1",
              isReply
                ? "list-inside text-gray-50/85 pl-4"
                : "list-inside text-gray-100"
            )}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className={cn(
              "list-decimal mb-2 space-y-1",
              isReply
                ? "list-inside text-gray-50/85 pl-4"
                : "list-inside text-gray-100"
            )}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className={cn(
              isReply
                ? "text-gray-50/85 marker:text-[#3ABCF7]/70"
                : "text-gray-100"
            )}>
              {children}
            </li>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className={cn(
                  "px-1.5 py-0.5 rounded text-sm font-mono",
                  isReply
                    ? "bg-gray-800/80 text-[#3ABCF7] border border-gray-700/50"
                    : "bg-gray-800 text-[#3ABCF7]"
                )}>
                  {children}
                </code>
              );
            }
            // Block code
            return (
              <code className={cn(
                "block p-3 rounded-lg text-sm font-mono overflow-x-auto border",
                isReply
                  ? "bg-gray-900/80 text-gray-100 border-gray-700/50 shadow-inner"
                  : "bg-gray-900 text-gray-100 border-gray-700"
              )}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className={cn(
              "border rounded-lg p-3 mb-3 overflow-x-auto",
              isReply
                ? "bg-gray-900/80 border-gray-700/50 shadow-inner"
                : "bg-gray-900 border-gray-700"
            )}>
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className={cn(
              "border-l-4 pl-4 italic mb-3",
              isReply
                ? "border-[#3ABCF7]/70 text-gray-200/90 bg-gray-800/20 py-2 rounded-r"
                : "border-[#3ABCF7] text-gray-300"
            )}>
              {children}
            </blockquote>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "underline transition-colors",
                isReply
                  ? "text-[#3ABCF7]/90 hover:text-[#8B2FF8]/90 decoration-[#3ABCF7]/50 hover:decoration-[#8B2FF8]/50"
                  : "text-[#3ABCF7] hover:text-[#8B2FF8]"
              )}
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className={cn(
              "font-semibold",
              isReply ? "text-white/95" : "text-white"
            )}>
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className={cn(
              "italic",
              isReply ? "text-gray-200/85" : "text-gray-200"
            )}>
              {children}
            </em>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-3">
              <table className={cn(
                "min-w-full border rounded-lg",
                isReply
                  ? "border-gray-700/50 shadow-sm"
                  : "border-gray-700"
              )}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className={cn(
              isReply ? "bg-gray-800/80" : "bg-gray-800"
            )}>
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className={cn(
              isReply ? "bg-gray-900/80" : "bg-gray-900"
            )}>
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className={cn(
              "border-b",
              isReply ? "border-gray-700/50" : "border-gray-700"
            )}>
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className={cn(
              "px-3 py-2 text-left font-medium",
              isReply ? "text-white/95" : "text-white"
            )}>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className={cn(
              "px-3 py-2",
              isReply ? "text-gray-100/90" : "text-gray-100"
            )}>
              {children}
            </td>
          ),
          hr: () => (
            <hr className={cn(
              "my-4",
              isReply ? "border-gray-700/50" : "border-gray-700"
            )} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
