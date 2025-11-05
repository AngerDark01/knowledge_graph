import { useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import { useGraphStore } from '@/stores/graph';

export const useViewportControls = () => {
  const reactFlowInstance = useReactFlow();
  const { getNodes, getEdges, deleteNode, deleteEdge } = useGraphStore();

  // 复位视图
  const onRecenter = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView();
    }
  }, [reactFlowInstance]);

  // 清除画布
  const onClear = useCallback(() => {
    // 清除所有节点和边
    // 注意：实际应用中可能需要添加确认对话框
    getNodes().forEach((node: any) => deleteNode(node.id));
    getEdges().forEach((edge: any) => deleteEdge(edge.id));
  }, [getNodes, getEdges, deleteNode, deleteEdge]);

  return {
    onRecenter,
    onClear
  };
};