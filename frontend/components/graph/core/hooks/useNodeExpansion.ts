import { useState, useCallback, useEffect } from 'react';
import { useGraphStore } from '@/stores/graph';

interface UseNodeExpansionParams {
  id: string;
  initialExpandedState?: boolean;
  nodeData?: any; // Node or Group type
}

export const useNodeExpansion = ({ id, initialExpandedState, nodeData }: UseNodeExpansionParams) => {
  const { updateNode, getNodeById } = useGraphStore();
  const [isExpanded, setIsExpanded] = useState(initialExpandedState ?? false);
  
  // 同步store中的展开状态
  useEffect(() => {
    const currentNode = getNodeById(id);
    if (currentNode && currentNode.isExpanded !== isExpanded) {
      setIsExpanded(currentNode.isExpanded ?? false);
    }
  }, [id, getNodeById, isExpanded]);

  // 展开/收缩逻辑
  const collapsedWidth = 350;
  const collapsedHeight = 280; // 增加到280以完整显示所有内容
  
  // 展开时的默认尺寸
  const defaultExpandedWidth = 600;
  const defaultExpandedHeight = 450;

  const toggleExpand = useCallback(() => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    
    if (newExpandedState) {
      // 展开:使用用户自定义尺寸或默认展开尺寸
      const expandedSize = nodeData?.customExpandedSize || {
        width: defaultExpandedWidth,
        height: defaultExpandedHeight
      };
      
      console.log('📏 展开到尺寸:', expandedSize);
      updateNode(id, { 
        isExpanded: true,
        width: expandedSize.width,
        height: expandedSize.height
      });
    } else {
      // 收缩:返回固定的初始尺寸
      console.log('📏 收缩到初始尺寸:', { width: collapsedWidth, height: collapsedHeight });
      updateNode(id, { 
        isExpanded: false,
        width: collapsedWidth,
        height: collapsedHeight
      });
    }
  }, [isExpanded, id, updateNode, nodeData]);

  return {
    isExpanded,
    toggleExpand,
    setIsExpanded
  };
};