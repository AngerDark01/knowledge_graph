import { useEffect } from 'react';
import { ReactFlowInstance } from 'reactflow';
import { useGraphStore } from '@/stores/graph';

export const useKeyboardShortcuts = (onRecenter: () => void, reactFlowInstance: ReactFlowInstance | null) => {
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
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              // Ctrl+Shift+Z - 重做
              const { redo } = useGraphStore.getState();
              if (redo) redo();
            } else {
              // Ctrl+Z - 撤销
              const { undo } = useGraphStore.getState();
              if (undo) undo();
            }
            break;
          case 'y':
            // Ctrl+Y - 重做
            e.preventDefault();
            const { redo } = useGraphStore.getState();
            if (redo) redo();
            break;
        }
      }

      // Delete 键删除选中的节点或边
      if ((e.key === 'Delete' || e.key === 'Backspace') && 
          !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        // 只有当焦点不在输入框或文本域中时才执行删除操作
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