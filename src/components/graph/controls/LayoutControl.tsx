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

      // 初始化布局管理器（自动使用 canvas-layout 策略）
      const layoutManager = new LayoutManager();

      // 应用布局算法（包含边优化）
      const layoutResult = await layoutManager.applyLayout(
        nodes,
        edges,
        {
          animate: true,
          useWeightedLayout: true
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

      // 初始化布局管理器（自动使用 group-layout 策略）
      const layoutManager = new LayoutManager();

      // 应用布局算法（针对选中群组）
      const layoutResult = await layoutManager.applyLayout(
        nodes,
        edges,
        {
          targetGroupId: selectedNodeId,  // ✨ 指定目标群组，自动选择 group-layout
          layoutScope: 'group',
          animate: true,
          useWeightedLayout: true
        }
      );

      if (layoutResult.success) {
        // 启用布局模式以防止约束逻辑干扰
        useGraphStore.getState().setIsLayoutMode(true);

        // ⭐ 修复：更新所有节点的位置和尺寸（包括目标群组）
        for (const [nodeId, positionData] of layoutResult.nodes) {
          const updateData: any = { position: { x: positionData.x, y: positionData.y } };

          // ✅ 移除条件判断，让所有节点（包括目标群组）都能更新尺寸
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

        // 更新边的连接点
        layoutResult.edges.forEach((edgeData, edgeId) => {
          updateEdge(edgeId, {
            sourceHandle: edgeData.sourceHandle,
            targetHandle: edgeData.targetHandle
          });
        });

        console.log(`✅ 群组布局完成，更新了 ${layoutResult.nodes.size} 个节点`);

        // 🔧 触发群组边界更新以确保父群组大小及时调整（用于嵌套群组场景）
        console.log(`🔧 触发群组边界更新: ${selectedNodeId}`);
        updateGroupBoundary(selectedNodeId);

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
  }, [nodes, edges, isProcessing, selectedNodeId, isGroupSelected, childrenCount, updateNode, updateEdge, updateGroupBoundary]);

  // 🌳 递归布局处理函数 - 从最深层到顶层逐层布局所有嵌套结构
  const handleRecursiveLayout = useCallback(async () => {
    if (isProcessing) {
      console.log("Layout already in progress");
      return;
    }

    try {
      setIsProcessing(true);

      console.log(`🌳 开始递归布局，处理所有 ${nodes.length} 个节点`);

      // 初始化布局管理器（自动使用 recursive-layout 策略）
      const layoutManager = new LayoutManager();

      // 应用递归布局算法
      const layoutResult = await layoutManager.applyLayout(
        nodes,
        edges,
        {
          layoutMode: 'recursive',  // ✨ 启用递归模式，自动选择 recursive-layout
          animate: true,
          useWeightedLayout: true,
          onProgress: (progress) => {
            console.log(
              `📊 布局进度: 深度 ${progress.currentLevel}/${progress.totalLevels}, ` +
              `已处理 ${progress.processedNodes}/${progress.totalNodes} 个节点`
            );
          }
        }
      );

      if (layoutResult.success) {
        // 启用布局模式以防止约束逻辑干扰
        useGraphStore.getState().setIsLayoutMode(true);

        // 更新节点位置和大小
        for (const [nodeId, positionData] of layoutResult.nodes) {
          const updateData: any = { position: { x: positionData.x, y: positionData.y } };

          // 如果布局结果包含尺寸信息（群组节点），也一并更新
          if ((positionData as any).width !== undefined) {
            updateData.width = (positionData as any).width;
          }
          if ((positionData as any).height !== undefined) {
            updateData.height = (positionData as any).height;
          }
          // 🔧 如果包含边界信息，也一并更新（确保群组边界及时同步）
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

          updateNode(nodeId, updateData);
        }

        // 更新边连接点
        layoutResult.edges.forEach((edgeData, edgeId) => {
          updateEdge(edgeId, {
            sourceHandle: edgeData.sourceHandle,
            targetHandle: edgeData.targetHandle
          });
        });

        console.log(`✅ 递归布局完成，更新了 ${layoutResult.nodes.size} 个节点`);
        console.log(`📊 统计: 耗时 ${layoutResult.stats.duration.toFixed(0)}ms, 迭代 ${layoutResult.stats.iterations} 次`);

        // 🔧 触发所有群组节点的边界更新，确保父节点大小及时调整
        // 收集所有更新了大小的群组节点
        const updatedGroupIds: string[] = [];
        for (const [nodeId, positionData] of layoutResult.nodes) {
          if ((positionData as any).width !== undefined || (positionData as any).height !== undefined) {
            // 检查这个节点是否是群组
            const node = nodes.find(n => n.id === nodeId);
            if (node && node.type === 'group') {
              updatedGroupIds.push(nodeId);
            }
          }
        }

        // 对每个更新的群组触发边界更新（延迟触发以确保 store 已完全更新）
        if (updatedGroupIds.length > 0) {
          console.log(`🔧 触发 ${updatedGroupIds.length} 个群组的边界更新:`, updatedGroupIds);
          setTimeout(() => {
            updatedGroupIds.forEach(groupId => {
              updateGroupBoundary(groupId);
            });
          }, 100); // 延迟 100ms 确保所有 updateNode 调用都已完成
        }

        // 清除选中状态
        setSelectedNodeId(null);

        useGraphStore.getState().setIsLayoutMode(false);
      } else {
        console.error("Recursive layout failed:", layoutResult.errors);
        useGraphStore.getState().setIsLayoutMode(false);
      }
    } catch (error) {
      console.error("Recursive layout error:", error);
      useGraphStore.getState().setIsLayoutMode(false);
    } finally {
      setIsProcessing(false);
    }
  }, [nodes, edges, isProcessing, updateNode, updateEdge, setSelectedNodeId, updateGroupBoundary]);

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

      {/* 🌳 递归布局按钮 */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleRecursiveLayout}
        disabled={isProcessing}
        className="w-full flex items-center justify-center gap-2 border-green-300 text-green-600 hover:bg-green-50"
        title="递归布局所有嵌套群组（从最深层开始）"
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
            递归布局中...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            递归布局全部
          </>
        )}
      </Button>

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