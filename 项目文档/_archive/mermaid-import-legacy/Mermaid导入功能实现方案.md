# Mermaid导入功能实现方案

> **版本**: v1.0
> **创建时间**: 2025-12-16
> **状态**: 设计阶段

---

## 📋 目录

1. [功能概述](#1-功能概述)
2. [数据模型映射](#2-数据模型映射)
3. [架构设计](#3-架构设计)
4. [核心模块设计](#4-核心模块设计)
5. [UI组件设计](#5-ui组件设计)
6. [实现步骤](#6-实现步骤)
7. [技术难点与解决方案](#7-技术难点与解决方案)
8. [测试计划](#8-测试计划)

---

## 1. 功能概述

### 1.1 功能目标

实现从Mermaid Flowchart文本导入到知识图谱画布的功能，支持：
- ✅ 输入Mermaid文本（粘贴或文件上传）
- ✅ 解析Mermaid语法（节点、边、子图）
- ✅ 转换为项目数据模型（Node、Group、Edge）
- ✅ 自动布局并渲染到画布
- ✅ 保持子图嵌套关系

### 1.2 支持的Mermaid特性

| 特性 | 支持程度 | 说明 |
|------|---------|------|
| 节点形状 | ✅ 全部支持 | 14种基础形状 + 扩展形状 |
| 边类型 | ✅ 全部支持 | 实线、虚线、粗线、带标签 |
| 子图 | ✅ 完整支持 | 支持无限层嵌套 |
| 方向控制 | ⚠️ 部分支持 | 转换为ELK布局方向 |
| 样式/类 | ⚠️ 部分支持 | 转换为基础样式 |
| 主题 | ❌ 不支持 | 使用项目默认样式 |

### 1.3 用户使用流程

```
用户操作 → 输入Mermaid文本/上传.md文件
         ↓
       解析提取 → 识别节点、边、子图
         ↓
       数据转换 → 转换为Node/Group/Edge
         ↓
       自动布局 → ELK算法计算位置
         ↓
       渲染画布 → 添加到当前画布
```

---

## 2. 数据模型映射

### 2.1 核心映射关系

#### Mermaid节点 → 项目Node

| Mermaid属性 | 项目Node属性 | 转换规则 |
|------------|-------------|---------|
| `id` | `id` | 生成唯一ID: `mmd_${nanoid()}` |
| `text` | `title` | 直接映射 |
| `type`（形状） | `content` | 保存为元信息 |
| - | `type` | 固定为 `BlockEnum.NODE` |
| - | `position` | 通过ELK布局计算 |
| - | `width/height` | 使用 `NODE_SIZES.NOTE` |
| `styles` | `style` | 转换为CSS样式 |
| - | `createdAt/updatedAt` | 当前时间 |

**转换示例**：
```typescript
// Mermaid节点
const mermaidNode = {
  id: "A",
  text: "开始",
  type: "round",
  styles: ["fill:#f9f"]
};

// 转换为项目Node
const projectNode: Node = {
  id: "mmd_abc123",
  type: BlockEnum.NODE,
  title: "开始",
  content: `节点形状: ${mermaidNode.type}`,
  position: { x: 0, y: 0 }, // 待布局计算
  width: NODE_SIZES.NOTE.DEFAULT_WIDTH,  // 350
  height: NODE_SIZES.NOTE.DEFAULT_HEIGHT, // 280
  style: { backgroundColor: "#f9f" },
  createdAt: new Date(),
  updatedAt: new Date()
};
```

#### Mermaid子图 → 项目Group

| Mermaid属性 | 项目Group属性 | 转换规则 |
|------------|--------------|---------|
| `id` | `id` | 生成唯一ID: `mmd_group_${nanoid()}` |
| `title` | `title` | 直接映射 |
| `nodes` | `nodeIds` | 映射子节点ID列表 |
| `children`（嵌套） | `groupId` | 建立父子关系 |
| `parent` | 子Group的`groupId` | 反向引用 |
| `direction` | `content` | 保存为元信息 |
| - | `type` | 固定为 `BlockEnum.GROUP` |
| - | `collapsed` | 默认 `false` |
| - | `boundary` | 通过ELK布局计算 |
| - | `width/height` | 使用 `NODE_SIZES.GROUP` |

**转换示例**：
```typescript
// Mermaid子图
const mermaidSubgraph = {
  id: "services",
  title: "服务层",
  nodes: ["UserService", "OrderService"],
  children: ["database"],  // 嵌套的子图ID
  parent: null,
  level: 0,
  direction: "TB"
};

// 转换为项目Group
const projectGroup: Group = {
  id: "mmd_group_xyz789",
  type: BlockEnum.GROUP,
  title: "服务层",
  content: `方向: ${mermaidSubgraph.direction}`,
  nodeIds: ["mmd_node1", "mmd_node2", "mmd_group_child"],
  groupId: undefined, // 顶层Group无父级
  collapsed: false,
  position: { x: 0, y: 0 }, // 待布局计算
  width: NODE_SIZES.GROUP.DEFAULT_WIDTH,
  height: NODE_SIZES.GROUP.DEFAULT_HEIGHT,
  boundary: { minX: 0, minY: 0, maxX: 300, maxY: 200 },
  createdAt: new Date(),
  updatedAt: new Date()
};
```

#### Mermaid边 → 项目Edge

| Mermaid属性 | 项目Edge属性 | 转换规则 |
|------------|-------------|---------|
| `start` | `source` | 映射转换后的节点ID |
| `end` | `target` | 映射转换后的节点ID |
| `text` | `label` | 直接映射 |
| `type` | `data.direction` | 根据类型判断方向性 |
| `stroke` | `data.strokeDasharray` | dotted→虚线 |
| `stroke` | `data.strokeWidth` | thick→粗线 |
| - | `id` | 生成: `mmd_edge_${nanoid()}` |
| - | `data.isCrossGroup` | 判断source/target是否在不同组 |
| - | `createdAt/updatedAt` | 当前时间 |

**转换示例**：
```typescript
// Mermaid边
const mermaidEdge = {
  start: "A",
  end: "B",
  text: "是",
  type: "arrow_point",
  stroke: "thick"
};

// 转换为项目Edge
const projectEdge: Edge = {
  id: "mmd_edge_qwe456",
  source: "mmd_abc123",  // A的转换ID
  target: "mmd_def456",  // B的转换ID
  label: "是",
  data: {
    strokeWidth: 2,
    direction: "unidirectional",
    isCrossGroup: false, // 待计算
    sourceGroupId: undefined,
    targetGroupId: undefined
  },
  createdAt: new Date(),
  updatedAt: new Date()
};
```

### 2.2 特殊映射规则

#### 子图嵌套关系

Mermaid子图嵌套通过`parent`和`children`字段表示，需要转换为项目的`groupId`和`nodeIds`：

```typescript
// Mermaid嵌套结构
{
  outer: { id: "outer", parent: null, children: ["module1", "module2"], nodes: [] },
  module1: { id: "module1", parent: "outer", children: ["feature1"], nodes: ["A", "B"] },
  feature1: { id: "feature1", parent: "module1", children: [], nodes: ["A1", "A2"] }
}

// 转换为项目Group关系
{
  outerGroup: {
    id: "mmd_group_outer",
    groupId: undefined,  // 顶层
    nodeIds: ["mmd_group_module1", "mmd_group_module2"]
  },
  module1Group: {
    id: "mmd_group_module1",
    groupId: "mmd_group_outer",  // 父级
    nodeIds: ["mmd_node_A", "mmd_node_B", "mmd_group_feature1"]
  },
  feature1Group: {
    id: "mmd_group_feature1",
    groupId: "mmd_group_module1",  // 父级
    nodeIds: ["mmd_node_A1", "mmd_node_A2"]
  }
}
```

#### 跨组边识别

边的跨组属性需要在转换后计算：

```typescript
function calculateCrossGroupInfo(
  edge: Edge,
  nodes: (Node | Group)[],
  groups: Group[]
): Edge {
  const sourceNode = nodes.find(n => n.id === edge.source);
  const targetNode = nodes.find(n => n.id === edge.target);

  const sourceGroupId = sourceNode?.groupId;
  const targetGroupId = targetNode?.groupId;

  return {
    ...edge,
    data: {
      ...edge.data,
      isCrossGroup: sourceGroupId !== targetGroupId,
      sourceGroupId,
      targetGroupId
    }
  };
}
```

---

## 3. 架构设计

### 3.1 模块结构

```
frontend/
├── services/
│   └── mermaid/
│       ├── MermaidParser.ts          # Mermaid语法解析器
│       ├── MermaidConverter.ts        # 数据转换器
│       ├── MermaidLayoutAdapter.ts    # 布局适配器
│       └── types.ts                   # 类型定义
├── components/
│   └── graph/
│       └── import/
│           ├── MermaidImportDialog.tsx    # 导入对话框
│           ├── MermaidTextInput.tsx       # 文本输入组件
│           ├── MermaidFileUpload.tsx      # 文件上传组件
│           └── MermaidPreview.tsx         # 预览组件
└── hooks/
    └── useMermaidImport.ts            # 导入逻辑Hook
```

### 3.2 数据流程

```
MermaidImportDialog (UI层)
    ↓ 用户输入/上传
MermaidParser (解析层)
    ↓ Mermaid AST
MermaidConverter (转换层)
    ↓ 临时数据模型
MermaidLayoutAdapter (布局层)
    ↓ ELK布局结果
GraphStore (状态管理)
    ↓ addNode/addEdge
ReactFlow (渲染层)
```

### 3.3 关键接口

```typescript
// services/mermaid/types.ts

/** Mermaid解析结果 */
export interface MermaidParseResult {
  nodes: MermaidNode[];
  edges: MermaidEdge[];
  subgraphs: MermaidSubgraph[];
  direction?: Direction;
}

/** 转换结果 */
export interface ConversionResult {
  nodes: Node[];
  groups: Group[];
  edges: Edge[];
  idMap: Map<string, string>; // Mermaid ID → 项目ID
}

/** 布局结果 */
export interface LayoutResult {
  nodes: Node[];
  groups: Group[];
  edges: Edge[];
}
```

---

## 4. 核心模块设计

### 4.1 MermaidParser - 解析器

**职责**：解析Mermaid文本，提取节点、边、子图

**技术方案**：使用`mermaid`包的`parser.yy` API

**核心代码**：

```typescript
// services/mermaid/MermaidParser.ts

import mermaid from 'mermaid';
import { MermaidParseResult, MermaidNode, MermaidEdge, MermaidSubgraph } from './types';

export class MermaidParser {
  private initialized = false;

  constructor() {
    this.initialize();
  }

  /**
   * 初始化Mermaid
   */
  private initialize(): void {
    if (this.initialized) return;

    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      flowchart: {
        useMaxWidth: false,
        htmlLabels: true
      }
    });

    this.initialized = true;
  }

  /**
   * 解析Mermaid文本
   */
  async parse(mermaidText: string): Promise<MermaidParseResult> {
    try {
      // 验证语法
      await mermaid.parse(mermaidText);

      // 获取图表对象
      const diagram = await mermaid.mermaidAPI.getDiagramFromText(mermaidText);
      const parser = diagram.parser;

      // 提取节点
      const vertices = parser.yy.getVertices();
      const nodes = this.extractNodes(vertices);

      // 提取边
      const rawEdges = parser.yy.getEdges();
      const edges = this.extractEdges(rawEdges);

      // 提取子图
      const rawSubgraphs = parser.yy.getSubgraphs();
      const subgraphs = this.extractSubgraphs(rawSubgraphs);

      // 提取全局方向
      const direction = parser.yy.getDirection?.() || 'TB';

      return { nodes, edges, subgraphs, direction };
    } catch (error) {
      throw new Error(`Mermaid解析失败: ${error.message}`);
    }
  }

  /**
   * 提取节点信息
   */
  private extractNodes(vertices: any): MermaidNode[] {
    const nodes: MermaidNode[] = [];

    for (const [id, vertex] of Object.entries(vertices)) {
      nodes.push({
        id: id as string,
        label: vertex.text || id,
        shape: this.parseNodeShape(vertex.type),
        styles: vertex.styles || [],
        classes: vertex.classes || [],
        metadata: vertex
      });
    }

    return nodes;
  }

  /**
   * 提取边信息
   */
  private extractEdges(rawEdges: any[]): MermaidEdge[] {
    return rawEdges.map((edge, index) => ({
      id: `edge_${index}`,
      source: edge.start,
      target: edge.end,
      label: edge.text,
      type: edge.type || 'arrow_point',
      stroke: edge.stroke || 'normal',
      strokeWidth: edge.stroke === 'thick' ? 2 : 1,
      length: edge.length || 1
    }));
  }

  /**
   * 提取子图信息
   */
  private extractSubgraphs(rawSubgraphs: any[]): MermaidSubgraph[] {
    const subgraphs: MermaidSubgraph[] = [];

    for (const subgraph of rawSubgraphs) {
      subgraphs.push({
        id: subgraph.id,
        title: subgraph.title || subgraph.id,
        nodes: subgraph.nodes || [],
        direction: subgraph.dir || 'TB',
        classes: subgraph.classes || [],
        children: [],  // 待计算
        parent: null,  // 待计算
        level: 0       // 待计算
      });
    }

    // 计算嵌套关系
    this.calculateNesting(subgraphs);

    return subgraphs;
  }

  /**
   * 计算子图嵌套关系
   */
  private calculateNesting(subgraphs: MermaidSubgraph[]): void {
    // 构建节点所属关系
    const nodeToSubgraph = new Map<string, string>();

    for (const subgraph of subgraphs) {
      for (const nodeId of subgraph.nodes) {
        nodeToSubgraph.set(nodeId, subgraph.id);
      }
    }

    // 查找父子关系
    for (const subgraph of subgraphs) {
      for (const otherSubgraph of subgraphs) {
        if (subgraph.id === otherSubgraph.id) continue;

        // 如果当前子图在另一个子图的nodes中，说明是嵌套关系
        if (otherSubgraph.nodes.includes(subgraph.id)) {
          subgraph.parent = otherSubgraph.id;
          otherSubgraph.children.push(subgraph.id);
        }
      }
    }

    // 计算嵌套层级
    const calculateLevel = (subgraph: MermaidSubgraph): number => {
      if (!subgraph.parent) return 0;
      const parent = subgraphs.find(s => s.id === subgraph.parent);
      return parent ? calculateLevel(parent) + 1 : 0;
    };

    for (const subgraph of subgraphs) {
      subgraph.level = calculateLevel(subgraph);
    }
  }

  /**
   * 解析节点形状
   */
  private parseNodeShape(type: string): string {
    const shapeMap: Record<string, string> = {
      'square': 'rect',
      'round': 'round',
      'stadium': 'stadium',
      'subroutine': 'subroutine',
      'cylindrical': 'cylinder',
      'circle': 'circle',
      'asymmetric': 'asymmetric',
      'rhombus': 'diamond',
      'hexagon': 'hexagon',
      'parallelogram': 'parallelogram',
      'trapezoid': 'trapezoid'
    };

    return shapeMap[type] || 'rect';
  }
}
```

### 4.2 MermaidConverter - 数据转换器

**职责**：将Mermaid解析结果转换为项目数据模型

**核心代码**：

```typescript
// services/mermaid/MermaidConverter.ts

import { nanoid } from 'nanoid';
import { Node, Group, Edge, BlockEnum } from '@/types/graph/models';
import { NODE_SIZES } from '@/config/graph.config';
import { MermaidParseResult, ConversionResult } from './types';

export class MermaidConverter {
  /**
   * 转换Mermaid解析结果为项目数据模型
   */
  convert(parseResult: MermaidParseResult): ConversionResult {
    const idMap = new Map<string, string>();

    // 1. 转换子图为Group
    const groups = this.convertSubgraphs(parseResult.subgraphs, idMap);

    // 2. 转换节点为Node
    const nodes = this.convertNodes(parseResult.nodes, idMap, parseResult.subgraphs);

    // 3. 更新Group的nodeIds
    this.updateGroupNodeIds(groups, nodes, parseResult.subgraphs);

    // 4. 转换边为Edge
    const edges = this.convertEdges(parseResult.edges, idMap, nodes, groups);

    return { nodes, groups, edges, idMap };
  }

  /**
   * 转换子图为Group
   */
  private convertSubgraphs(
    subgraphs: MermaidSubgraph[],
    idMap: Map<string, string>
  ): Group[] {
    const groups: Group[] = [];

    // 按层级排序，确保父级先创建
    const sortedSubgraphs = [...subgraphs].sort((a, b) => a.level - b.level);

    for (const subgraph of sortedSubgraphs) {
      const groupId = `mmd_group_${nanoid()}`;
      idMap.set(subgraph.id, groupId);

      const group: Group = {
        id: groupId,
        type: BlockEnum.GROUP,
        title: subgraph.title,
        content: `方向: ${subgraph.direction}`,
        nodeIds: [],  // 稍后填充
        groupId: subgraph.parent ? idMap.get(subgraph.parent) : undefined,
        collapsed: false,
        position: { x: 0, y: 0 },  // 待布局计算
        width: NODE_SIZES.GROUP.DEFAULT_WIDTH,
        height: NODE_SIZES.GROUP.DEFAULT_HEIGHT,
        boundary: {
          minX: 0,
          minY: 0,
          maxX: NODE_SIZES.GROUP.DEFAULT_WIDTH,
          maxY: NODE_SIZES.GROUP.DEFAULT_HEIGHT
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      groups.push(group);
    }

    return groups;
  }

  /**
   * 转换节点为Node
   */
  private convertNodes(
    mermaidNodes: MermaidNode[],
    idMap: Map<string, string>,
    subgraphs: MermaidSubgraph[]
  ): Node[] {
    const nodes: Node[] = [];

    for (const mNode of mermaidNodes) {
      // 跳过已转换为Group的节点
      if (subgraphs.some(s => s.id === mNode.id)) {
        continue;
      }

      const nodeId = `mmd_node_${nanoid()}`;
      idMap.set(mNode.id, nodeId);

      // 查找节点所属的子图
      const ownerSubgraph = subgraphs.find(s => s.nodes.includes(mNode.id));

      const node: Node = {
        id: nodeId,
        type: BlockEnum.NODE,
        title: mNode.label,
        content: `形状: ${mNode.shape}`,
        position: { x: 0, y: 0 },  // 待布局计算
        width: NODE_SIZES.NOTE.DEFAULT_WIDTH,
        height: NODE_SIZES.NOTE.DEFAULT_HEIGHT,
        groupId: ownerSubgraph ? idMap.get(ownerSubgraph.id) : undefined,
        style: this.convertStyles(mNode.styles),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      nodes.push(node);
    }

    return nodes;
  }

  /**
   * 更新Group的nodeIds
   */
  private updateGroupNodeIds(
    groups: Group[],
    nodes: Node[],
    subgraphs: MermaidSubgraph[]
  ): void {
    for (const group of groups) {
      // 查找对应的Mermaid子图
      const mermaidSubgraph = subgraphs.find(s => s.id === group.id);
      if (!mermaidSubgraph) continue;

      // 添加直接子节点
      for (const node of nodes) {
        if (node.groupId === group.id) {
          group.nodeIds.push(node.id);
        }
      }

      // 添加子Group
      for (const childGroup of groups) {
        if (childGroup.groupId === group.id) {
          group.nodeIds.push(childGroup.id);
        }
      }
    }
  }

  /**
   * 转换边为Edge
   */
  private convertEdges(
    mermaidEdges: MermaidEdge[],
    idMap: Map<string, string>,
    nodes: Node[],
    groups: Group[]
  ): Edge[] {
    const edges: Edge[] = [];

    for (const mEdge of mermaidEdges) {
      const sourceId = idMap.get(mEdge.source);
      const targetId = idMap.get(mEdge.target);

      if (!sourceId || !targetId) {
        console.warn(`跳过无效边: ${mEdge.source} -> ${mEdge.target}`);
        continue;
      }

      const edge: Edge = {
        id: `mmd_edge_${nanoid()}`,
        source: sourceId,
        target: targetId,
        label: mEdge.label,
        data: {
          strokeWidth: mEdge.strokeWidth,
          strokeDasharray: mEdge.stroke === 'dotted' ? '5,5' : undefined,
          direction: this.getEdgeDirection(mEdge.type)
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 计算跨组信息
      this.calculateCrossGroupInfo(edge, nodes, groups);

      edges.push(edge);
    }

    return edges;
  }

  /**
   * 转换样式
   */
  private convertStyles(styles: string[]): any {
    const style: any = {};

    for (const styleStr of styles) {
      if (styleStr.startsWith('fill:')) {
        style.backgroundColor = styleStr.substring(5);
      } else if (styleStr.startsWith('stroke:')) {
        style.borderColor = styleStr.substring(7);
      }
    }

    return style;
  }

  /**
   * 获取边的方向性
   */
  private getEdgeDirection(type: string): 'unidirectional' | 'bidirectional' | 'undirected' {
    if (type === 'arrow_open' || type === 'double_arrow_open') {
      return 'bidirectional';
    } else if (type.includes('arrow')) {
      return 'unidirectional';
    }
    return 'undirected';
  }

  /**
   * 计算跨组信息
   */
  private calculateCrossGroupInfo(
    edge: Edge,
    nodes: Node[],
    groups: Group[]
  ): void {
    const allEntities = [...nodes, ...groups];
    const sourceEntity = allEntities.find(e => e.id === edge.source);
    const targetEntity = allEntities.find(e => e.id === edge.target);

    const sourceGroupId = sourceEntity?.groupId;
    const targetGroupId = targetEntity?.groupId;

    edge.data = {
      ...edge.data,
      isCrossGroup: sourceGroupId !== targetGroupId,
      sourceGroupId,
      targetGroupId
    };
  }
}
```

### 4.3 MermaidLayoutAdapter - 布局适配器

**职责**：调用ELK布局算法，计算节点位置

**核心代码**：

```typescript
// services/mermaid/MermaidLayoutAdapter.ts

import { LayoutManager } from '@/services/layout/LayoutManager';
import { Node, Group, Edge } from '@/types/graph/models';
import { LayoutResult } from './types';

export class MermaidLayoutAdapter {
  private layoutManager: LayoutManager;

  constructor() {
    this.layoutManager = new LayoutManager();
  }

  /**
   * 对转换后的数据进行布局
   */
  async applyLayout(
    nodes: Node[],
    groups: Group[],
    edges: Edge[]
  ): Promise<LayoutResult> {
    try {
      // 使用ELK算法进行全局布局
      const layoutResult = await this.layoutManager.applyLayout(
        [...nodes, ...groups],
        edges,
        'elk'  // 使用ELK算法
      );

      // 分离节点和群组
      const layoutedNodes: Node[] = [];
      const layoutedGroups: Group[] = [];

      for (const entity of layoutResult.nodes) {
        if (entity.type === 'group') {
          layoutedGroups.push(entity as Group);
        } else {
          layoutedNodes.push(entity as Node);
        }
      }

      return {
        nodes: layoutedNodes,
        groups: layoutedGroups,
        edges: layoutResult.edges
      };
    } catch (error) {
      console.error('布局失败:', error);
      // 返回原始数据
      return { nodes, groups, edges };
    }
  }
}
```

---

## 5. UI组件设计

### 5.1 MermaidImportDialog - 主对话框

**功能**：提供导入界面，支持文本输入和文件上传

**核心代码**：

```typescript
// components/graph/import/MermaidImportDialog.tsx

'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MermaidTextInput } from './MermaidTextInput';
import { MermaidFileUpload } from './MermaidFileUpload';
import { useMermaidImport } from '@/hooks/useMermaidImport';

interface MermaidImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MermaidImportDialog: React.FC<MermaidImportDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [mermaidText, setMermaidText] = useState('');
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const { importMermaid, isLoading, error } = useMermaidImport();

  const handleImport = async () => {
    if (!mermaidText.trim()) {
      alert('请输入Mermaid代码');
      return;
    }

    try {
      await importMermaid(mermaidText);
      onOpenChange(false);
      setMermaidText('');
    } catch (err) {
      console.error('导入失败:', err);
    }
  };

  const handleFileContent = (content: string) => {
    setMermaidText(content);
    setActiveTab('text');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>导入Mermaid Flowchart</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tab切换 */}
          <div className="flex space-x-2 border-b">
            <button
              className={`px-4 py-2 ${activeTab === 'text' ? 'border-b-2 border-blue-500' : ''}`}
              onClick={() => setActiveTab('text')}
            >
              粘贴代码
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'file' ? 'border-b-2 border-blue-500' : ''}`}
              onClick={() => setActiveTab('file')}
            >
              上传文件
            </button>
          </div>

          {/* 内容区域 */}
          {activeTab === 'text' ? (
            <MermaidTextInput
              value={mermaidText}
              onChange={setMermaidText}
            />
          ) : (
            <MermaidFileUpload
              onFileContent={handleFileContent}
            />
          )}

          {/* 错误提示 */}
          {error && (
            <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
              {error}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button
              onClick={handleImport}
              disabled={isLoading || !mermaidText.trim()}
            >
              {isLoading ? '导入中...' : '导入'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

### 5.2 MermaidTextInput - 文本输入组件

```typescript
// components/graph/import/MermaidTextInput.tsx

'use client';

import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface MermaidTextInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const MermaidTextInput: React.FC<MermaidTextInputProps> = ({
  value,
  onChange
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Mermaid Flowchart代码</label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`flowchart TD
    A[开始] --> B{判断}
    B -->|是| C[处理]
    B -->|否| D[结束]

    subgraph 子系统
        C --> E[步骤1]
        E --> F[步骤2]
    end`}
        className="font-mono text-sm min-h-[300px]"
      />
      <p className="text-xs text-gray-500">
        支持Mermaid Flowchart语法，包括节点、边和子图
      </p>
    </div>
  );
};
```

### 5.3 MermaidFileUpload - 文件上传组件

```typescript
// components/graph/import/MermaidFileUpload.tsx

'use client';

import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';

interface MermaidFileUploadProps {
  onFileContent: (content: string) => void;
}

export const MermaidFileUpload: React.FC<MermaidFileUploadProps> = ({
  onFileContent
}) => {
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();

        // 提取Mermaid代码块
        const mermaidCode = extractMermaidFromMarkdown(text);

        if (mermaidCode) {
          onFileContent(mermaidCode);
        } else {
          alert('未找到Mermaid代码块');
        }
      } catch (error) {
        console.error('文件读取失败:', error);
        alert('文件读取失败');
      }
    },
    [onFileContent]
  );

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <input
          type="file"
          accept=".md,.mmd,.txt"
          onChange={handleFileChange}
          className="hidden"
          id="mermaid-file-input"
        />
        <label htmlFor="mermaid-file-input">
          <Button variant="outline" asChild>
            <span>选择文件</span>
          </Button>
        </label>
        <p className="mt-2 text-sm text-gray-500">
          支持 .md, .mmd, .txt 格式
        </p>
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p>💡 支持的文件格式：</p>
        <ul className="list-disc list-inside ml-2">
          <li>纯Mermaid代码（.mmd）</li>
          <li>包含Mermaid代码块的Markdown（.md）</li>
          <li>纯文本文件（.txt）</li>
        </ul>
      </div>
    </div>
  );
};

/**
 * 从Markdown中提取Mermaid代码块
 */
function extractMermaidFromMarkdown(text: string): string | null {
  // 匹配```mermaid ... ```代码块
  const mermaidBlockRegex = /```mermaid\s*\n([\s\S]*?)\n```/i;
  const match = text.match(mermaidBlockRegex);

  if (match) {
    return match[1].trim();
  }

  // 如果没有代码块标记，尝试直接作为Mermaid代码
  if (text.trim().startsWith('flowchart') || text.trim().startsWith('graph')) {
    return text.trim();
  }

  return null;
}
```

### 5.4 useMermaidImport - 导入逻辑Hook

```typescript
// hooks/useMermaidImport.ts

import { useState } from 'react';
import { useGraphStore } from '@/stores/graph';
import { MermaidParser } from '@/services/mermaid/MermaidParser';
import { MermaidConverter } from '@/services/mermaid/MermaidConverter';
import { MermaidLayoutAdapter } from '@/services/mermaid/MermaidLayoutAdapter';

export function useMermaidImport() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { addNode, addEdge } = useGraphStore();

  const importMermaid = async (mermaidText: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. 解析Mermaid
      const parser = new MermaidParser();
      const parseResult = await parser.parse(mermaidText);

      console.log('解析结果:', parseResult);

      // 2. 转换数据模型
      const converter = new MermaidConverter();
      const conversionResult = converter.convert(parseResult);

      console.log('转换结果:', conversionResult);

      // 3. 应用布局
      const layoutAdapter = new MermaidLayoutAdapter();
      const layoutResult = await layoutAdapter.applyLayout(
        conversionResult.nodes,
        conversionResult.groups,
        conversionResult.edges
      );

      console.log('布局结果:', layoutResult);

      // 4. 添加到画布（先添加Group，再添加Node，最后添加Edge）
      for (const group of layoutResult.groups) {
        addNode(group);
      }

      for (const node of layoutResult.nodes) {
        addNode(node);
      }

      for (const edge of layoutResult.edges) {
        addEdge(edge);
      }

      console.log('导入成功');
    } catch (err: any) {
      console.error('导入失败:', err);
      setError(err.message || '导入失败');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    importMermaid,
    isLoading,
    error
  };
}
```

---

## 6. 实现步骤

### Phase 1: 基础设施（1-2天）

1. **安装依赖**
   ```bash
   cd frontend
   npm install mermaid
   ```

2. **创建服务层目录结构**
   ```bash
   mkdir -p services/mermaid
   touch services/mermaid/types.ts
   touch services/mermaid/MermaidParser.ts
   touch services/mermaid/MermaidConverter.ts
   touch services/mermaid/MermaidLayoutAdapter.ts
   ```

3. **创建UI组件目录**
   ```bash
   mkdir -p components/graph/import
   touch components/graph/import/MermaidImportDialog.tsx
   touch components/graph/import/MermaidTextInput.tsx
   touch components/graph/import/MermaidFileUpload.tsx
   ```

4. **创建Hook**
   ```bash
   touch hooks/useMermaidImport.ts
   ```

### Phase 2: 核心功能开发（3-5天）

1. **实现MermaidParser**
   - 封装mermaid.parse API
   - 提取节点、边、子图
   - 计算嵌套关系

2. **实现MermaidConverter**
   - 转换节点为Node
   - 转换子图为Group
   - 转换边为Edge
   - 建立ID映射

3. **实现MermaidLayoutAdapter**
   - 集成现有LayoutManager
   - 调用ELK布局算法
   - 处理布局结果

4. **实现useMermaidImport Hook**
   - 串联解析、转换、布局流程
   - 状态管理
   - 错误处理

### Phase 3: UI组件开发（2-3天）

1. **实现MermaidTextInput**
   - 代码输入框
   - 语法高亮（可选）
   - 实时验证（可选）

2. **实现MermaidFileUpload**
   - 文件选择
   - Markdown解析
   - 代码块提取

3. **实现MermaidImportDialog**
   - 对话框布局
   - Tab切换
   - 导入逻辑集成

4. **集成到Toolbar**
   - 添加"导入"按钮
   - 打开对话框

### Phase 4: 测试与优化（2-3天）

1. **单元测试**
   - MermaidParser测试
   - MermaidConverter测试
   - 数据映射测试

2. **集成测试**
   - 端到端导入流程
   - 复杂嵌套场景
   - 边界情况

3. **性能优化**
   - 大规模图优化
   - 布局性能优化
   - UI响应优化

4. **用户体验优化**
   - 错误提示优化
   - 加载状态优化
   - 预览功能（可选）

---

## 7. 技术难点与解决方案

### 7.1 子图嵌套关系建立

**难点**：Mermaid的子图嵌套通过`parent`和`children`表示，需要转换为项目的`groupId`和`nodeIds`

**解决方案**：
1. 按层级排序处理子图，确保父级先创建
2. 建立Mermaid ID到项目ID的映射表
3. 在转换过程中维护父子关系

```typescript
// 按层级排序
const sortedSubgraphs = [...subgraphs].sort((a, b) => a.level - b.level);

// 创建ID映射
for (const subgraph of sortedSubgraphs) {
  const groupId = `mmd_group_${nanoid()}`;
  idMap.set(subgraph.id, groupId);

  // 设置父级
  group.groupId = subgraph.parent ? idMap.get(subgraph.parent) : undefined;
}
```

### 7.2 节点位置计算

**难点**：Mermaid只有逻辑关系，没有位置信息

**解决方案**：
1. 使用ELK布局算法自动计算位置
2. 初始位置设为(0,0)，布局后更新
3. 支持用户手动调整

```typescript
// 初始位置
position: { x: 0, y: 0 }

// 应用布局
const layoutResult = await layoutManager.applyLayout(nodes, edges, 'elk');
```

### 7.3 跨组边识别

**难点**：边的跨组属性需要在转换后计算

**解决方案**：
1. 先转换所有节点和组
2. 根据source/target的groupId判断是否跨组
3. 设置相应的样式属性

```typescript
function calculateCrossGroupInfo(edge: Edge, nodes: (Node | Group)[]): Edge {
  const source = nodes.find(n => n.id === edge.source);
  const target = nodes.find(n => n.id === edge.target);

  return {
    ...edge,
    data: {
      ...edge.data,
      isCrossGroup: source?.groupId !== target?.groupId,
      sourceGroupId: source?.groupId,
      targetGroupId: target?.groupId
    }
  };
}
```

### 7.4 Markdown文件解析

**难点**：需要从Markdown中提取Mermaid代码块

**解决方案**：
1. 使用正则表达式匹配```mermaid ... ```
2. 提取代码块内容
3. 支持无标记的纯Mermaid文件

```typescript
function extractMermaidFromMarkdown(text: string): string | null {
  const regex = /```mermaid\s*\n([\s\S]*?)\n```/i;
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}
```

### 7.5 大规模图性能

**难点**：大型Mermaid图可能包含数百个节点

**解决方案**：
1. 异步处理，显示加载状态
2. 批量添加节点，减少重渲染
3. 使用ELK的性能优化选项
4. 考虑分批导入

```typescript
// 批量添加
const batchAddNodes = (nodes: Node[]) => {
  // 使用zustand的批量更新
  set(state => ({
    nodes: [...state.nodes, ...nodes]
  }));
};
```

---

## 8. 测试计划

### 8.1 单元测试

**MermaidParser测试**：
```typescript
describe('MermaidParser', () => {
  it('应该正确解析基础节点', async () => {
    const text = 'flowchart TD\n  A[节点A] --> B[节点B]';
    const parser = new MermaidParser();
    const result = await parser.parse(text);

    expect(result.nodes).toHaveLength(2);
    expect(result.edges).toHaveLength(1);
  });

  it('应该正确解析嵌套子图', async () => {
    const text = `
      flowchart TD
        subgraph outer
          subgraph inner
            A --> B
          end
        end
    `;
    const result = await parser.parse(text);

    expect(result.subgraphs).toHaveLength(2);
    expect(result.subgraphs[1].parent).toBe('outer');
  });
});
```

**MermaidConverter测试**：
```typescript
describe('MermaidConverter', () => {
  it('应该正确转换节点', () => {
    const parseResult = {
      nodes: [{ id: 'A', label: '节点A', shape: 'rect' }],
      edges: [],
      subgraphs: []
    };

    const converter = new MermaidConverter();
    const result = converter.convert(parseResult);

    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0].type).toBe(BlockEnum.NODE);
    expect(result.nodes[0].title).toBe('节点A');
  });

  it('应该正确建立子图嵌套关系', () => {
    const parseResult = {
      nodes: [],
      edges: [],
      subgraphs: [
        { id: 'outer', title: '外层', nodes: ['A'], children: ['inner'], parent: null, level: 0 },
        { id: 'inner', title: '内层', nodes: ['B'], children: [], parent: 'outer', level: 1 }
      ]
    };

    const result = converter.convert(parseResult);

    expect(result.groups).toHaveLength(2);
    expect(result.groups[1].groupId).toBe(result.groups[0].id);
  });
});
```

### 8.2 集成测试

**完整导入流程**：
```typescript
describe('Mermaid Import E2E', () => {
  it('应该成功导入包含子图的Mermaid', async () => {
    const mermaidText = `
      flowchart TD
        A[开始] --> B{判断}

        subgraph process
          B --> C[处理]
          C --> D[结束]
        end
    `;

    const { importMermaid } = useMermaidImport();
    await importMermaid(mermaidText);

    const store = useGraphStore.getState();

    expect(store.nodes.length).toBeGreaterThan(0);
    expect(store.edges.length).toBeGreaterThan(0);

    // 验证子图转换为Group
    const groups = store.nodes.filter(n => n.type === BlockEnum.GROUP);
    expect(groups.length).toBe(1);
  });
});
```

### 8.3 测试用例

| 测试场景 | 输入 | 预期输出 |
|---------|------|---------|
| 简单线性流程 | A → B → C | 3个节点，2条边 |
| 带决策的流程 | A → B{判断} → C/D | 4个节点，3条边 |
| 单层子图 | subgraph含2个节点 | 1个Group，2个Node |
| 嵌套子图（2层） | 外层含内层子图 | 2个Group，正确的groupId关系 |
| 深层嵌套（3层+） | 3层以上嵌套 | 所有Group正确嵌套 |
| 跨组边 | 子图间的连接 | isCrossGroup=true |
| 复杂形状 | 多种节点形状 | 形状信息保存在content |
| 虚线边 | -.-> | strokeDasharray设置 |
| 粗线边 | ==> | strokeWidth=2 |
| 带标签边 | →\|文本\| | label正确设置 |

---

## 9. 后续优化方向

### 9.1 功能增强

- [ ] **双向转换**：支持从画布导出为Mermaid
- [ ] **样式映射**：更完整的样式转换
- [ ] **主题支持**：支持Mermaid主题
- [ ] **实时预览**：输入时实时显示预览
- [ ] **批量导入**：支持多个Mermaid文件
- [ ] **增量导入**：追加到现有画布而非替换

### 9.2 用户体验

- [ ] **语法验证**：实时验证Mermaid语法
- [ ] **错误定位**：指出语法错误位置
- [ ] **智能补全**：Mermaid语法提示
- [ ] **导入预览**：导入前预览效果
- [ ] **撤销导入**：支持导入后撤销

### 9.3 性能优化

- [ ] **分批导入**：大型图分批渲染
- [ ] **虚拟滚动**：节点列表虚拟化
- [ ] **Web Worker**：解析过程放到Worker
- [ ] **缓存机制**：缓存解析结果

---

## 10. 参考资料

- [Mermaid官方文档](https://mermaid.js.org/)
- [Mermaid Flowchart语法](https://mermaid.js.org/syntax/flowchart.html)
- [ELK.js布局算法](https://eclipse.dev/elk/)
- [项目本体结构文档](./项目本体结构.md)
- [Mermaid研究报告](./Mermaid_研究报告.md)
