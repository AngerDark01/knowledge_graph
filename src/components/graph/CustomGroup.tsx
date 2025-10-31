import React, { memo, useState, useCallback, HTMLAttributes } from 'react';
import { Handle, Position, NodeProps, Node, ResizeControl, ResizeParams, NodeResizeControl } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      className={`rounded-lg border-2 ${selected ? 'border-blue-500 border-solid' : 'border-blue-400/80 border-dashed'} bg-blue-50/50`}
      style={{ 
        width: groupNode?.width || dimensions?.width || 300, 
        height: groupNode?.height || dimensions?.height || 200 
      }}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500" />
      
      <Card className="border-0 shadow-none bg-transparent h-full">
        <CardHeader className="py-2 px-4 bg-blue-100/80 rounded-t-lg">
          <CardTitle className="text-sm font-semibold flex items-center justify-between">
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
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 h-[calc(100%-32px)] relative">
          {/* 群组内容区域 - 这里将显示子节点 */}
          <div className="w-full h-full relative overflow-hidden">
            {children}
          </div>
        </CardContent>
      </Card>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
      
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