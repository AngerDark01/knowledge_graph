// src/app/api/layout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Node, Group, Edge } from '@/types/graph/models';
import { LayoutManager } from '@/services/layout';

// 初始化布局管理器（自动注册所有策略，包括新策略和旧策略）
const layoutManager = new LayoutManager();

// 定义请求和响应类型
interface LayoutRequest {
  nodes: (Node | Group)[];
  edges: Edge[];
  strategy?: string;
  options?: any;
}

interface LayoutResponse {
  success: boolean;
  positions?: Record<string, { x: number; y: number }>;
  errors?: string[];
  stats?: {
    duration: number;
    iterations: number;
    collisions: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { nodes, edges, strategy = 'grid-center-layout', options = {} }: LayoutRequest = await request.json();

    // 验证请求数据
    if (!Array.isArray(nodes) || !Array.isArray(edges)) {
      return NextResponse.json(
        {
          success: false,
          errors: ['Invalid input: nodes and edges must be arrays']
        } as LayoutResponse,
        { status: 400 }
      );
    }

    // 应用布局算法
    const startTime = Date.now();
    const result = await layoutManager.applyLayout(nodes, edges, { strategy, ...options });
    const duration = Date.now() - startTime;

    if (result.success) {
      // 将 Map 转换为普通对象以便序列化
      const positions: Record<string, { x: number; y: number }> = {};
      result.nodes.forEach((position, nodeId) => {
        positions[nodeId] = position;
      });

      return NextResponse.json({
        success: true,
        positions,
        stats: {
          ...result.stats,
          duration: result.stats.duration || duration
        }
      } as LayoutResponse);
    } else {
      return NextResponse.json({
        success: false,
        errors: result.errors,
        stats: result.stats
      } as LayoutResponse, { status: 500 });
    }
  } catch (error) {
    console.error('Layout API Error:', error);
    return NextResponse.json(
      {
        success: false,
        errors: [error instanceof Error ? error.message : 'Internal server error']
      } as LayoutResponse,
      { status: 500 }
    );
  }
}

// GET 请求用于获取支持的策略列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'strategies') {
      // 返回支持的布局策略列表
      const strategies = layoutManager.getSupportedStrategies().map(strategyId => {
        // 返回策略的详细信息
        return {
          id: strategyId,
          name: strategyId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: getStrategyDescription(strategyId)
        };
      });

      return NextResponse.json({
        success: true,
        strategies
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          errors: ['Invalid action']
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Layout API GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        errors: [error instanceof Error ? error.message : 'Internal server error']
      },
      { status: 500 }
    );
  }
}

// 获取策略描述的辅助函数
function getStrategyDescription(strategyId: string): string {
  switch (strategyId) {
    case 'canvas-layout':
      return 'Canvas layout strategy - layouts top-level nodes with centered grid and automatic edge optimization';
    case 'group-layout':
      return 'Group layout strategy - layouts nodes inside a specific group with fixed anchor point';
    case 'recursive-layout':
      return 'Recursive layout strategy - recursively layouts all nested groups from deepest to shallowest level';
    case 'grid-center-layout':
      return 'Legacy grid center layout (deprecated) - use canvas-layout, group-layout, or recursive-layout instead';
    default:
      return 'A layout strategy';
  }
}