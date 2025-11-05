import { useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { useGraphStore } from '@/stores/graph';

export const useSelectionHandling = () => {
  const { selectedNodeId, selectedEdgeId, setSelectedNodeId, setSelectedEdgeId } = useGraphStore();

  // 处理节点选择
  const onNodeClick = useCallback((e: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null); // 取消边的选择
  }, [setSelectedNodeId, setSelectedEdgeId]);

  // 处理节点双击
  const onNodeDoubleClick = useCallback((e: React.MouseEvent, node: Node) => {
    // 设置为选中状态以便编辑
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null); // 取消边的选择
  }, [setSelectedNodeId, setSelectedEdgeId]);

  // 处理边选择
  const onEdgeClick = useCallback((e: React.MouseEvent, edge: Edge) => {
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null); // 取消节点的选择
  }, [setSelectedEdgeId, setSelectedNodeId]);

  return {
    selectedNodeId,
    selectedEdgeId,
    onNodeClick,
    onEdgeClick,
    onNodeDoubleClick
  };
};