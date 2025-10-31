import React, { memo } from 'react';
import { Handle, Position, useUpdateNodeInternals, NodeProps } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGraphStore } from '@/stores/graph';

interface CustomNodeData {
  title: string;
  content?: string;
  validationError?: string;
}

const CustomNode: React.FC<NodeProps<CustomNodeData>> = ({ id, data }) => {
  const updateNodeInternals = useUpdateNodeInternals();
  const { updateNode } = useGraphStore();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(data.title);

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
    <div className="shadow-md rounded-md border">
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      <Card 
        className={`border-0 shadow-none ${data.validationError ? 'border-red-500 border-2' : ''}`}
      >
        <CardHeader className="py-2 px-4">
          <CardTitle className="text-sm font-semibold">
            {isEditing ? (
              <input
                className="w-full bg-transparent border-b border-dashed border-gray-300 focus:border-solid focus:outline-none"
                value={editValue}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                autoFocus
              />
            ) : (
              <div 
                onDoubleClick={handleTitleDoubleClick}
                className="cursor-text"
              >
                {data.title}
                {data.validationError && (
                  <div className="text-xs text-red-500 mt-1">{data.validationError}</div>
                )}
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="text-xs text-gray-500">{data.content || 'Node content'}</div>
        </CardContent>
      </Card>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  );
};

export default memo(CustomNode);