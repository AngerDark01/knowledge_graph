import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps, NodeResizeControl } from 'reactflow';
import { useGraphStore } from '@/stores/graph';

interface BaseNodeData {
  title: string;
  content?: string;
  validationError?: string;
}

// 定义通用的连接点组件
const ConnectionHandles = ({ isGroup = false, selected = false }) => {
  const groupHandleClass = isGroup 
    ? 'w-4 h-4 bg-blue-500 rounded-full border-2 border-white' 
    : 'w-3 h-3 bg-gray-500 hover:bg-blue-500 rounded-full border-2 border-white';
  
  const handleStyle = {
    zIndex: 50, // 确保在最上层
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
  minHeight = 100
}) => {
  const { updateNode } = useGraphStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.title);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleTitleBlur = () => {
    updateNode(id, { title: editValue });
    setIsEditing(false);
  };

  const handleTitleDoubleClick = () => {
    setIsEditing(true);
  };

  const containerClass = isGroup 
    ? `group relative rounded-2xl
       ${selected ? 'border-blue-500 border-[3px] shadow-lg' : 'border-blue-200 border-[2px]'}
       bg-blue-50 bg-opacity-70
       hover:shadow-lg
       outline-none
       box-border
       z-[1]` 
    : `group relative rounded-md
       ${selected ? 'border-blue-500 border-[2px] shadow-md' : 'border border-gray-200'}
       bg-white
       hover:shadow-lg
       outline-none
       box-border
       z-[2]`;
    
  const titleBarClass = isGroup
    ? `flex items-center rounded-t-2xl px-4 py-3 ${selected ? 'bg-blue-200 bg-opacity-80' : 'bg-blue-100 bg-opacity-80'}`
    : `flex items-center px-4 py-2 ${selected ? 'bg-blue-100' : 'bg-gray-100'}`;

  const containerStyle = { width: '100%', height: '100%' };

  return (
    <div className={containerClass} style={containerStyle}>
      <ConnectionHandles isGroup={isGroup} selected={selected} />
      
      {/* 标题栏 */}
      <div className={titleBarClass}>
        <div className="text-sm font-semibold flex items-center justify-between w-full">
          <div className="flex items-center">
            {isGroup && <span className="mr-2">📌</span>}
            {isEditing ? (
              <input
                className={`w-full bg-transparent border-b focus:border-solid focus:outline-none ${
                  isGroup ? 'border-blue-500 nodrag' : 'border-gray-300'
                }`}
                value={editValue}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                autoFocus
              />
            ) : (
              <div 
                onDoubleClick={handleTitleDoubleClick}
                className="cursor-text w-full"
              >
                {data.title}
                {data.validationError && (
                  <div className="text-xs text-red-500 mt-1">{data.validationError}</div>
                )}
              </div>
            )}
          </div>
          {isGroup && (
            <div className="text-xs bg-blue-200 rounded-full px-2 py-0.5">
              {groupNode && 'nodeIds' in groupNode ? (groupNode as any).nodeIds.length : 0} nodes
            </div>
          )}
        </div>
      </div>
      
      {/* 内容区域 */}
      <div className={`${isGroup ? 'h-[calc(100%-60px)] pb-2' : 'h-[calc(100%-40px)] p-2'} px-2 rounded-b-2xl overflow-hidden`}>
        {children}
      </div>
      
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