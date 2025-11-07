/**
 * 智能节点路由器
 *
 * 根据节点的 viewMode 自动选择合适的视图组件进行渲染
 * 使用策略模式，优雅地处理不同的节点类型
 */

import React, { memo } from 'react';
import { NodeProps } from 'reactflow';
import { useGraphStore } from '@/stores/graph';
import { toBaseNode } from '@/utils/graph/nodeAdapter';
import NoteView from './viewModes/NoteView';
import ContainerView from './viewModes/ContainerView';
import { Node, Group } from '@/types/graph/models';

/**
 * 视图组件映射表
 */
const VIEW_COMPONENTS = {
  note: NoteView,
  container: ContainerView,
} as const;

/**
 * 智能节点组件
 *
 * 自动根据节点的 viewMode 选择合适的视图进行渲染
 */
const SmartNode: React.FC<NodeProps> = ({ id, data, selected, ...rest }) => {
  const { getNodeById } = useGraphStore();
  const node = getNodeById(id);

  if (!node) {
    console.error(`Node ${id} not found`);
    return null;
  }

  // 转换为统一的 BaseNode
  const baseNode = toBaseNode(node);

  // 根据 viewMode 选择合适的视图组件
  const ViewComponent = VIEW_COMPONENTS[baseNode.viewMode];

  if (!ViewComponent) {
    console.error(`Unknown view mode: ${baseNode.viewMode}`);
    return null;
  }

  // 渲染对应的视图
  return (
    <ViewComponent
      id={id}
      node={baseNode}
      selected={selected}
      {...rest}
    />
  );
};

export default memo(SmartNode);

/**
 * 导出视图组件类型（供外部使用）
 */
export type { NodeProps };
