// 测试脚本：验证Mermaid解析器是否能正确解析节点和边
import { MermaidParser } from './services/mermaid/MermaidParser';

// 测试用例1：基本的节点和边
const testMermaidCode = `
graph TD
    A["用户"] --> B["订单"]
    B --> C["支付"]
`;

console.log('测试Mermaid解析功能...');

async function runTest() {
  const parser = new MermaidParser();
  const result = await parser.parse(testMermaidCode);

  console.log('解析结果:');
  console.log(`节点数量: ${result.nodes.length}`);
  console.log(`边数量: ${result.edges.length}`);

  result.nodes.forEach((node, index) => {
    console.log(`节点 ${index + 1}: ${node.label} (ID: ${node.id}, 形状: ${node.shape})`);
  });

  result.edges.forEach((edge, index) => {
    console.log(`边 ${index + 1}: ${edge.source} -> ${edge.target} (标签: "${edge.label}")`);
  });
}

runTest().catch(console.error);

// 测试用例2：复杂的Mermaid（来自您的文件）
const complexMermaid = `
graph TB
    %% 样式定义
    classDef storyClass fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    classDef worldClass fill:#fff3e0,stroke:#e65100,stroke-width:2px

    %% Writer 节点
    Writer[Writer 执行节点\`<br/>\`可以是人或AI]

    %% 故事域
    subgraph Story["🎭 故事 Story"]
        Theme[主题]
        CoreTheme[核心主题]
    end

    %% 世界观域
    subgraph World["🌍 世界观 World"]
        Environment[环境]
        Geography[地理]
    end

    %% 关系
    Writer --> Theme
    Theme --> CoreTheme
    Environment --> Geography
    Writer --> Environment
`;

async function runComplexTest() {
  console.log('\n测试复杂Mermaid解析功能...');
  const complexParser = new MermaidParser();
  const complexResult = await complexParser.parse(complexMermaid);

  console.log('复杂解析结果:');
  console.log(`节点数量: ${complexResult.nodes.length}`);
  console.log(`边数量: ${complexResult.edges.length}`);

  complexResult.nodes.forEach((node, index) => {
    console.log(`节点 ${index + 1}: ${node.label} (ID: ${node.id}, 形状: ${node.shape})`);
  });

  complexResult.edges.forEach((edge, index) => {
    console.log(`边 ${index + 1}: ${edge.source} -> ${edge.target} (标签: "${edge.label}")`);
  });

  console.log('复杂Mermaid解析测试完成');
}

runComplexTest().catch(console.error);

console.log('Mermaid解析测试完成');