/**
 * Mermaid Flowchart 基础解析器示例
 *
 * 使用 mermaid 包的 parser.yy API 解析流程图
 *
 * 安装依赖：
 * npm install mermaid
 */

import mermaid from 'mermaid';

/**
 * 初始化 Mermaid
 */
function initMermaid() {
    mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        flowchart: {
            useMaxWidth: false,
            htmlLabels: true
        }
    });
}

/**
 * 解析 Mermaid Flowchart
 * @param {string} mermaidText - Mermaid 代码文本
 * @returns {Promise<Object>} 解析结果
 */
async function parseMermaidFlowchart(mermaidText) {
    try {
        // 1. 验证语法
        const isValid = await mermaid.parse(mermaidText);
        if (!isValid) {
            throw new Error('Mermaid 语法无效');
        }

        // 2. 获取图表对象
        const diagram = await mermaid.mermaidAPI.getDiagramFromText(mermaidText);

        // 3. 访问解析器
        const parser = diagram.parser.yy;

        // 4. 提取所有元素
        const vertices = parser.getVertices();
        const edges = parser.getEdges();
        const subgraphs = parser.getSubgraphs();

        return {
            success: true,
            data: {
                nodes: vertices,
                edges: edges,
                subgraphs: subgraphs
            },
            metadata: {
                nodeCount: Object.keys(vertices).length,
                edgeCount: edges.length,
                subgraphCount: subgraphs.length
            }
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            stack: error.stack
        };
    }
}

/**
 * 格式化节点数据为标准格式
 * @param {Object} vertices - 原始节点数据
 * @returns {Array} 格式化后的节点数组
 */
function formatNodes(vertices) {
    const nodes = [];

    for (const [id, vertex] of Object.entries(vertices)) {
        nodes.push({
            id: vertex.id,
            label: vertex.text,
            shape: vertex.type || 'rect',
            styles: vertex.styles || [],
            classes: vertex.classes || [],
            labelType: vertex.labelType || 'text',
            domId: vertex.domId
        });
    }

    return nodes;
}

/**
 * 格式化边数据为标准格式
 * @param {Array} edges - 原始边数据
 * @returns {Array} 格式化后的边数组
 */
function formatEdges(edges) {
    return edges.map((edge, index) => ({
        id: edge.id || `edge_${index}`,
        source: edge.start,
        target: edge.end,
        label: edge.text || '',
        type: edge.type || 'arrow_point',
        stroke: edge.stroke || 'normal',
        strokeWidth: edge.stroke === 'thick' ? 3.5 : 2,
        length: edge.length || 1,
        labelType: edge.labelType || 'text'
    }));
}

/**
 * 格式化子图数据，包括嵌套关系
 * @param {Array} subgraphs - 原始子图数据
 * @returns {Array} 格式化后的子图数组
 */
function formatSubgraphs(subgraphs) {
    const formatted = [];
    const subgraphMap = new Map();

    // 第一遍：构建基础子图对象
    for (const sg of subgraphs) {
        const subgraph = {
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
        formatted.push(subgraph);
    }

    // 第二遍：建立嵌套关系
    for (const subgraph of formatted) {
        for (const nodeId of subgraph.nodes) {
            if (subgraphMap.has(nodeId)) {
                const childSubgraph = subgraphMap.get(nodeId);
                childSubgraph.parent = subgraph.id;
                subgraph.children.push(nodeId);
            }
        }
    }

    // 第三遍：计算层级
    function calculateLevel(sg) {
        if (sg.parent === null) {
            sg.level = 0;
        } else {
            const parentSg = subgraphMap.get(sg.parent);
            sg.level = calculateLevel(parentSg) + 1;
        }
        return sg.level;
    }

    for (const subgraph of formatted) {
        calculateLevel(subgraph);
    }

    return formatted;
}

/**
 * 完整解析函数（包含格式化）
 */
async function parseAndFormat(mermaidText) {
    const result = await parseMermaidFlowchart(mermaidText);

    if (!result.success) {
        return result;
    }

    return {
        success: true,
        data: {
            nodes: formatNodes(result.data.nodes),
            edges: formatEdges(result.data.edges),
            subgraphs: formatSubgraphs(result.data.subgraphs)
        },
        metadata: result.metadata
    };
}

// ============ 使用示例 ============

const exampleMermaid = `
flowchart TB
    Start([开始]) --> CheckLogin{已登录?}

    subgraph auth [认证模块]
        direction TB
        CheckLogin -->|否| Login[登录]
        Login --> Validate{验证}
        Validate -->|失败| Login
        Validate -->|成功| Session[创建会话]
    end

    CheckLogin -->|是| Dashboard
    Session --> Dashboard

    subgraph main [主应用]
        Dashboard[控制台]
        Dashboard --> Features

        subgraph Features [功能]
            direction LR
            Create[创建] --> Read[读取]
            Read --> Update[更新]
            Update --> Delete[删除]
        end
    end

    Dashboard --> Logout{退出?}
    Logout -->|是| End([结束])
    Logout -->|否| Dashboard
`;

// 在 Node.js 环境中使用
if (typeof module !== 'undefined' && module.exports) {
    initMermaid();

    parseAndFormat(exampleMermaid).then(result => {
        console.log('=== 解析结果 ===');
        console.log(JSON.stringify(result, null, 2));

        if (result.success) {
            console.log('\n=== 统计信息 ===');
            console.log(`节点数量: ${result.metadata.nodeCount}`);
            console.log(`边数量: ${result.metadata.edgeCount}`);
            console.log(`子图数量: ${result.metadata.subgraphCount}`);

            console.log('\n=== 节点列表 ===');
            result.data.nodes.forEach(node => {
                console.log(`- ${node.id}: ${node.label} (${node.shape})`);
            });

            console.log('\n=== 边列表 ===');
            result.data.edges.forEach(edge => {
                const label = edge.label ? ` [${edge.label}]` : '';
                console.log(`- ${edge.source} → ${edge.target}${label}`);
            });

            console.log('\n=== 子图层级 ===');
            result.data.subgraphs
                .sort((a, b) => a.level - b.level)
                .forEach(sg => {
                    const indent = '  '.repeat(sg.level);
                    console.log(`${indent}L${sg.level}: ${sg.title} (${sg.nodes.length} nodes)`);
                });
        }
    }).catch(error => {
        console.error('解析失败:', error);
    });
}

export {
    initMermaid,
    parseMermaidFlowchart,
    formatNodes,
    formatEdges,
    formatSubgraphs,
    parseAndFormat
};
