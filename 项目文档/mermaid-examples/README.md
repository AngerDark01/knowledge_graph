# Mermaid Flowchart 解析器示例

这个目录包含了完整的 Mermaid Flowchart 解析器示例代码和测试用例。

## 目录结构

```
mermaid-examples/
├── basic-parser.js           # 基础解析器示例 (JavaScript)
├── mermaid-parser-class.ts   # 完整解析器类 (TypeScript)
├── test-examples.mmd         # 测试用例集合 (12个示例)
├── package.json              # 依赖配置
└── README.md                 # 本文档
```

## 安装依赖

```bash
cd mermaid-examples
npm install
```

## 使用方法

### 1. 基础解析器 (JavaScript)

```bash
npm run parse:basic
```

或直接运行：

```bash
node basic-parser.js
```

**功能特性：**
- 解析节点、边、子图
- 格式化数据输出
- 建立子图嵌套关系
- 计算子图层级
- 统计元数据

**示例代码：**

```javascript
import { parseAndFormat } from './basic-parser.js';

const mermaidCode = `
flowchart TD
    A[开始] --> B{决策}
    B -->|是| C[处理]
    B -->|否| D[结束]
`;

const result = await parseAndFormat(mermaidCode);
console.log(result);
```

### 2. TypeScript 解析器类

```bash
npm run parse:class
```

**功能特性：**
- 完整的 TypeScript 类型定义
- 面向对象设计
- 导出为知识图谱格式
- 获取顶层节点
- 递归获取子图后代节点
- 形状和边类型映射

**示例代码：**

```typescript
import MermaidFlowchartParser from './mermaid-parser-class';

const parser = new MermaidFlowchartParser();

// 解析
const { result, metadata } = await parser.parseWithMetadata(mermaidCode);

// 导出为知识图谱格式
const kg = parser.exportToKnowledgeGraph(result);

// 获取顶层节点
const topNodes = parser.getTopLevelNodes(result);

// 获取子图的所有后代节点
const descendants = parser.getSubgraphDescendants('subgraph_id', result);
```

### 3. 测试示例

`test-examples.mmd` 文件包含 12 个完整的测试示例：

1. **基础节点形状展示** - 展示所有 14 种节点形状
2. **各种边类型** - 展示 10 种不同的连接线类型
3. **简单业务流程** - 数据处理流程示例
4. **基础子图** - 单层子图示例
5. **嵌套子图 - 电商系统** - 3层嵌套的电商系统架构
6. **软件开发流程** - 完整的开发流程图
7. **微服务架构** - 复杂的微服务系统架构
8. **深度嵌套** - 4层嵌套示例（需要 elk 渲染器）
9. **复杂决策树** - 多分支决策流程
10. **数据处理流水线** - ETL 数据处理流程
11. **Git 工作流** - Git 开发工作流程
12. **用户认证流程** - 带样式的认证流程

**在线预览：**

