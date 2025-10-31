import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps, useUpdateNodeInternals, useStore } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGraphStore } from '@/stores/graph';

// 定义群组节点的数据结构
interface GroupNodeData {
  title: string;
  content?: string;
}

// 群组节点的属性类型
type CustomGroupNodeProps = NodeProps<{
  title: string;
  content?: string;
  validationError?: string;
}>;

const CustomGroup: React.FC<CustomGroupNodeProps> = ({ id, data }) => {
  const updateNodeInternals = useUpdateNodeInternals();
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

  React.useEffect(() => {
    updateNodeInternals(id);
  }, [id, updateNodeInternals]);

  return (
    <div className="shadow-md rounded-md border-2 border-dashed border-blue-300 bg-blue-50/30 min-w-[300px] min-h-[200px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500" />
      
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="py-2 px-4 bg-blue-100 rounded-t-md">
          <CardTitle className="text-sm font-semibold flex items-center">
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
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 rounded-b-md">
          <div className="text-xs text-gray-500 min-h-[100px]">
            {data.content || 'Drag nodes here to add them to the group'}
          </div>
        </CardContent>
      </Card>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
    </div>
  );
};

export default memo(CustomGroup);