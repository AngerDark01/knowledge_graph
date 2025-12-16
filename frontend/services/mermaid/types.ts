/**
 * Mermaid导入功能 - 类型定义
 */

import { Node, Group, Edge } from '@/types/graph/models';

// ========== Mermaid原始数据类型 ==========

/**
 * 节点形状类型
 */
export type NodeShape =
  | 'rect'           // 矩形
  | 'round'          // 圆角矩形
  | 'stadium'        // 体育场型
  | 'subroutine'     // 子程序
  | 'cylinder'       // 圆柱/数据库
  | 'circle'         // 圆形
  | 'asymmetric'     // 不对称
  | 'diamond'        // 菱形
  | 'hexagon'        // 六边形
  | 'parallelogram'  // 平行四边形
  | 'trapezoid'      // 梯形
  | 'double_circle'; // 双圆

/**
 * 边类型
 */
export type EdgeType =
  | 'arrow_point'      // 实线箭头
  | 'arrow_open'       // 开放箭头
  | 'arrow_circle'     // 圆形端点
  | 'arrow_cross'      // 叉形端点
  | 'double_arrow_point'  // 双向箭头
  | 'double_arrow_open'   // 双向开放
  | 'dotted'          // 虚线
  | 'thick';          // 粗线

/**
 * 边的线型
 */
export type StrokeType = 'normal' | 'thick' | 'dotted' | 'invisible';

/**
 * 布局方向
 */
export type Direction = 'TB' | 'TD' | 'BT' | 'RL' | 'LR';

/**
 * Mermaid节点
 */
export interface MermaidNode {
  /** 节点ID */
  id: string;
  /** 显示文本 */
  label: string;
  /** 节点形状 */
  shape: NodeShape;
  /** 样式列表 */
  styles?: string[];
  /** 类名列表 */
  classes?: string[];
  /** 原始元数据 */
  metadata?: Record<string, any>;
}

/**
 * Mermaid边
 */
export interface MermaidEdge {
  /** 边ID */
  id: string;
  /** 源节点ID */
  source: string;
  /** 目标节点ID */
  target: string;
  /** 边标签 */
  label?: string;
  /** 边类型 */
  type: EdgeType;
  /** 线型 */
  stroke: StrokeType;
  /** 线宽 */
  strokeWidth: number;
  /** 边长度（用于控制布局） */
  length?: number;
}

/**
 * Mermaid子图
 */
export interface MermaidSubgraph {
  /** 子图ID */
  id: string;
  /** 子图标题 */
  title: string;
  /** 包含的节点ID列表（包括普通节点和子图） */
  nodes: string[];
  /** 布局方向 */
  direction: Direction;
  /** 类名列表 */
  classes?: string[];
  /** 嵌套的子图ID列表 */
  children: string[];
  /** 父子图ID */
  parent: string | null;
  /** 嵌套层级（0为顶层） */
  level: number;
}

/**
 * Mermaid解析结果
 */
export interface MermaidParseResult {
  /** 节点列表 */
  nodes: MermaidNode[];
  /** 边列表 */
  edges: MermaidEdge[];
  /** 子图列表 */
  subgraphs: MermaidSubgraph[];
  /** 全局方向 */
  direction?: Direction;
}

// ========== 转换结果类型 ==========

/**
 * 转换结果
 */
export interface ConversionResult {
  /** 转换后的节点列表 */
  nodes: Node[];
  /** 转换后的群组列表 */
  groups: Group[];
  /** 转换后的边列表 */
  edges: Edge[];
  /** Mermaid ID → 项目ID 的映射表 */
  idMap: Map<string, string>;
}

/**
 * 布局结果
 */
export interface LayoutResult {
  /** 布局后的节点 */
  nodes: Node[];
  /** 布局后的群组 */
  groups: Group[];
  /** 布局后的边 */
  edges: Edge[];
}

/**
 * 解析元数据
 */
export interface ParseMetadata {
  /** 节点数量 */
  nodeCount: number;
  /** 边数量 */
  edgeCount: number;
  /** 子图数量 */
  subgraphCount: number;
  /** 最大嵌套深度 */
  maxSubgraphDepth: number;
}
