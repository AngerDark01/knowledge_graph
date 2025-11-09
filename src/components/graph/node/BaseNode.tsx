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
    zIndex: 50,
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
      updateNode(id, { expanded: !internalIsExpanded });
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
      
      {/* 尺寸调整器 */}
      {showResizeControl && (
        <div className={`
          hidden group-hover:block
          ${selected ? '!block' : ''}
        `}>
          <NodeResizeControl
            position="bottom-right"
            className="!border-none !bg-transparent"
            minWidth={minWidth}
            minHeight={minHeight}
          >
            <div className="absolute bottom-[1px] right-[1px]">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path 
                  d="M5.19009 11.8398C8.26416 10.6196 10.7144 8.16562 11.9297 5.08904" 
                  stroke="black" 
                  strokeOpacity="0.16" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                />
              </svg>
            </div>
          </NodeResizeControl>
        </div>
      )}
    </div>
  );
};

export default memo(BaseNode);