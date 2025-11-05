import React, { memo } from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';
import { useGraphStore } from '@/stores/graph';
import { Group } from '@/types/graph/models';

type GroupNodeProps = NodeProps<{
  title: string;
  content?: string;
  validationError?: string;
}>;

const GroupNode: React.FC<GroupNodeProps> = ({ id, data, selected }) => {
  const { getNodeById } = useGraphStore();
  const groupNode = getNodeById(id) as Group;

  // 计算群组中节点的数量
  const nodeCount = groupNode?.nodeIds ? groupNode.nodeIds.length : 0;

  return (
    <BaseNode 
      id={id} 
      data={data} 
      isGroup={true} 
      selected={selected} 
      groupNode={groupNode}
      showResizeControl={true}
      minWidth={200}
      minHeight={150}
    >
      {/* 内容区域 */}
      <div className="h-[calc(100%-60px)] pb-2 px-2 rounded-b-2xl overflow-hidden">
        {/* 子节点由ReactFlow自动渲染 */}
      </div>
    </BaseNode>
  );
};

export default memo(GroupNode);