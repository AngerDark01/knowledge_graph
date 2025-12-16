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
      // 改进的解析逻辑，支持复杂语法
      const parsedLine = this.parseLine(line, nodeMap, currentSubgraph, nodes, edges);

      if (parsedLine) {
        // 行已被解析
        continue;
      }
    }

    console.log(`📦 提取了 ${nodes.length} 个节点`);
    console.log(`🔗 提取了 ${edges.length} 条边`);
    console.log(`📂 提取了 ${subgraphs.length} 个子图`);

    return { nodes, edges, subgraphs, direction };
  }

  /**
   * 解析单行，支持复杂语法
   */
  private parseLine(
    line: string,
    nodeMap: Map<string, MermaidNode>,
    currentSubgraph: MermaidSubgraph | null,
    nodes: MermaidNode[],
    edges: MermaidEdge[]
  ): boolean {
    // 尝试解析边关系（最复杂的情况）
    // 支持格式:
    // 1. A --> B
    // 2. A[label] --> B[label]
    // 3. A --> |edge label| B
    // 4. A ==>text==> B (styled arrow with text)
    // 5. A[label]:::class --> B
    // 6. A[label<br/>line2] --> B

    // 步骤1: 尝试匹配边关系（查找箭头）
    // 改进的箭头匹配模式，支持：-->, --->, ==>, ==>text==>, -.->等
    const arrowPattern = /([-=.]{2,})([^-=.>]*)(>+)/;
    const arrowMatch = line.match(arrowPattern);

    if (!arrowMatch) {
      // 没有箭头，尝试解析单独的节点定义
      return this.parseStandaloneNode(line, nodeMap, currentSubgraph, nodes);
    }

    // 找到箭头位置
    const arrowIndex = line.indexOf(arrowMatch[0]);
    const beforeArrow = line.substring(0, arrowIndex).trim();
    const afterArrow = line.substring(arrowIndex + arrowMatch[0].length).trim();

    // 解析箭头本身
    const arrowFull = arrowMatch[0];
    const arrowBase = arrowMatch[1];  // -- or == or -.
    const arrowText = arrowMatch[2].trim();  // 箭头中间的文本（如"驱动"）
    const arrowEnd = arrowMatch[3];  // >

    // 步骤2: 解析源节点（箭头前的部分）
    const sourceInfo = this.parseNodeDefinition(beforeArrow);
    if (!sourceInfo) {
      console.warn(`  ⚠ 无法解析源节点: ${beforeArrow}`);
      return false;
    }

    // 步骤3: 解析目标节点（箭头后的部分）
    // 可能包含边标签: |label| target 或 target
    let edgeLabel = arrowText || undefined;  // 使用箭头中的文本作为默认标签
    let targetPart = afterArrow;

    // 检查是否有独立的边标签 |label|
    const edgeLabelMatch = afterArrow.match(/^\|([^|]+)\|\s*(.+)$/);
    if (edgeLabelMatch) {
      edgeLabel = edgeLabelMatch[1].trim();
      targetPart = edgeLabelMatch[2].trim();
    } else {
      // 检查另一种标签格式: -- text --> (标签在箭头前)
      const beforeArrowLabelMatch = beforeArrow.match(/^(.+?)\s+--\s+([^-]+)\s+$/);
      if (beforeArrowLabelMatch) {
        // 这种情况很少见，暂不处理
      }
    }

    const targetInfo = this.parseNodeDefinition(targetPart);
    if (!targetInfo) {
      console.warn(`  ⚠ 无法解析目标节点: ${targetPart}`);
      return false;
    }

    // 步骤4: 创建或获取源节点
    if (!nodeMap.has(sourceInfo.id)) {
      const node: MermaidNode = {
        id: sourceInfo.id,
        label: this.processLabel(sourceInfo.label),
        shape: sourceInfo.shape,
        styles: [],
        classes: sourceInfo.classes
      };
      nodes.push(node);
      nodeMap.set(sourceInfo.id, node);

      if (currentSubgraph) {
        currentSubgraph.nodes.push(sourceInfo.id);
      }

      console.log(`  ✓ 创建节点: ${sourceInfo.id} [${node.label}]`);
    }

    // 步骤5: 创建或获取目标节点
    if (!nodeMap.has(targetInfo.id)) {
      const node: MermaidNode = {
        id: targetInfo.id,
        label: this.processLabel(targetInfo.label),
        shape: targetInfo.shape,
        styles: [],
        classes: targetInfo.classes
      };
      nodes.push(node);
      nodeMap.set(targetInfo.id, node);

      if (currentSubgraph) {
        currentSubgraph.nodes.push(targetInfo.id);
      }

      console.log(`  ✓ 创建节点: ${targetInfo.id} [${node.label}]`);
    }

    // 步骤6: 创建边
    const edge: MermaidEdge = {
      id: `edge_${edges.length}`,
      source: sourceInfo.id,
      target: targetInfo.id,
      label: edgeLabel,
      type: this.detectEdgeTypeFromArrow(arrowBase, arrowEnd),
      stroke: arrowBase.includes('.') ? 'dotted' : arrowBase.includes('=') ? 'thick' : 'normal',
      strokeWidth: arrowBase.includes('=') ? 2 : 1
    };

    edges.push(edge);
    console.log(`  ✓ 创建边: ${sourceInfo.id} -> ${targetInfo.id}${edgeLabel ? ` [${edgeLabel}]` : ''}`);

    return true;
  }

  /**
   * 解析节点定义，提取ID、标签、形状、类
   * 支持格式: A, A[label], A[label]:::class, A[label<br/>line2]:::class
   */
  private parseNodeDefinition(text: string): {
    id: string;
    label: string;
    shape: NodeShape;
    classes: string[];
  } | null {
    text = text.trim();
    if (!text) return null;

    // 提取类样式 :::className
    const classMatch = text.match(/:::(\w+)/);
    const classes = classMatch ? [classMatch[1]] : [];
    const textWithoutClass = classMatch ? text.replace(/:::(\w+)/, '').trim() : text;

    // 匹配节点ID和标签
    // 支持: A, A[label], A(label), A{label}, A([label]), A[[label]], 等
    const nodePattern = /^(\w+)(?:(\[\[)([^\]]+)\]\]|(\[)([^\]]+)\]|(\()([^)]+)\)|(\{)([^}]+)\})?/;
    const match = textWithoutClass.match(nodePattern);

    if (!match) {
      // 如果没有匹配到，可能是简单的ID
      const simpleIdMatch = text.match(/^(\w+)/);
      if (simpleIdMatch) {
        return {
          id: simpleIdMatch[1],
          label: simpleIdMatch[1],
          shape: 'rect',
          classes
        };
      }
      return null;
    }

    const id = match[1];
    let label = id;
    let shape: NodeShape = 'rect';

    // 根据括号类型确定形状和标签
    if (match[2] === '[[') {
      // [[label]] - subroutine
      label = match[3];
      shape = 'subroutine';
    } else if (match[4] === '[') {
      // [label] - 需要进一步检查
      label = match[5];
      const fullMatch = textWithoutClass.match(new RegExp(`${id}\\[([^\\]]+)\\]`));
      if (fullMatch) {
        const content = fullMatch[1];
        // 检查特殊形状标记
        if (textWithoutClass.includes(`${id}[(`)) {
          shape = 'cylinder';
        } else if (textWithoutClass.includes(`${id}[/`)) {
          shape = 'parallelogram';
        } else if (textWithoutClass.includes(`${id}[\\`)) {
          shape = 'trapezoid';
        } else {
          shape = 'rect';
        }
      }
    } else if (match[6] === '(') {
      // (label) - 需要进一步检查
      label = match[7];
      if (textWithoutClass.includes(`${id}((`)) {
        shape = 'circle';
      } else if (textWithoutClass.includes(`${id}(((`)) {
        shape = 'double_circle';
      } else if (textWithoutClass.includes(`${id}([`)) {
        shape = 'stadium';
      } else {
        shape = 'round';
      }
    } else if (match[8] === '{') {
      // {label}
      label = match[9];
      if (textWithoutClass.includes(`${id}{{`)) {
        shape = 'hexagon';
      } else {
        shape = 'diamond';
      }
    }

    return { id, label, shape, classes };
  }

  /**
   * 解析单独的节点定义（没有边）
   */
  private parseStandaloneNode(
    line: string,
    nodeMap: Map<string, MermaidNode>,
    currentSubgraph: MermaidSubgraph | null,
    nodes: MermaidNode[]
  ): boolean {
    const nodeInfo = this.parseNodeDefinition(line);
    if (!nodeInfo || nodeMap.has(nodeInfo.id)) {
      return false;
    }

    const node: MermaidNode = {
      id: nodeInfo.id,
      label: this.processLabel(nodeInfo.label),
      shape: nodeInfo.shape,
      styles: [],
      classes: nodeInfo.classes
    };

    nodes.push(node);
    nodeMap.set(nodeInfo.id, node);

    if (currentSubgraph) {
      currentSubgraph.nodes.push(nodeInfo.id);
    }

    console.log(`  ✓ 创建独立节点: ${nodeInfo.id} [${node.label}]`);
    return true;
  }

  /**
   * 处理标签中的特殊标记（如<br/>）
   */
  private processLabel(label: string): string {
    // 将<br/>替换为换行符或空格
    return label.replace(/<br\s*\/?>/gi, ' ').trim();
  }

  /**
   * 从箭头样式检测边类型
   */
  private detectEdgeTypeFromArrow(arrowBase: string, arrowEnd: string): EdgeType {
    if (arrowBase.includes('.')) return 'dotted';
    if (arrowBase.includes('=')) return 'thick';
    if (arrowEnd.length > 1) return 'double_arrow_point';
    if (arrowEnd === '>') return 'arrow_point';
    return 'arrow_open';
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
