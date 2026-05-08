export type ResizeCommitGate = {
  clear: (nodeId: string) => void;
  hasActiveResize: () => boolean;
  markResizing: (nodeId: string) => void;
  shouldCommitResizeEnd: (nodeId: string) => boolean;
};

export const createResizeCommitGate = (): ResizeCommitGate => {
  const activeResizeNodeIds = new Set<string>();

  return {
    clear: (nodeId: string) => {
      activeResizeNodeIds.delete(nodeId);
    },
    hasActiveResize: () => activeResizeNodeIds.size > 0,
    markResizing: (nodeId: string) => {
      activeResizeNodeIds.add(nodeId);
    },
    shouldCommitResizeEnd: (nodeId: string) => {
      if (!activeResizeNodeIds.has(nodeId)) {
        return false;
      }

      activeResizeNodeIds.delete(nodeId);
      return true;
    },
  };
};
