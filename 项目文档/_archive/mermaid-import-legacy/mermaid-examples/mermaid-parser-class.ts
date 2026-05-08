/**
 * Mermaid 解析器类（TypeScript 版本）
 *
 * 完整的面向对象封装，适用于知识图谱编辑器项目
 *
 * 安装依赖：
 * npm install mermaid
 */

import mermaid from 'mermaid';

// ============ 类型定义 ============

interface MermaidNode {
    id: string;
    label: string;
    shape: NodeShape;
    styles?: string[];
    classes?: string[];
    metadata?: Record<string, any>;
}

interface MermaidEdge {
    id: string;
    source: string;
    target: string;
    label?: string;
    type: EdgeType;
    stroke: StrokeType;
    strokeWidth: number;
    length?: number;
}

interface MermaidSubgraph {
    id: string;
    title: string;
    nodes: string[];
    direction: Direction;
    classes?: string[];
    children: string[];
    parent: string | null;
    level: number;
}

interface ParseResult {
    nodes: MermaidNode[];
    edges: MermaidEdge[];
    subgraphs: MermaidSubgraph[];
}

interface ParseMetadata {
    nodeCount: number;
    edgeCount: number;
    subgraphCount: number;
    maxSubgraphDepth: number;
}

type NodeShape =
    | 'rect'
    | 'round'
    | 'stadium'
    | 'subroutine'
    | 'cylinder'
    | 'circle'
    | 'asymmetric'
    | 'diamond'
    | 'hexagon'
    | 'parallelogram'
    | 'trapezoid';

type EdgeType =
    | 'arrow_point'
    | 'arrow_open'
    | 'arrow_circle'
    | 'arrow_cross'
    | 'dotted'
    | 'thick';

type StrokeType = 'normal' | 'thick' | 'dotted' | 'invisible';

type Direction = 'TB' | 'TD' | 'BT' | 'RL' | 'LR';

// ============ 解析器类 ============

export class MermaidFlowchartParser {
    private initialized: boolean = false;

    constructor() {
        this.initialize();
    }

    /**
     * 初始化 Mermaid
     */
    private initialize(): void {
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
    }

    /**
     * 验证 Mermaid 代码语法
     */
    async validate(mermaidText: string): Promise<boolean> {
        try {
            await mermaid.parse(mermaidText);
            return true;
        } catch (error) {
            console.error('Mermaid 语法验证失败:', error);
            return false;
        }
    }

    /**
     * 解析 Mermaid Flowchart
     */
    async parse(mermaidText: string): Promise<ParseResult> {
        if (!this.initialized) {
            throw new Error('Parser not initialized');
        }

        // 验证语法
        const isValid = await this.validate(mermaidText);
        if (!isValid) {
            throw new Error('Invalid Mermaid syntax');
        }

        // 获取图表对象
        const diagram = await mermaid.mermaidAPI.getDiagramFromText(mermaidText);
        const parser = diagram.parser.yy;

        // 提取原始数据
        const rawVertices = parser.getVertices();
        const rawEdges = parser.getEdges();
        const rawSubgraphs = parser.getSubgraphs();

        // 格式化数据
        return {
            nodes: this.transformNodes(rawVertices),
            edges: this.transformEdges(rawEdges),
            subgraphs: this.transformSubgraphs(rawSubgraphs)
        };
    }

    /**
     * 解析并获取元数据
     */
    async parseWithMetadata(mermaidText: string): Promise<{
        result: ParseResult;
        metadata: ParseMetadata;
    }> {
        const result = await this.parse(mermaidText);
        const metadata = this.calculateMetadata(result);

        return { result, metadata };
    }

    /**
     * 转换节点数据
     */
    private transformNodes(vertices: any): MermaidNode[] {
        const nodes: MermaidNode[] = [];

        for (const [id, vertex] of Object.entries(vertices)) {
            const node: MermaidNode = {
                id: vertex.id,
                label: vertex.text,
                shape: this.detectNodeShape(vertex),
                styles: vertex.styles || [],
                classes: vertex.classes || [],
                metadata: {
                    labelType: vertex.labelType,
                    domId: vertex.domId,
                    props: vertex.props || {}
                }
            };

            nodes.push(node);
        }

        return nodes;
    }

