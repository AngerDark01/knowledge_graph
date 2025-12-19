// 简单测试文件，验证Mermaid解析功能
import { MermaidParser } from './services/mermaid/MermaidParser';

// 创建一个测试用例
const testMermaidCode = `
graph TD
    A[用户] --> B[订单]
    B --> C[支付]
    C --> D[发货]
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

  console.log('Mermaid解析测试完成');
}

runTest().catch(console.error);