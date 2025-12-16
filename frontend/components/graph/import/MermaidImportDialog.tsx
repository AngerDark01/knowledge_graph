/**
 * Mermaid导入对话框
 *
 * 提供文本输入和文件上传两种方式导入Mermaid Flowchart
 */

'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MermaidTextInput } from './MermaidTextInput';
import { MermaidFileUpload } from './MermaidFileUpload';
import { useMermaidImport } from '@/hooks/useMermaidImport';

interface MermaidImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MermaidImportDialog: React.FC<MermaidImportDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [mermaidText, setMermaidText] = useState('');
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const { importMermaid, isLoading, error } = useMermaidImport();

  const handleImport = async () => {
    if (!mermaidText.trim()) {
      alert('请输入Mermaid代码');
      return;
    }

    try {
      const result = await importMermaid(mermaidText);

      // 显示成功消息
      alert(`导入成功！\n\n节点: ${result.nodeCount}\n群组: ${result.groupCount}\n边: ${result.edgeCount}`);

      // 关闭对话框并清空
      onOpenChange(false);
      setMermaidText('');
    } catch (err) {
      // 错误已在Hook中处理
      console.error('导入失败:', err);
    }
  };

  const handleFileContent = (content: string) => {
    setMermaidText(content);
    setActiveTab('text');
  };

  const handleClear = () => {
    if (confirm('确定要清空输入吗？')) {
      setMermaidText('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>导入 Mermaid Flowchart</DialogTitle>
          <DialogDescription>
            从Mermaid代码生成知识图谱，支持节点、边和子图（群组）
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {/* Tab切换 */}
          <div className="flex space-x-2 border-b">
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'text'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('text')}
            >
              粘贴代码
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'file'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('file')}
            >
              上传文件
            </button>
          </div>

          {/* 内容区域 */}
          <div className="min-h-[300px]">
            {activeTab === 'text' ? (
              <MermaidTextInput value={mermaidText} onChange={setMermaidText} />
            ) : (
              <MermaidFileUpload onFileContent={handleFileContent} />
            )}
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="text-red-600 text-sm p-3 bg-red-50 border border-red-200 rounded">
              <p className="font-medium">❌ 导入失败</p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          {/* 帮助提示 */}
          {!error && mermaidText.length === 0 && (
            <div className="text-blue-600 text-xs p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="font-medium">💡 快速开始：</p>
              <ul className="mt-1 list-disc list-inside space-y-0.5">
                <li>复制Mermaid Flowchart代码到上方输入框</li>
                <li>或上传包含Mermaid代码的Markdown文件</li>
                <li>点击"导入"按钮即可转换为知识图谱</li>
              </ul>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={isLoading || mermaidText.length === 0}
            size="sm"
          >
            清空
          </Button>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button onClick={handleImport} disabled={isLoading || !mermaidText.trim()}>
              {isLoading ? '导入中...' : '导入'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
