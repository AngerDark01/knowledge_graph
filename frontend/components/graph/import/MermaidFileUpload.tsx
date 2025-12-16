/**
 * Mermaid文件上传组件
 */

'use client';

import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';

interface MermaidFileUploadProps {
  onFileContent: (content: string) => void;
}

export const MermaidFileUpload: React.FC<MermaidFileUploadProps> = ({
  onFileContent
}) => {
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();

        // 提取Mermaid代码块
        const mermaidCode = extractMermaidFromMarkdown(text);

        if (mermaidCode) {
          onFileContent(mermaidCode);
        } else {
          alert('未找到Mermaid代码块\n\n请确保文件包含 ```mermaid ... ``` 代码块或纯Mermaid代码');
        }
      } catch (error) {
        console.error('文件读取失败:', error);
        alert('文件读取失败，请检查文件格式');
      }
    },
    [onFileContent]
  );

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
        <input
          type="file"
          accept=".md,.mmd,.txt"
          onChange={handleFileChange}
          className="hidden"
          id="mermaid-file-input"
        />
        <label htmlFor="mermaid-file-input" className="cursor-pointer">
          <div className="space-y-2">
            <div className="text-4xl">📁</div>
            <Button variant="outline" asChild>
              <span>选择文件</span>
            </Button>
            <p className="text-sm text-gray-500">
              或拖拽文件到此处
            </p>
          </div>
        </label>
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p className="font-medium">💡 支持的文件格式：</p>
        <ul className="list-disc list-inside ml-2 space-y-0.5">
          <li>纯Mermaid代码（.mmd）</li>
          <li>包含Mermaid代码块的Markdown（.md）</li>
          <li>纯文本文件（.txt）</li>
        </ul>
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p className="font-medium">📝 Markdown示例：</p>
        <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
{`\`\`\`mermaid
flowchart TD
    A --> B
\`\`\``}
        </pre>
      </div>
    </div>
  );
};

/**
 * 从Markdown中提取Mermaid代码块
 */
function extractMermaidFromMarkdown(text: string): string | null {
  // 匹配```mermaid ... ```代码块
  const mermaidBlockRegex = /```mermaid\s*\n([\s\S]*?)\n```/i;
  const match = text.match(mermaidBlockRegex);

  if (match) {
    return match[1].trim();
  }

  // 如果没有代码块标记，尝试直接作为Mermaid代码
  if (text.trim().startsWith('flowchart') || text.trim().startsWith('graph')) {
    return text.trim();
  }

  return null;
}