访问 [Mermaid Live Editor](https://mermaid.live/)，复制 `test-examples.mmd` 中的任意示例即可预览。

## API 参考

### 基础解析器函数

#### `initMermaid()`
初始化 Mermaid 配置。

#### `parseMermaidFlowchart(mermaidText: string): Promise<Object>`
解析 Mermaid 文本并返回原始数据。

**返回值：**
```javascript
{
    success: boolean,
    data: {
        nodes: Object,    // 节点对象
        edges: Array,     // 边数组
        subgraphs: Array  // 子图数组
    },
    metadata: {
        nodeCount: number,
        edgeCount: number,
        subgraphCount: number
    }
}
```

#### `formatNodes(vertices: Object): Array`
格式化节点数据。

**返回值：**
```javascript
[
    {
        id: string,
        label: string,
        shape: string,
        styles: string[],
        classes: string[],
        labelType: string,
        domId: string
    }
]
```

#### `formatEdges(edges: Array): Array`
格式化边数据。

**返回值：**
```javascript
[
    {
        id: string,
        source: string,
        target: string,
        label: string,
        type: string,
        stroke: string,
        strokeWidth: number,
        length: number
    }
]
```

#### `formatSubgraphs(subgraphs: Array): Array`
格式化子图数据并建立嵌套关系。

**返回值：**
```javascript
[
    {
        id: string,
        title: string,
        nodes: string[],
        direction: string,
        classes: string[],
        children: string[],
        parent: string | null,
        level: number
    }
]
```

#### `parseAndFormat(mermaidText: string): Promise<Object>`
完整解析并格式化所有数据。

### TypeScript 解析器类

#### `new MermaidFlowchartParser()`
创建解析器实例。

#### `validate(mermaidText: string): Promise<boolean>`
验证 Mermaid 语法是否正确。

#### `parse(mermaidText: string): Promise<ParseResult>`
解析 Mermaid 文本。

**返回类型：**
```typescript
interface ParseResult {
    nodes: MermaidNode[];
    edges: MermaidEdge[];
    subgraphs: MermaidSubgraph[];
}
```

#### `parseWithMetadata(mermaidText: string): Promise<Object>`
解析并返回元数据。

**返回值：**
```typescript
{
    result: ParseResult,
    metadata: {
        nodeCount: number,
        edgeCount: number,
        subgraphCount: number,
        maxSubgraphDepth: number
    }
}
```

#### `exportToKnowledgeGraph(result: ParseResult): Object`
导出为知识图谱格式。

**返回值：**
```typescript
{
    entities: Array<{
        id: string,
        name: string,
        type: string,
        properties: Object
    }>,
    relations: Array<{
        id: string,
        source: string,
        target: string,
        type: string,
        properties: Object
    }>,
    groups: Array<{
        id: string,
        name: string,
        members: string[],
        level: number,
        parent: string | null
    }>
}
```

#### `getTopLevelNodes(result: ParseResult): MermaidNode[]`
获取不属于任何子图的顶层节点。

#### `getSubgraphDescendants(subgraphId: string, result: ParseResult): MermaidNode[]`
递归获取子图的所有后代节点（展开所有嵌套子图）。

## 类型定义

### NodeShape
```typescript
type NodeShape =
    | 'rect'           // 矩形
    | 'round'          // 圆角矩形
    | 'stadium'        // 体育场型
    | 'subroutine'     // 子程序
    | 'cylinder'       // 圆柱体（数据库）
    | 'circle'         // 圆形
    | 'asymmetric'     // 不对称
    | 'diamond'        // 菱形（决策）
    | 'hexagon'        // 六边形
    | 'parallelogram'  // 平行四边形
    | 'trapezoid';     // 梯形
```

### EdgeType
```typescript
type EdgeType =
    | 'arrow_point'    // 实线箭头
    | 'arrow_open'     // 开放链接
    | 'arrow_circle'   // 圆形端点
    | 'arrow_cross'    // 叉形端点
    | 'dotted'         // 虚线
    | 'thick';         // 粗线
```

### Direction
```typescript
type Direction =
    | 'TB' | 'TD'  // 从上到下
    | 'BT'         // 从下到上
    | 'LR'         // 从左到右
    | 'RL';        // 从右到左
```

## 集成到知识图谱编辑器

### 方案一：直接使用基础解析器

```javascript
import { parseAndFormat } from './basic-parser.js';

async function importMermaid(mermaidText) {
    const result = await parseAndFormat(mermaidText);

    if (result.success) {
        // 转换为你的图数据格式
        const graphData = {
            nodes: result.data.nodes.map(node => ({
                id: node.id,
                label: node.label,
                // ... 其他属性
            })),
            edges: result.data.edges.map(edge => ({
                source: edge.source,
                target: edge.target,
                // ... 其他属性
            }))
        };

        return graphData;
    }
}
```

### 方案二：使用 TypeScript 类

```typescript
import MermaidFlowchartParser from './mermaid-parser-class';

const parser = new MermaidFlowchartParser();

async function importMermaidToKG(mermaidText: string) {
    const { result } = await parser.parseWithMetadata(mermaidText);

    // 直接使用导出功能
    const kg = parser.exportToKnowledgeGraph(result);

    return kg;
}
```

### 方案三：自定义转换

```typescript
async function customImport(mermaidText: string) {
    const parser = new MermaidFlowchartParser();
    const { result } = await parser.parseWithMetadata(mermaidText);

    // 自定义节点转换
    const nodes = result.nodes.map(node => ({
        id: node.id,
        data: {
            label: node.label,
            shape: node.shape,
            // 添加自定义属性
            color: getColorByShape(node.shape),
            size: getSizeByShape(node.shape)
        }
    }));

    // 自定义边转换
    const edges = result.edges.map(edge => ({
        source: edge.source,
        target: edge.target,
        data: {
            label: edge.label,
            // 添加自定义属性
            animated: edge.stroke === 'dotted',
            width: edge.strokeWidth
        }
    }));

    return { nodes, edges };
}
```

## 错误处理

```javascript
try {
    const result = await parseAndFormat(mermaidText);

    if (!result.success) {
        console.error('解析失败:', result.error);
        // 显示错误提示给用户
    }
} catch (error) {
    console.error('解析异常:', error);
    // 处理异常
}
```

## 性能优化建议

1. **缓存解析结果**：对于大型图表，缓存解析结果避免重复解析
2. **分批处理**：对于超大图表，考虑分批处理节点和边
3. **懒加载**：延迟加载子图内容
4. **Worker 线程**：在 Web Worker 中进行解析，避免阻塞主线程

```javascript
// 使用 Web Worker 示例
const worker = new Worker('parser-worker.js');

worker.postMessage({ type: 'parse', data: mermaidText });

worker.onmessage = (event) => {
    const result = event.data;
    // 处理解析结果
};
```

## 常见问题

### Q1: 解析失败怎么办？
A: 首先使用 `validate()` 方法验证语法，或在 [Mermaid Live Editor](https://mermaid.live/) 中测试。

### Q2: 如何处理深层嵌套的子图？
A: 使用 elk 渲染器：在 Mermaid 代码开头添加 `%%{init: {"flowchart": {"defaultRenderer": "elk"}} }%%`

### Q3: 如何获取节点的坐标信息？
A: 基础解析器不提供坐标，需要参考 Excalidraw 的混合方案，从渲染后的 SVG 中提取。

### Q4: 支持哪些 Mermaid 版本？
A: 建议使用 Mermaid 11.x 及以上版本，以支持所有新特性。

## 相关资源

- [Mermaid 官方文档](https://mermaid.js.org/)
- [Mermaid Live Editor](https://mermaid.live/)
- [完整研究报告](../Mermaid_研究报告.md)

## 许可证

MIT