    /**
     * 转换边数据
     */
    private transformEdges(edges: any[]): MermaidEdge[] {
        return edges.map((edge, index) => ({
            id: edge.id || `edge_${index}`,
            source: edge.start,
            target: edge.end,
            label: edge.text || undefined,
            type: edge.type || 'arrow_point',
            stroke: edge.stroke || 'normal',
            strokeWidth: this.calculateStrokeWidth(edge.stroke),
            length: edge.length || 1
        }));
    }

    /**
     * 转换子图数据
     */
    private transformSubgraphs(subgraphs: any[]): MermaidSubgraph[] {
        const transformed: MermaidSubgraph[] = [];
        const subgraphMap = new Map<string, MermaidSubgraph>();

        // 第一遍：创建子图对象
        for (const sg of subgraphs) {
            const subgraph: MermaidSubgraph = {
                id: sg.id,
                title: sg.title || sg.id,
                nodes: sg.nodes || [],
                direction: sg.dir || 'TB',
                classes: sg.classes || [],
                children: [],
                parent: null,
                level: 0
            };

            subgraphMap.set(sg.id, subgraph);
            transformed.push(subgraph);
        }

        // 第二遍：建立父子关系
        for (const subgraph of transformed) {
            for (const nodeId of subgraph.nodes) {
                if (subgraphMap.has(nodeId)) {
                    const child = subgraphMap.get(nodeId)!;
                    child.parent = subgraph.id;
                    subgraph.children.push(nodeId);
                }
            }
        }

        // 第三遍：计算层级
        for (const subgraph of transformed) {
            subgraph.level = this.calculateSubgraphLevel(subgraph, subgraphMap);
        }

        return transformed;
    }

    /**
     * 检测节点形状
     */
    private detectNodeShape(vertex: any): NodeShape {
        const type = vertex.type;

        // 形状映射
        const shapeMap: Record<string, NodeShape> = {
            'rect': 'rect',
            'round': 'round',
            'stadium': 'stadium',
            'subroutine': 'subroutine',
            'cylinder': 'cylinder',
            'circle': 'circle',
            'asymmetric': 'asymmetric',
            'rhombus': 'diamond',
            'diamond': 'diamond',
            'hexagon': 'hexagon',
            'parallelogram': 'parallelogram',
            'trapezoid': 'trapezoid'
        };

        return shapeMap[type] || 'rect';
    }

    /**
     * 计算线条宽度
     */
    private calculateStrokeWidth(stroke?: string): number {
        const widthMap: Record<string, number> = {
            'normal': 2,
            'thick': 3.5,
            'dotted': 2,
            'invisible': 0
        };

        return widthMap[stroke || 'normal'] || 2;
    }

    /**
     * 计算子图层级
     */
    private calculateSubgraphLevel(
        subgraph: MermaidSubgraph,
        map: Map<string, MermaidSubgraph>
    ): number {
        if (subgraph.parent === null) {
            return 0;
        }

        const parent = map.get(subgraph.parent);
        if (!parent) {
            return 0;
        }

        return this.calculateSubgraphLevel(parent, map) + 1;
    }

    /**
     * 计算元数据
     */
    private calculateMetadata(result: ParseResult): ParseMetadata {
        const maxDepth = result.subgraphs.length > 0
            ? Math.max(...result.subgraphs.map(sg => sg.level))
            : 0;

        return {
            nodeCount: result.nodes.length,
            edgeCount: result.edges.length,
            subgraphCount: result.subgraphs.length,
            maxSubgraphDepth: maxDepth
        };
    }

    /**
     * 获取顶层节点（不属于任何子图的节点）
     */
    getTopLevelNodes(result: ParseResult): MermaidNode[] {
        const nodesInSubgraphs = new Set<string>();

        for (const subgraph of result.subgraphs) {
            for (const nodeId of subgraph.nodes) {
                // 只添加真实节点，排除嵌套子图
                if (!result.subgraphs.some(sg => sg.id === nodeId)) {
                    nodesInSubgraphs.add(nodeId);
                }
            }
        }

        return result.nodes.filter(node => !nodesInSubgraphs.has(node.id));
    }

