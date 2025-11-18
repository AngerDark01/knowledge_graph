// src/components/graph/controls/LayoutControl.tsx
import React, { useState, useCallback } from 'react';
import { Button } from '../../ui/button';
import { PlayIcon, CogIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import { useGraphStore } from '@/stores/graph';
import { LayoutManager, GridCenterLayoutStrategy } from '@/services/layout';

interface LayoutControlProps {
  className?: string;
}

const LayoutControl: React.FC<LayoutControlProps> = ({ className = '' }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // 从store获取节点和边数据
  const nodes = useGraphStore(state => state.getNodes());
  const edges = useGraphStore(state => state.getEdges());
  const updateNode = useGraphStore(state => state.updateNode);
  const updateEdge = useGraphStore(state => state.updateEdge);
  const setSelectedNodeId = useGraphStore(state => state.setSelectedNodeId);
  const selectedNodeId = useGraphStore(state => state.selectedNodeId);

  // 检查选中的节点是否为群组
  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const isGroupSelected = selectedNode?.type === 'group';

  // 获取选中群组的子节点数量
  const childrenCount = isGroupSelected
    ? nodes.filter(n => 'groupId' in n && (n as any).groupId === selectedNodeId).length
    : 0;

  // 布局处理函数（全画布）
  const handleLayout = useCallback(async () => {
    if (isProcessing) {
      console.log("Layout already in progress");
      return;
    }

    try {
      setIsProcessing(true);

      // 禁用用户交互
      useGraphStore.getState().setSelectedNodeId(null);

      // 初始化布局管理器
      const layoutManager = new LayoutManager();

      // 注册网格中心布局策略
      const gridCenterStrategy = new GridCenterLayoutStrategy();
      layoutManager.registerStrategy('grid-center-layout', gridCenterStrategy);

      // 应用布局算法（包含边优化）
      const layoutResult = await layoutManager.applyLayout(
        nodes,
        edges,
        {
          strategy: 'grid-center-layout',
          animate: true,
          useWeightedLayout: true
        }
      );

      if (layoutResult.success) {
        // 启用布局模式以防止约束逻辑干扰
        useGraphStore.getState().setIsLayoutMode(true);

        // 更新节点位置
        for (const [nodeId, position] of layoutResult.nodes) {
          updateNode(nodeId, { position });
        }

        // 更新边的连接点
        layoutResult.edges.forEach((edgeData, edgeId) => {
          updateEdge(edgeId, {
            sourceHandle: edgeData.sourceHandle,
            targetHandle: edgeData.targetHandle
          });
        });

        // 清除选中状态
        setSelectedNodeId(null);

        // 额外的边优化：确保所有边的连接点基于最终节点位置进行了优化
        const finalNodes = useGraphStore.getState().getNodes();
        const finalEdges = useGraphStore.getState().getEdges();

        // 创建边优化器实例并优化所有边
        import('@/services/layout/algorithms/EdgeOptimizer')
          .then(({ EdgeOptimizer }) => {
            const edgeOptimizer = new EdgeOptimizer();
            const optimizedEdges = edgeOptimizer.optimizeEdgeHandles(finalNodes, finalEdges);

            // 更新所有边的连接点
            optimizedEdges.forEach((edgeData) => {
              updateEdge(edgeData.id, {
                sourceHandle: edgeData.sourceHandle,
                targetHandle: edgeData.targetHandle
              });
            });

            console.log(`🔄 布局后优化了 ${optimizedEdges.length} 条边的连接点`);
          })
          .catch(error => {
            console.error("额外边优化失败:", error);
          })
          .finally(() => {
            // 确保在所有操作完成后，禁用布局模式
            useGraphStore.getState().setIsLayoutMode(false);
          });
      } else {
        console.error("Layout failed:", layoutResult.errors);

        // 即使布局失败，也要确保禁用布局模式
        useGraphStore.getState().setIsLayoutMode(false);
      }
    } catch (error) {
      console.error("Layout error:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [nodes, edges, isProcessing, updateNode, updateEdge, setSelectedNodeId]);

  // 群组内部布局处理函数
  const handleGroupLayout = useCallback(async () => {
    if (isProcessing) {
      console.log("Layout already in progress");
      return;
    }

    if (!selectedNodeId || !isGroupSelected) {
      console.warn("No group selected for layout");
      return;
    }

    if (childrenCount === 0) {
      console.warn("Selected group has no children to layout");
      return;
    }

    try {
      setIsProcessing(true);

      console.log(`📐 开始对群组 ${selectedNodeId} 内的 ${childrenCount} 个子节点进行布局`);

      // 初始化布局管理器
      const layoutManager = new LayoutManager();

      // 注册网格中心布局策略
      const gridCenterStrategy = new GridCenterLayoutStrategy();
      layoutManager.registerStrategy('grid-center-layout', gridCenterStrategy);

      // 应用布局算法（针对选中群组）
      const layoutResult = await layoutManager.applyLayout(
        nodes,
        edges,
        {
          strategy: 'grid-center-layout',
          targetGroupId: selectedNodeId,  // ✨ 指定目标群组
          layoutScope: 'group',
          animate: true,
          useWeightedLayout: true
        }
      );

      if (layoutResult.success) {
        // 启用布局模式以防止约束逻辑干扰
        useGraphStore.getState().setIsLayoutMode(true);

        // 更新节点位置
        for (const [nodeId, position] of layoutResult.nodes) {
          updateNode(nodeId, { position });
        }

        // 更新边的连接点
        layoutResult.edges.forEach((edgeData, edgeId) => {
          updateEdge(edgeId, {
            sourceHandle: edgeData.sourceHandle,
            targetHandle: edgeData.targetHandle
          });
        });

        console.log(`✅ 群组布局完成，更新了 ${layoutResult.nodes.size} 个节点`);

        // 额外的边优化
        const finalNodes = useGraphStore.getState().getNodes();
        const finalEdges = useGraphStore.getState().getEdges();

        import('@/services/layout/algorithms/EdgeOptimizer')
          .then(({ EdgeOptimizer }) => {
            const edgeOptimizer = new EdgeOptimizer();
            const optimizedEdges = edgeOptimizer.optimizeEdgeHandles(finalNodes, finalEdges);

            optimizedEdges.forEach((edgeData) => {
              updateEdge(edgeData.id, {
                sourceHandle: edgeData.sourceHandle,
                targetHandle: edgeData.targetHandle
              });
            });

            console.log(`🔄 群组布局后优化了 ${optimizedEdges.length} 条边的连接点`);
          })
          .catch(error => {
            console.error("额外边优化失败:", error);
          })
          .finally(() => {
            useGraphStore.getState().setIsLayoutMode(false);
          });
      } else {
        console.error("Group layout failed:", layoutResult.errors);
        useGraphStore.getState().setIsLayoutMode(false);
      }
    } catch (error) {
      console.error("Group layout error:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [nodes, edges, isProcessing, selectedNodeId, isGroupSelected, childrenCount, updateNode, updateEdge]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleLayout}
        disabled={isProcessing}
        className="flex items-center gap-2"
        title="应用网格中心布局（自动优化边连接点）"
      >
        {isProcessing ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            布局中...
          </>
        ) : (
          <>
            <ArrowsPointingOutIcon className="w-4 h-4" />
            应用布局
          </>
        )}
      </Button>

      {/* 群组内部布局按钮 */}
      {isGroupSelected && childrenCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleGroupLayout}
          disabled={isProcessing}
          className="flex items-center gap-2 border-blue-300 text-blue-600 hover:bg-blue-50"
          title={`布局选中群组的 ${childrenCount} 个子节点`}
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              布局中...
            </>
          ) : (
            <>
              <ArrowsPointingOutIcon className="w-4 h-4" />
              布局群组内部 ({childrenCount})
            </>
          )}
        </Button>
      )}

      {/* 配置按钮 - 暂时未实现功能 */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => console.log("Layout configuration clicked")}
        disabled={isProcessing}
        title="布局配置"
      >
        <CogIcon className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default LayoutControl;