import { useEffect } from 'react';
import { ReactFlowInstance } from 'reactflow';
import { useGraphStore } from '@/stores/graph';
import { createCanvasSelectionDeletionPlan, useOntologyDocumentStore } from '@/features/ontology-canvas';
import { useWorkspaceStore } from '@/stores/workspace';

export const useKeyboardShortcuts = (onRecenter: () => void, reactFlowInstance: ReactFlowInstance | null) => {
  const currentCanvasId = useWorkspaceStore(state => state.currentCanvasId);

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
          const deletionPlan = createCanvasSelectionDeletionPlan(
            reactFlowInstance.getNodes(),
            reactFlowInstance.getEdges()
          );
          const { deleteNode, deleteEdge } = useGraphStore.getState();
          useOntologyDocumentStore.getState().deleteElements({
            ids: [...deletionPlan.nodeIds, ...deletionPlan.edgeIds],
          }, {
            canvasId: currentCanvasId,
            reason: 'keyboard-delete',
          });

          deletionPlan.nodeIds.forEach(deleteNode);
          deletionPlan.edgeIds.forEach(deleteEdge);
        }
      }
    };

    window.addEventListener('keydown', keyHandler);
    return () => window.removeEventListener('keydown', keyHandler);
  }, [currentCanvasId, onRecenter, reactFlowInstance]);
};
