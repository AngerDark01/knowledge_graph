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

      // 使用render方法来解析
      const elementId = `mermaid-temp-${Date.now()}`;
      const { svg } = await mermaid.render(elementId, mermaidText);

      // 从渲染结果中提取信息
      // 由于mermaid库的限制，我们使用简单的文本解析
      const parseResult = this.parseFromText(mermaidText);

      console.log('✅ Mermaid解析完成');

      return parseResult;
    } catch (error: any) {
      console.error('❌ Mermaid解析失败:', error);
      throw new Error(`Mermaid解析失败: ${error.message}`);
    }
  }

  /**
   * 从文本解析Mermaid（简单解析器）
   */
  private parseFromText(text: string): MermaidParseResult {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('%%'));

    const nodes: MermaidNode[] = [];
    const edges: MermaidEdge[] = [];
    const subgraphs: MermaidSubgraph[] = [];
    const nodeMap = new Map<string, MermaidNode>();

    let currentSubgraph: MermaidSubgraph | null = null;
    const subgraphStack: MermaidSubgraph[] = [];
    let direction: Direction = 'TB';

    // 第一行通常是flowchart方向
    const firstLine = lines[0];
    if (firstLine.startsWith('flowchart') || firstLine.startsWith('graph')) {
      const dirMatch = firstLine.match(/flowchart\s+(TB|TD|BT|RL|LR)|graph\s+(TB|TD|BT|RL|LR)/i);
      if (dirMatch) {
        direction = (dirMatch[1] || dirMatch[2] || 'TB').toUpperCase() as Direction;
      }
    }

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];

      // 检查子图开始
      if (line.startsWith('subgraph')) {
        const match = line.match(/subgraph\s+(\w+)(?:\s+\[(.+)\])?/);
        if (match) {
          const subgraph: MermaidSubgraph = {
            id: match[1],
            title: match[2] || match[1],
            nodes: [],
            direction: 'TB',
            classes: [],
            children: [],
            parent: currentSubgraph?.id || null,
            level: subgraphStack.length
          };

          if (currentSubgraph) {
            currentSubgraph.children.push(subgraph.id);
          }

          subgraphs.push(subgraph);
          subgraphStack.push(subgraph);
          currentSubgraph = subgraph;
        }
        continue;
      }

      // 检查子图结束
      if (line === 'end') {
        subgraphStack.pop();
        currentSubgraph = subgraphStack[subgraphStack.length - 1] || null;
        continue;
      }

      // 检查方向设置
      if (line.startsWith('direction') && currentSubgraph) {
        const dirMatch = line.match(/direction\s+(TB|TD|BT|RL|LR)/i);
        if (dirMatch) {
          currentSubgraph.direction = dirMatch[1].toUpperCase() as Direction;
        }
        continue;
      }

      // 解析节点和边
      // 支持格式: A[文本] --> B[文本] 或 A --> B
      const edgeMatch = line.match(/(\w+)(?:\[([^\]]+)\]|\(([^)]+)\)|\{([^}]+)\})?(?:\s*(-+>|=+>|\.+>|---|--)(?:\|([^|]+)\|)?\s*)(\w+)(?:\[([^\]]+)\]|\(([^)]+)\)|\{([^}]+)\})?/);

      if (edgeMatch) {
        const [_, sourceId, sourceLabel1, sourceLabel2, sourceLabel3, arrow, edgeLabel, targetId, targetLabel1, targetLabel2, targetLabel3] = edgeMatch;

        // 添加源节点
        if (!nodeMap.has(sourceId)) {
          const node: MermaidNode = {
            id: sourceId,
            label: sourceLabel1 || sourceLabel2 || sourceLabel3 || sourceId,
            shape: this.detectShape(line, sourceId),
            styles: [],
            classes: []
          };
          nodes.push(node);
          nodeMap.set(sourceId, node);

          if (currentSubgraph) {
            currentSubgraph.nodes.push(sourceId);
          }
        }

        // 添加目标节点
        if (!nodeMap.has(targetId)) {
          const node: MermaidNode = {
            id: targetId,
            label: targetLabel1 || targetLabel2 || targetLabel3 || targetId,
            shape: this.detectShape(line, targetId),
            styles: [],
            classes: []
          };
          nodes.push(node);
          nodeMap.set(targetId, node);

          if (currentSubgraph) {
            currentSubgraph.nodes.push(targetId);
          }
        }

        // 添加边
        edges.push({
          id: `edge_${edges.length}`,
          source: sourceId,
          target: targetId,
          label: edgeLabel?.trim(),
          type: this.detectEdgeType(arrow),
          stroke: arrow.includes('.') ? 'dotted' : arrow.includes('=') ? 'thick' : 'normal',
          strokeWidth: arrow.includes('=') ? 2 : 1
        });
      } else {
        // 单独的节点定义
        const nodeMatch = line.match(/(\w+)(?:\[([^\]]+)\]|\(([^)]+)\)|\{([^}]+)\})/);
        if (nodeMatch && !nodeMap.has(nodeMatch[1])) {
          const [_, nodeId, label1, label2, label3] = nodeMatch;
          const node: MermaidNode = {
            id: nodeId,
            label: label1 || label2 || label3 || nodeId,
            shape: this.detectShape(line, nodeId),
            styles: [],
            classes: []
          };
          nodes.push(node);
          nodeMap.set(nodeId, node);

          if (currentSubgraph) {
            currentSubgraph.nodes.push(nodeId);
          }
        }
      }
    }

    console.log(`📦 提取了 ${nodes.length} 个节点`);
    console.log(`🔗 提取了 ${edges.length} 条边`);
    console.log(`📂 提取了 ${subgraphs.length} 个子图`);

    return { nodes, edges, subgraphs, direction };
  }

  /**
   * 检测节点形状
   */
  private detectShape(line: string, nodeId: string): NodeShape {
    // 检测节点定义中的括号类型
    if (line.includes(`${nodeId}([`)) return 'stadium';
    if (line.includes(`${nodeId}[(`)) return 'cylinder';
    if (line.includes(`${nodeId}((`)) return 'circle';
    if (line.includes(`${nodeId}(((`)) return 'double_circle';
    if (line.includes(`${nodeId}[`)) return 'rect';
    if (line.includes(`${nodeId}(`)) return 'round';
    if (line.includes(`${nodeId}{`)) return 'diamond';
    if (line.includes(`${nodeId}{{`)) return 'hexagon';

    return 'rect';
  }

  /**
   * 检测边类型
   */
  private detectEdgeType(arrow: string): EdgeType {
    if (arrow.includes('.')) return 'dotted';
    if (arrow.includes('=')) return 'thick';
    if (arrow.includes('<->')) return 'double_arrow_point';
    if (arrow.includes('-->')) return 'arrow_point';
    if (arrow.includes('--')) return 'arrow_open';

    return 'arrow_point';
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
