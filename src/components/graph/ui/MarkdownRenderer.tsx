import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`markdown-content prose prose-sm dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // 自定义标题样式
          h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-2" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-lg font-bold mb-2" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-base font-bold mb-1" {...props} />,
          // 自定义段落样式
          p: ({ node, ...props }) => <p className="mb-2 text-sm" {...props} />,
          // 自定义列表样式
          ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2 text-sm" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-2 text-sm" {...props} />,
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          // 自定义代码块样式
          code: (props: any) => {
            const { node, inline, className, children, ...rest } = props;
            return inline ? (
              <code className={`bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs ${className || ''}`} {...rest}>
                {children}
              </code>
            ) : (
              <code className={`block bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto ${className || ''}`} {...rest}>
                {children}
              </code>
            );
          },
          // 自定义引用样式
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic mb-2 text-sm" {...props} />
          ),
          // 自定义链接样式
          a: ({ node, ...props }) => (
            <a className="text-blue-500 hover:text-blue-600 underline" {...props} />
          ),
          // 自定义表格样式
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto mb-2">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-gray-50 dark:bg-gray-800" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-2 whitespace-nowrap text-sm" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default memo(MarkdownRenderer);
