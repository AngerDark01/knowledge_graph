import React, { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeResizeControl } from 'reactflow';
import { useGraphStore } from '@/stores/graph';
import { Node as NodeType } from '@/types/graph/models';
import { validateNodeContent } from '@/utils/validation';

interface BaseNodeData {
  title: string;
  content?: string;
  validationError?: string;
  isExpanded?: boolean;
}

// 定义通用的连接点组件 - 保持原始可见样式
const ConnectionHandles = ({ isGroup = false, selected = false }) => {
  const groupHandleClass = isGroup 
    ? 'w-4 h-4 bg-blue-500 rounded-full border-2 border-white' 
    : 'w-3 h-3 bg-gray-500 hover:bg-blue-500 rounded-full border-2 border-white';
  
  const handleStyle = {
    zIndex: 10, // 🔧 降低z-index，避免覆盖resize控制器
  };
  
  return (
    <>
      {/* 顶部连接点 */}
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        className={`${groupHandleClass} !-top-[6px]`}
        style={{ ...handleStyle, left: '50%', transform: 'translateX(-50%)' }}
        isConnectable
      />
      
      {/* 右侧连接点 */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className={`${groupHandleClass} !-right-[6px]`}
        style={{ ...handleStyle, top: '50%', transform: 'translateY(-50%)' }}
        isConnectable
      />
      
      {/* 底部连接点 */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className={`${groupHandleClass} !-bottom-[6px]`}
        style={{ ...handleStyle, left: '50%', transform: 'translateX(-50%)' }}
        isConnectable
      />
      
      {/* 左侧连接点 */}
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        className={`${groupHandleClass} !-left-[6px]`}
        style={{ ...handleStyle, top: '50%', transform: 'translateY(-50%)' }}
        isConnectable
      />
    </>
  );
};

export interface BaseNodeProps<T = BaseNodeData, U = any> {
  id: string;
  data: T;
  isGroup?: boolean;
  selected?: boolean;
  groupNode?: U;
  showResizeControl?: boolean;
  minWidth?: number;
  minHeight?: number;
  children?: React.ReactNode;
  node?: NodeType;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  renderContent?: (props: {
    isExpanded: boolean;
    isEditing: boolean;
    content: string;
    onContentChange: (content: string) => void;
    onToggleEdit: () => void;
  }) => React.ReactNode;
}

const BaseNode: React.FC<BaseNodeProps> = ({ 
  id, 
  data, 
  children, 
  isGroup = false, 
  selected, 
  groupNode,
  showResizeControl = false,
  minWidth = 150,
  minHeight = 100,
  node,
  isExpanded: externalIsExpanded,
  onToggleExpand,
  renderContent
}) => {
  const { updateNode } = useGraphStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState((node as NodeType)?.title || data.title);
  const [editContent, setEditContent] = useState((node as NodeType)?.content || data.content || '');
  const [internalIsExpanded, setInternalIsExpanded] = useState(data.isExpanded ?? true);

  const isExpanded = externalIsExpanded !== undefined ? externalIsExpanded : internalIsExpanded;

  const handleToggleExpand = useCallback(() => {
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setInternalIsExpanded(prev => !prev);
      updateNode(id, { isExpanded: !internalIsExpanded });
    }
  }, [onToggleExpand, internalIsExpanded, id, updateNode]);

  const handleContentChange = useCallback((newContent: string) => {
    setEditContent(newContent);
  }, []);

  const handleToggleEdit = useCallback(() => {
    if (isEditing) {
      const nodeToUpdate = { 
        ...(node as NodeType), 
        title: editValue,
        content: editContent 
      };
      const validation = validateNodeContent(nodeToUpdate);
      
      updateNode(id, { 
        ...nodeToUpdate,
        validationError: !validation.isValid ? validation.errors[0] : undefined
      });
    }
    setIsEditing(!isEditing);
  }, [isEditing, editValue, editContent, node, id, updateNode]);

  const containerClass = isGroup 
    ? `group relative rounded-2xl
       ${selected ? 'border-blue-500 border-[3px] shadow-lg' : 'border-blue-200 border-[2px]'}
       bg-blue-50 bg-opacity-70
       hover:shadow-lg
       outline-none
       box-border
       z-[1]` 
    : `group relative rounded-xl
       ${selected ? 'border-blue-500 border-[2px] shadow-md' : 'border border-gray-200'}
       bg-white dark:bg-gray-800
       hover:shadow-lg
       outline-none
       box-border
       z-[2]`;

  const containerStyle = { width: '100%', height: '100%' };

  return (
    <div className={containerClass} style={containerStyle}>
      <ConnectionHandles isGroup={isGroup} selected={selected} />
      
      {isGroup ? (
        children
      ) : (
        <>
          {renderContent ? (
            renderContent({
              isExpanded,
              isEditing,
              content: editContent,
              onContentChange: handleContentChange,
              onToggleEdit: handleToggleEdit
            })
          ) : (
            <div className="p-4">
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {(node as NodeType)?.title || data.title}
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {editContent || 'No content...'}
              </div>
            </div>
          )}
        </>
      )}
      
      {/* 🔧 尺寸调整器 - 移除wrapper div，添加nodrag/nopan类，提高z-index */}
      {showResizeControl && (
        <NodeResizeControl
          position="bottom-right"
          minWidth={minWidth}
          minHeight={minHeight}
          style={{ zIndex: 100 }}
        >
          <div
            className={`
              nodrag nopan
              absolute bottom-0 right-0
              w-5 h-5
              cursor-nwse-resize
              flex items-center justify-center
              ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
              transition-opacity duration-200
            `}
            style={{
              pointerEvents: 'auto',
              touchAction: 'none',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="text-gray-400 hover:text-blue-500 transition-colors"
            >
              <path
                d="M8 16L16 8M8 12L12 8M12 16L16 12"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </NodeResizeControl>
      )}
    </div>
  );
};

export default memo(BaseNode);