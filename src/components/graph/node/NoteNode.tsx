import React, { memo } from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';

interface NoteNodeData {
  title: string;
  content?: string;
  validationError?: string;
}

const NoteNode: React.FC<NodeProps<NoteNodeData>> = ({ id, data, selected }) => {
  return (
    <BaseNode 
      id={id} 
      data={data} 
      isGroup={false} 
      selected={selected}
      showResizeControl={true}
      minWidth={150}
      minHeight={100}
    >
      {/* 自定义节点的特定内容 */}
      <div className="text-xs text-gray-500">{data.content || 'Node content'}</div>
    </BaseNode>
  );
};

export default memo(NoteNode);