    /**
     * 获取子图的所有后代节点（递归展开）
     */
    getSubgraphDescendants(
        subgraphId: string,
        result: ParseResult
    ): MermaidNode[] {
        const subgraph = result.subgraphs.find(sg => sg.id === subgraphId);
        if (!subgraph) {
            return [];
        }

        const descendants: MermaidNode[] = [];
        const visited = new Set<string>();

        const traverse = (sg: MermaidSubgraph) => {
            for (const nodeId of sg.nodes) {
                if (visited.has(nodeId)) continue;
                visited.add(nodeId);

                // 检查是否是子图
                const childSubgraph = result.subgraphs.find(s => s.id === nodeId);
                if (childSubgraph) {
                    traverse(childSubgraph);
                } else {
                    const node = result.nodes.find(n => n.id === nodeId);
                    if (node) {
                        descendants.push(node);
                    }
                }
            }
        };

        traverse(subgraph);
        return descendants;
    }

    /**
     * 导出为知识图谱格式
     */
    exportToKnowledgeGraph(result: ParseResult): {
        entities: any[];
        relations: any[];
        groups: any[];
    } {
        return {
            entities: result.nodes.map(node => ({
                id: node.id,
                name: node.label,
                type: this.mapShapeToEntityType(node.shape),
                properties: {
                    shape: node.shape,
                    styles: node.styles,
                    classes: node.classes
                }
            })),
            relations: result.edges.map(edge => ({
                id: edge.id,
                source: edge.source,
                target: edge.target,
                type: this.mapEdgeTypeToRelationType(edge.type),
                properties: {
                    label: edge.label,
                    stroke: edge.stroke,
                    strokeWidth: edge.strokeWidth
                }
            })),
            groups: result.subgraphs.map(sg => ({
                id: sg.id,
                name: sg.title,
                members: this.getSubgraphDescendants(sg.id, result).map(n => n.id),
                level: sg.level,
                parent: sg.parent
            }))
        };
    }

    /**
     * 映射形状到实体类型
     */
    private mapShapeToEntityType(shape: NodeShape): string {
        const typeMap: Record<NodeShape, string> = {
            'rect': 'process',
            'round': 'terminal',
            'stadium': 'action',
            'subroutine': 'subroutine',
            'cylinder': 'database',
            'circle': 'event',
            'asymmetric': 'output',
            'diamond': 'decision',
            'hexagon': 'preparation',
            'parallelogram': 'input',
            'trapezoid': 'manual'
        };

        return typeMap[shape] || 'default';
    }

    /**
     * 映射边类型到关系类型
     */
    private mapEdgeTypeToRelationType(edgeType: EdgeType): string {
        const typeMap: Record<EdgeType, string> = {
            'arrow_point': 'directed',
            'arrow_open': 'undirected',
            'arrow_circle': 'associated',
            'arrow_cross': 'excluded',
            'dotted': 'weak',
            'thick': 'strong'
        };

        return typeMap[edgeType] || 'default';
    }
}

// ============ 使用示例 ============

async function example() {
    const parser = new MermaidFlowchartParser();

    const mermaidCode = `
flowchart TB
    Start([开始]) --> Auth

    subgraph system [系统架构]
        direction TB

        subgraph frontend [前端层]
            UI[用户界面] --> API[API调用]
        end

        subgraph backend [后端层]
            direction LR
            Auth[认证服务] --> BizLogic[业务逻辑]
            BizLogic --> DB[(数据库)]
        end

        frontend --> backend
    end

    Auth --> End([结束])
    `;

    try {
        // 解析
        const { result, metadata } = await parser.parseWithMetadata(mermaidCode);

        console.log('=== 解析结果 ===');
        console.log('节点数:', metadata.nodeCount);
        console.log('边数:', metadata.edgeCount);
        console.log('子图数:', metadata.subgraphCount);
        console.log('最大嵌套深度:', metadata.maxSubgraphDepth);

        // 导出为知识图谱格式
        const kg = parser.exportToKnowledgeGraph(result);
        console.log('\n=== 知识图谱格式 ===');
        console.log(JSON.stringify(kg, null, 2));

        // 获取顶层节点
        const topNodes = parser.getTopLevelNodes(result);
        console.log('\n=== 顶层节点 ===');
        topNodes.forEach(node => {
            console.log(`- ${node.id}: ${node.label}`);
        });

    } catch (error) {
        console.error('解析失败:', error);
    }
}

// 在支持 top-level await 的环境中运行
// await example();

export default MermaidFlowchartParser;
