/**
 * Mermaid解析器
 *
 * 使用mermaid包的parser.yy API解析Mermaid Flowchart文本
 * 提取节点、边、子图信息
 */

import mermaid from 'mermaid';
import {
  MermaidParseResult,
  MermaidNode,
  MermaidEdge,
  MermaidSubgraph,
  NodeShape,
  EdgeType,
  StrokeType,
  Direction
} from './types';

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
        htmlLabels: true,
        curve: 'basis'
      },
      securityLevel: 'loose'
    });

    this.initialized = true;
    console.log('✅ Mermaid解析器初始化完成');
  }

  /**
   * 解析Mermaid文本
   * @param mermaidText Mermaid Flowchart文本
   * @returns 解析结果
   */
  async parse(mermaidText: string): Promise<MermaidParseResult> {
    try {
      console.log('🔍 开始解析Mermaid文本...');

      // 验证语法
      await mermaid.parse(mermaidText);

      // 获取图表对象（使用非官方API）
      const diagram = await (mermaid as any).mermaidAPI.getDiagramFromText(mermaidText);
      const parser = diagram.parser;

      if (!parser || !parser.yy) {
        throw new Error('无法获取解析器对象');
      }

      // 提取节点
      const vertices = parser.yy.getVertices();
      const nodes = this.extractNodes(vertices);
      console.log(`📦 提取了 ${nodes.length} 个节点`);

      // 提取边
      const rawEdges = parser.yy.getEdges();
      const edges = this.extractEdges(rawEdges);
      console.log(`🔗 提取了 ${edges.length} 条边`);

      // 提取子图
      const rawSubgraphs = parser.yy.getSubgraphs ? parser.yy.getSubgraphs() : [];
      const subgraphs = this.extractSubgraphs(rawSubgraphs);
      console.log(`📂 提取了 ${subgraphs.length} 个子图`);

      // 提取全局方向
      const direction = (parser.yy.getDirection ? parser.yy.getDirection() : 'TB') as Direction;

      console.log('✅ Mermaid解析完成');

      return { nodes, edges, subgraphs, direction };
    } catch (error: any) {
      console.error('❌ Mermaid解析失败:', error);
      throw new Error(`Mermaid解析失败: ${error.message}`);
    }
  }

  /**
   * 提取节点信息
   */
  private extractNodes(vertices: any): MermaidNode[] {
    const nodes: MermaidNode[] = [];

    if (!vertices) {
      return nodes;
    }

    // vertices 是一个对象，key是节点ID
    for (const [id, vertex] of Object.entries(vertices as Record<string, any>)) {
      const node: MermaidNode = {
        id: id,
        label: this.cleanText(vertex.text || id),
        shape: this.parseNodeShape(vertex.type),
        styles: vertex.styles || [],
        classes: vertex.classes || [],
        metadata: vertex
      };

      nodes.push(node);
    }

    return nodes;
  }

  /**
   * 提取边信息
   */
  private extractEdges(rawEdges: any[]): MermaidEdge[] {
    if (!Array.isArray(rawEdges)) {
      return [];
    }

    return rawEdges.map((edge, index) => {
      const edgeType = this.parseEdgeType(edge.type);
      const strokeType = this.parseStrokeType(edge.stroke);

      return {
        id: `edge_${index}`,
        source: edge.start,
        target: edge.end,
        label: this.cleanText(edge.text),
        type: edgeType,
        stroke: strokeType,
        strokeWidth: strokeType === 'thick' ? 2 : 1,
        length: edge.length || 1
      };
    });
  }

  /**
   * 提取子图信息
   */
  private extractSubgraphs(rawSubgraphs: any[]): MermaidSubgraph[] {
    if (!Array.isArray(rawSubgraphs)) {
      return [];
    }

    const subgraphs: MermaidSubgraph[] = rawSubgraphs.map(subgraph => ({
      id: subgraph.id,
      title: this.cleanText(subgraph.title || subgraph.id),
      nodes: subgraph.nodes || [],
      direction: (subgraph.dir || 'TB') as Direction,
      classes: subgraph.classes || [],
      children: [],
      parent: null,
      level: 0
    }));

    // 计算嵌套关系
    this.calculateNesting(subgraphs);

    return subgraphs;
  }

  /**
   * 计算子图嵌套关系
   */
  private calculateNesting(subgraphs: MermaidSubgraph[]): void {
    if (subgraphs.length === 0) return;

    // 构建节点所属关系映射
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

        // 如果当前子图的ID在另一个子图的nodes中，说明是嵌套关系
        if (otherSubgraph.nodes.includes(subgraph.id)) {
          subgraph.parent = otherSubgraph.id;
          if (!otherSubgraph.children.includes(subgraph.id)) {
            otherSubgraph.children.push(subgraph.id);
          }
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

    console.log('📊 子图嵌套关系计算完成:', {
      总数: subgraphs.length,
      最大层级: Math.max(...subgraphs.map(s => s.level), 0)
    });
  }

  /**
   * 解析节点形状
   */
  private parseNodeShape(type: string): NodeShape {
    const shapeMap: Record<string, NodeShape> = {
      'square': 'rect',
      'rect': 'rect',
      'round': 'round',
      'stadium': 'stadium',
      'subroutine': 'subroutine',
      'cylindrical': 'cylinder',
      'cylinder': 'cylinder',
      'circle': 'circle',
      'asymmetric': 'asymmetric',
      'rhombus': 'diamond',
      'diamond': 'diamond',
      'hexagon': 'hexagon',
      'parallelogram': 'parallelogram',
      'trapezoid': 'trapezoid',
      'double_circle': 'double_circle'
    };

    return shapeMap[type] || 'rect';
  }

  /**
   * 解析边类型
   */
  private parseEdgeType(type: string): EdgeType {
    if (!type) return 'arrow_point';

    if (type.includes('double')) return 'double_arrow_point';
    if (type.includes('circle')) return 'arrow_circle';
    if (type.includes('cross')) return 'arrow_cross';
    if (type.includes('open')) return 'arrow_open';
    if (type.includes('dotted')) return 'dotted';
    if (type.includes('thick')) return 'thick';

    return 'arrow_point';
  }

  /**
   * 解析线型
   */
  private parseStrokeType(stroke: string): StrokeType {
    if (!stroke) return 'normal';

    if (stroke === 'thick') return 'thick';
    if (stroke === 'dotted' || stroke === 'dashed') return 'dotted';
    if (stroke === 'invisible') return 'invisible';

    return 'normal';
  }

  /**
   * 清理文本（去除HTML标签和多余空格）
   */
  private cleanText(text: string | undefined): string {
    if (!text) return '';

    return text
      .replace(/<[^>]*>/g, '')  // 去除HTML标签
      .replace(/&nbsp;/g, ' ')  // 替换空格实体
      .trim();
  }

  /**
   * 验证Mermaid语法（不解析）
   */
  async validate(mermaidText: string): Promise<boolean> {
    try {
      await mermaid.parse(mermaidText);
      return true;
    } catch (error) {
      return false;
    }
  }
}
