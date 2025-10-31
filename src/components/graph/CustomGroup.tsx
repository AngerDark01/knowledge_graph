import React, { memo, useState, useCallback, HTMLAttributes } from 'react';
import { Handle, Position, NodeProps, Node, ResizeControl, ResizeParams, NodeResizeControl } from 'reactflow';
import { useGraphStore } from '@/stores/graph';
import { Group } from '@/types/graph/models';

// 群组节点的属性类型
type CustomGroupNodeProps = NodeProps<{
  title: string;
  content?: string;
  validationError?: string;
}>;

const CustomGroup: React.FC<CustomGroupNodeProps> = ({ id, data, selected, dimensions, children }) => {
  const { updateNode, getNodeById, updateGroupBoundary } = useGraphStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.title);
  
  const groupNode = getNodeById(id) as Group;

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

  // 处理尺寸调整
  const onResize = useCallback((_: any, params: ResizeParams) => {
    updateNode(id, {
      width: params.width,
      height: params.height,
    });
    // 更新群组边界
    setTimeout(() => {
      updateGroupBoundary(id);
    }, 0);
  }, [id, updateNode, updateGroupBoundary]);

  // 计算群组中节点的数量
  const nodeCount = groupNode?.nodeIds ? groupNode.nodeIds.length : 0;

  return (
    <div 
      className={`
        relative flex rounded-2xl
        ${selected ? 'border-components-option-card-option-selected-border border' : 'border-transparent'}
      `}
      style={{ 
        width: groupNode?.width || dimensions?.width || 300, 
        height: groupNode?.height || dimensions?.height || 200 
      }}
    >
      <div 
        className={`
          group relative pb-1 shadow-xs
          rounded-[15px] border border-transparent
          flex h-full w-full flex-col 
          ${selected ? 'border-blue-500 border-solid' : 'border-blue-400/80 border-dashed'}
          bg-blue-50/50
          hover:shadow-lg
        `}
      >
        {/* 顶部目标句柄 */}
        <div className="absolute top-[-1px] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500" />
        </div>
        
        <div className="flex items-center rounded-t-2xl px-3 pb-2 pt-3 bg-blue-100/80">
          <div className="text-sm font-semibold flex items-center justify-between w-full">
            <div className="flex items-center">
              <span className="mr-2">📌</span>
              {isEditing ? (
                <input
                  className="w-full bg-transparent border-b border-dashed border-blue-300 focus:border-solid focus:outline-none"
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
            <div className="text-xs bg-blue-200 rounded-full px-2 py-0.5">
              {nodeCount} {nodeCount === 1 ? 'node' : 'nodes'}
            </div>
          </div>
        </div>
        
        <div className="grow pb-1 pl-1 pr-1 relative overflow-hidden">
          {/* 群组内容区域 - 这里将显示子节点 */}
          <div className="w-full h-full relative overflow-hidden">
            {children}
          </div>
        </div>
        
        {/* 底部源句柄 */}
        <div className="absolute bottom-[-1px] left-1/2 -translate-x-1/2 translate-y-1/2 z-10">
          <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
        </div>
      </div>
      
      {/* 尺寸调整器 - 使用ReactFlow的NodeResizeControl */}
      <NodeResizeControl
        position='bottom-right'
        className='!border-none !bg-transparent'
        onResize={onResize}
        minWidth={200}
        minHeight={150}
      >
        <div className='absolute bottom-[1px] right-[1px]'>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M5.19009 11.8398C8.26416 10.6196 10.7144 8.16562 11.9297 5.08904" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </NodeResizeControl>
    </div>
  );
};

export default memo(CustomGroup);