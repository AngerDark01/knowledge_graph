import { useEffect } from 'react';
import { useReactFlow } from 'reactflow';
import { useGraphStore } from '@/stores/graph';

export const useKeyboardShortcuts = (onRecenter: () => void) => {
  const reactFlowInstance = useReactFlow();

  // 处理键盘快捷键
  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '0':
            e.preventDefault();
            onRecenter();
            break;
          case '+':
          case '=':
            e.preventDefault();
            if (reactFlowInstance) {
              reactFlowInstance.zoomIn();
            }
            break;
          case '-':
            e.preventDefault();
            if (reactFlowInstance) {
              reactFlowInstance.zoomOut();
            }
            break;
        }
      }

      // Delete 键删除选中的节点或边
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (reactFlowInstance) {
          // 删除选中的节点
          const selectedNodes = reactFlowInstance.getNodes().filter((node: any) => node.selected);
          selectedNodes.forEach((node: any) => {
            // 需要同时删除关联的边
            const { getEdges } = useGraphStore.getState();
            const edges = getEdges();
            edges.forEach((edge: any) => {
              if (edge.source === node.id || edge.target === node.id) {
                const { deleteEdge } = useGraphStore.getState();
                deleteEdge(edge.id);
              }
            });
            // 删除节点
            const { deleteNode } = useGraphStore.getState();
            deleteNode(node.id);
          });
          
          // 删除选中的边
          const selectedEdges = reactFlowInstance.getEdges().filter((edge: any) => edge.selected);
          selectedEdges.forEach((edge: any) => {
            const { deleteEdge } = useGraphStore.getState();
            deleteEdge(edge.id);
          });
        }
      }
    };

    window.addEventListener('keydown', keyHandler);
    return () => window.removeEventListener('keydown', keyHandler);
  }, [onRecenter, reactFlowInstance]);
};