import React, { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeProps, useUpdateNodeInternals, useStore, Node, NodeDimensionChange } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGraphStore } from '@/stores/graph';
import { Group } from '@/types/graph/models';

// 群组节点的属性类型
type CustomGroupNodeProps = NodeProps<{
  title: string;
  content?: string;
  validationError?: string;
}>;

const CustomGroup: React.FC<CustomGroupNodeProps> = ({ id, data, selected }) => {
  const updateNodeInternals = useUpdateNodeInternals();
  const { updateNode, getNodeById } = useGraphStore();
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

  React.useEffect(() => {
    updateNodeInternals(id);
  }, [id, updateNodeInternals]);

  // 计算群组中节点的数量
  const nodeCount = groupNode?.nodeIds ? groupNode.nodeIds.length : 0;

  return (
    <div 
      className={`rounded-md border-2 ${selected ? 'border-blue-500 border-solid' : 'border-blue-300 border-dashed'} bg-blue-50/30 min-w-[300px] min-h-[200px]`}
      style={{ width: groupNode?.width, height: groupNode?.height }}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500" />
      
      <Card className="border-0 shadow-none bg-transparent h-full">
        <CardHeader className="py-2 px-4 bg-blue-100 rounded-t-md">
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
            <div className="text-xs bg-blue-200 rounded-full px-2 py-1">
              {nodeCount} {nodeCount === 1 ? 'node' : 'nodes'}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 h-[calc(100%-32px)]">
          <div className="text-xs text-gray-500 min-h-[100px] h-full">
            {data.content || 'Drag nodes here to add them to the group'}
          </div>
        </CardContent>
      </Card>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
    </div>
  );
};

export default memo(CustomGroup);