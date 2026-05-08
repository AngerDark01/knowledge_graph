import { useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import { useGraphStore } from '@/stores/graph';
import { createCanvasClearPlan, useOntologyDocumentStore } from '@/features/ontology-canvas';
import { useWorkspaceStore } from '@/stores/workspace';

export const useViewportControls = () => {
  const reactFlowInstance = useReactFlow();
  const { getNodes, getEdges, deleteNode, deleteEdge } = useGraphStore();
  const currentCanvasId = useWorkspaceStore(state => state.currentCanvasId);

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
    const deletionPlan = createCanvasClearPlan(getNodes(), getEdges());
    useOntologyDocumentStore.getState().deleteElements({
      ids: [...deletionPlan.nodeIds, ...deletionPlan.edgeIds],
    }, {
      canvasId: currentCanvasId,
      reason: 'clear-canvas',
    });

    deletionPlan.nodeIds.forEach(deleteNode);
    deletionPlan.edgeIds.forEach(deleteEdge);
  }, [currentCanvasId, getNodes, getEdges, deleteNode, deleteEdge]);

  return {
    onRecenter,
    onClear
  };
};
