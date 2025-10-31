import React, { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeProps, useUpdateNodeInternals, Node, NodeResizer, ResizeParams } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGraphStore } from '@/stores/graph';
import { Group } from '@/types/graph/models';

// 群组节点的属性类型
type CustomGroupNodeProps = NodeProps<{
  title: string;
  content?: string;
  validationError?: string;
}>;

const CustomGroup: React.FC<CustomGroupNodeProps> = ({ id, data, selected, dimensions }) => {
  const updateNodeInternals = useUpdateNodeInternals();
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

  React.useEffect(() => {
    updateNodeInternals(id);
  }, [id, updateNodeInternals]);

  // 计算群组中节点的数量
  const nodeCount = groupNode?.nodeIds ? groupNode.nodeIds.length : 0;

  return (
    <div 
      className={`rounded-lg border-2 ${selected ? 'border-blue-500 border-solid' : 'border-blue-400/80 border-dashed'} bg-blue-50/50 min-w-[300px] min-h-[200px]`}
      style={{ width: groupNode?.width || dimensions?.width, height: groupNode?.height || dimensions?.height }}
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
        <CardContent className="p-4 h-[calc(100%-32px)]">
          <div className="text-xs text-gray-600 min-h-[100px] h-full">
            {data.content || 'Drag nodes here to add them to the group'}
          </div>
        </CardContent>
      </Card>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
      
      {/* 尺寸调整器 */}
      <NodeResizer
        color="#3b82f6"
        minWidth={200}
        minHeight={150}
        onResize={onResize}
        isVisible={selected}
      />
    </div>
  );
};

export default memo(CustomGroup);