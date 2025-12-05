// src/components/graph/controls/LayoutControl.tsx
import React, { useState, useCallback } from 'react';
import { Button } from '../../ui/button';
import { PlayIcon, CogIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import { useGraphStore } from '@/stores/graph';
import { LayoutManager } from '@/services/layout';

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
  const updateGroupBoundary = useGraphStore(state => state.updateGroupBoundary);

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

      // 初始化布局管理器（自动使用 ELK 布局策略）
      const layoutManager = new LayoutManager();

      // 应用ELK布局算法
      const layoutResult = await layoutManager.applyLayout(
        nodes,
        edges,
        {
          animate: true,
          strategy: 'elk-layout'
        }
      );

      if (layoutResult.success) {
        // 启用布局模式以防止约束逻辑干扰
        useGraphStore.getState().setIsLayoutMode(true);

        // 更新节点位置和尺寸
        for (const [nodeId, positionData] of layoutResult.nodes) {
          const updateData: any = { position: { x: positionData.x, y: positionData.y } };

          // 如果布局结果包含尺寸信息（群组节点），也一并更新
          if ((positionData as any).width !== undefined) {
            updateData.width = (positionData as any).width;
          }
          if ((positionData as any).height !== undefined) {
            updateData.height = (positionData as any).height;
          }
          // 如果包含边界信息，也一并更新
          if ((positionData as any).boundary !== undefined) {
            updateData.boundary = (positionData as any).boundary;
          }

          updateNode(nodeId, updateData);
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

      // 应用ELK群组内部布局算法（仅对选中群组的子节点进行布局）
      const layoutResult = await layoutManager.applyLayout(
        nodes,
        edges,
        {
          animate: true,
          strategy: 'elk-group-layout', // 使用新的群组布局策略
          groupId: selectedNodeId       // 传递目标群组ID
        }
      );

      if (layoutResult.success) {
        // 启用布局模式以防止约束逻辑干扰
        useGraphStore.getState().setIsLayoutMode(true);

        // ⭐ 修复：更新群组内节点的位置（不包括目标群组本身）
        for (const [nodeId, positionData] of layoutResult.nodes) {
          const updateData: any = { position: { x: positionData.x, y: positionData.y } };

          // ✅ 如果布局结果包含尺寸信息（群组节点），也一并更新
          if ((positionData as any).width !== undefined) {
            updateData.width = (positionData as any).width;
          }
          if ((positionData as any).height !== undefined) {
            updateData.height = (positionData as any).height;
          }
          if ((positionData as any).boundary !== undefined) {
            updateData.boundary = (positionData as any).boundary;
          }

          // ⭐ 同时更新 style，确保 ReactFlow 渲染正确的尺寸
          if ((positionData as any).width !== undefined || (positionData as any).height !== undefined) {
            updateData.style = {
              width: (positionData as any).width,
              height: (positionData as any).height
            };
          }

          console.log(`🔧 更新节点 ${nodeId}:`, updateData);
          updateNode(nodeId, updateData);
        }

        // 更新边的连接点 - 这里暂时保留但可能不适用
        layoutResult.edges.forEach((edgeData, edgeId) => {
          updateEdge(edgeId, {
            sourceHandle: edgeData.sourceHandle,
            targetHandle: edgeData.targetHandle
          });
        });

        console.log(`✅ 群组布局完成，更新了 ${layoutResult.nodes.size} 个群组内节点`);

        // 🔧 不再直接触发边界更新，因为布局结果已包含正确的尺寸信息
        // 系统会根据节点约束自动调整，避免连锁反应

        // 额外的边优化 - 仅优化群组内的边
        const currentNodes = useGraphStore.getState().getNodes();
        const currentEdges = useGraphStore.getState().getEdges();

        // 只获取群组内的节点用于边优化
        const groupNodes = currentNodes.filter(
          n => 'groupId' in n && (n as any).groupId === selectedNodeId
        );

        import('@/services/layout/algorithms/EdgeOptimizer')
          .then(({ EdgeOptimizer }) => {
            const edgeOptimizer = new EdgeOptimizer();
            const optimizedEdges = edgeOptimizer.optimizeEdgeHandles(groupNodes, currentEdges);

            optimizedEdges.forEach((edgeData) => {
              // 只更新群组内部的边
              if (
                groupNodes.some(n => n.id === edgeData.source) ||
                groupNodes.some(n => n.id === edgeData.target)
              ) {
                updateEdge(edgeData.id, {
                  sourceHandle: edgeData.sourceHandle,
                  targetHandle: edgeData.targetHandle
                });
              }
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
      useGraphStore.getState().setIsLayoutMode(false);
    } finally {
      setIsProcessing(false);
    }
  }, [nodes, edges, isProcessing, selectedNodeId, isGroupSelected, childrenCount, updateNode, updateEdge, updateGroupBoundary]);

  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleLayout}
        disabled={isProcessing}
        className="w-full flex items-center justify-center gap-2"
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
          className="w-full flex items-center justify-center gap-2 border-blue-300 text-blue-600 hover:bg-blue-50"
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
        className="w-full flex items-center justify-center gap-2"
        title="布局配置"
      >
        <CogIcon className="w-4 h-4" />
        <span>布局配置</span>
      </Button>
    </div>
  );
};

export default LayoutControl;