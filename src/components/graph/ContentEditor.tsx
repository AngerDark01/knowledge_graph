import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Node } from '../../types/graph/models';
import { useGraphStore } from '../../stores/graph';

interface ContentEditorProps {
  node: Node;
}

const ContentEditor: React.FC<ContentEditorProps> = ({ node }) => {
  const [content, setContent] = useState(node.content || '');
  const [title, setTitle] = useState(node.title);
  const [isEditing, setIsEditing] = useState(!!node.isEditing);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { updateNode } = useGraphStore();

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = useCallback(() => {
    updateNode(node.id, {
      ...node,
      title,
      content,
      isEditing: false
    });
    setIsEditing(false);
  }, [node, title, content, updateNode]);

  const handleCancel = useCallback(() => {
    setContent(node.content || '');
    setTitle(node.title);
    setIsEditing(false);
  }, [node]);

  const handleEditClick = useCallback(() => {
    setIsEditing(true);
  }, [setIsEditing]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  }, [handleCancel, handleSave]);

  if (isEditing) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200 w-full">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 mb-3 text-lg font-bold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="标题"
        />
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-3 h-40 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="输入内容..."
        />
        <div className="flex justify-end space-x-2 mt-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="p-4 bg-white rounded-lg shadow border border-gray-200 w-full cursor-pointer"
      onClick={handleEditClick}
    >
      <h3 className="font-bold text-lg mb-2 text-gray-800">{title}</h3>
      {content && (
        <div className="text-gray-600 whitespace-pre-wrap break-words">
          {content}
        </div>
      )}
    </div>
  );
};

export default React.memo(ContentEditor);