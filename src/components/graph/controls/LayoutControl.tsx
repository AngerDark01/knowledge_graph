// src/components/graph/controls/LayoutControl.tsx
import React, { useState, useCallback } from 'react';
import { Button } from '../../ui/button';
import { PlayIcon, CogIcon, WrenchIcon, ArrowsPointingOutIcon, ArrowsRightLeftIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { useGraphStore } from '@/stores/graph';
import { LayoutManager, GridCenterLayoutStrategy, GroupAwareLayoutStrategy, EdgeOptimizationStrategy, CompositeLayoutStrategy } from '@/services/layout';

interface LayoutControlProps {
  className?: string;
}

interface LayoutOption {
  id: string;
  name: string;
  description: string;
  icon?: React.ReactNode;
}

const LayoutControl: React.FC<LayoutControlProps> = ({ className = '' }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState('grid-center-layout');

  // 从store获取节点和边数据
  const nodes = useGraphStore(state => state.getNodes());
  const edges = useGraphStore(state => state.getEdges());
  const updateNode = useGraphStore(state => state.updateNode);
  const setSelectedNodeId = useGraphStore(state => state.setSelectedNodeId);

  // 预设的布局选项
  const layoutOptions: LayoutOption[] = [
    {
      id: 'grid-center-layout',
      name: '网格中心布局',
      description: '将高权重节点放置在中心，其他节点环绕排列',
      icon: <ArrowsPointingOutIcon className="w-4 h-4" />
    },
    {
      id: 'group-aware-layout',
      name: '组感知布局',
      description: '优先处理组内节点布局，保持组结构清晰',
      icon: <WrenchIcon className="w-4 h-4" />
    },
    {
      id: 'edge-optimization',
      name: '边优化',
      description: '优化边的连接点和路径，减少交叉',
      icon: <ArrowsRightLeftIcon className="w-4 h-4" />
    },
    {
      id: 'composite-layout',
      name: '综合布局',
      description: '结合节点布局、组布局和边优化的综合方案',
      icon: <Squares2X2Icon className="w-4 h-4" />
    }
  ];

  // 布局处理函数
  const handleLayout = useCallback(async (strategyId: string) => {
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

      // 注册可用的布局策略
      const gridCenterStrategy = new GridCenterLayoutStrategy();
      const groupAwareStrategy = new GroupAwareLayoutStrategy();
      const edgeOptimizationStrategy = new EdgeOptimizationStrategy();
      const compositeLayoutStrategy = new CompositeLayoutStrategy();

      layoutManager.registerStrategy('grid-center-layout', gridCenterStrategy);
      layoutManager.registerStrategy('group-aware-layout', groupAwareStrategy);
      layoutManager.registerStrategy('edge-optimization', edgeOptimizationStrategy);
      layoutManager.registerStrategy('composite-layout', compositeLayoutStrategy);

      // 应用布局算法
      const layoutResult = await layoutManager.applyLayout(
        nodes,
        edges,
        {
          strategy: strategyId,
          animate: true,
          useWeightedLayout: true
        }
      );

      if (layoutResult.success) {
        // 启用布局模式以防止约束逻辑干扰
        useGraphStore.getState().setIsLayoutMode(true);

        try {
          // 根据策略类型决定如何处理结果
          if (strategyId === 'edge-optimization') {
            // 对于边优化策略，我们主要更新边的属性
            layoutResult.edges.forEach((edgeData, edgeId) => {
              // 这里可以更新边的连接点或其他属性
              console.log(`Edge ${edgeId} optimized:`, edgeData);
            });
          } else {
            // 对于节点布局策略，更新节点位置
            for (const [nodeId, position] of layoutResult.nodes) {
              updateNode(nodeId, { position });
            }
          }

          // 清除选中状态
          setSelectedNodeId(null);
        } finally {
          // 禁用布局模式
          useGraphStore.getState().setIsLayoutMode(false);
        }
      } else {
        console.error("Layout failed:", layoutResult.errors);
      }
    } catch (error) {
      console.error("Layout error:", error);
    } finally {
      setIsProcessing(false);
      setShowOptions(false);
    }
  }, [nodes, edges, isProcessing, updateNode, setSelectedNodeId]);

  // 按钮点击处理
  const handleButtonClick = useCallback(() => {
    if (showOptions) {
      handleLayout(selectedStrategy);
    } else {
      setShowOptions(true);
    }
  }, [showOptions, handleLayout, selectedStrategy]);

  // 选项变化处理
  const handleOptionSelect = useCallback((optionId: string) => {
    setSelectedStrategy(optionId);
    handleLayout(optionId);
  }, [handleLayout]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={handleButtonClick}
          disabled={isProcessing}
          className="flex items-center gap-2"
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
              <PlayIcon className="w-4 h-4" />
              {showOptions ? "选择布局算法" : "应用布局"}
            </>
          )}
        </Button>

        {/* 布局选项下拉菜单 */}
        {showOptions && !isProcessing && (
          <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
            <div className="p-2 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-900">选择布局算法</h3>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {layoutOptions.map((option) => (
                <button
                  key={option.id}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${
                    selectedStrategy === option.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                  onClick={() => handleOptionSelect(option.id)}
                >
                  {option.icon}
                  <div>
                    <div className="font-medium">{option.name}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="p-2 border-t border-gray-100 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOptions(false)}
              >
                取消
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 配置按钮 - 暂时未实现功能 */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => console.log("Layout configuration clicked")}
        disabled={isProcessing}
      >
        <CogIcon className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default LayoutControl;