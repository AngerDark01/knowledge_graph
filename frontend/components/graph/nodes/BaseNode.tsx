import React, { memo } from 'react';
import { Handle, Position, NodeResizeControl } from 'reactflow';

interface BaseNodeData {
  title: string;
  content?: string;
  validationError?: string;
  isExpanded?: boolean;
}

// 定义通用的连接点组件 - 保持原始可见样式
const ConnectionHandles = ({ isGroup = false }) => {
  const groupHandleClass = isGroup
    ? 'w-4 h-4 bg-white border border-slate-300 rounded-full shadow-sm hover:bg-blue-500 hover:border-blue-500'
    : 'w-3 h-3 bg-white border border-slate-300 rounded-full shadow-sm hover:bg-blue-500 hover:border-blue-500';

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
        className={`${groupHandleClass} !-top-[6px] opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100`}
        style={{ ...handleStyle, left: '50%', transform: 'translateX(-50%)' }}
        isConnectable
      />

      {/* 右侧连接点 */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className={`${groupHandleClass} !-right-[6px] opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100`}
        style={{ ...handleStyle, top: '50%', transform: 'translateY(-50%)' }}
        isConnectable
      />

      {/* 底部连接点 */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className={`${groupHandleClass} !-bottom-[6px] opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100`}
        style={{ ...handleStyle, left: '50%', transform: 'translateX(-50%)' }}
        isConnectable
      />

      {/* 左侧连接点 */}
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        className={`${groupHandleClass} !-left-[6px] opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100`}
        style={{ ...handleStyle, top: '50%', transform: 'translateY(-50%)' }}
        isConnectable
      />
    </>
  );
};

export interface BaseNodeProps<T = BaseNodeData, U = unknown> {
  id: string;
  data: T;
  isGroup?: boolean;
  selected?: boolean;
  groupNode?: U;
  showResizeControl?: boolean;
  minWidth?: number;
  minHeight?: number;
  children?: React.ReactNode;
  isExpanded?: boolean;
  surface?: 'legacy' | 'transparent';
  renderContent?: () => React.ReactNode;
}

const BaseNode: React.FC<BaseNodeProps> = ({
  children,
  isGroup = false,
  selected,
  showResizeControl = false,
  minWidth = 150,
  minHeight = 100,
  surface = 'legacy',
  renderContent
}) => {
  const containerClass = surface === 'transparent'
    ? `group relative
       outline-none
       box-border
       ${isGroup ? 'z-[1]' : 'z-[2]'}`
    : isGroup
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
      <ConnectionHandles isGroup={isGroup} />

      {isGroup ? (
        children
      ) : (
        renderContent?.()
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
