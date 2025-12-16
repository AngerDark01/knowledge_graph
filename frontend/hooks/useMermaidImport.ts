/**
 * Mermaid导入Hook
 *
 * 串联解析、转换、布局流程，并集成GraphStore
 */

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

    console.log('🚀 开始导入Mermaid...');
    console.log('输入文本长度:', mermaidText.length);

    try {
      // 步骤1: 解析Mermaid
      console.log('\n=== 步骤1: 解析Mermaid ===');
      const parser = new MermaidParser();
      const parseResult = await parser.parse(mermaidText);

      console.log('解析结果:', {
        节点数: parseResult.nodes.length,
        边数: parseResult.edges.length,
        子图数: parseResult.subgraphs.length,
        方向: parseResult.direction
      });

      // 步骤2: 转换数据模型
      console.log('\n=== 步骤2: 转换数据模型 ===');
      const converter = new MermaidConverter();
      const conversionResult = converter.convert(parseResult);

      console.log('转换结果:', {
        Node数: conversionResult.nodes.length,
        Group数: conversionResult.groups.length,
        Edge数: conversionResult.edges.length
      });

      // 步骤3: 应用布局
      console.log('\n=== 步骤3: 应用布局 ===');
      const layoutAdapter = new MermaidLayoutAdapter();
      const layoutResult = await layoutAdapter.applyLayout(
        conversionResult.nodes,
        conversionResult.groups,
        conversionResult.edges
      );

      console.log('布局结果:', {
        Node数: layoutResult.nodes.length,
        Group数: layoutResult.groups.length,
        Edge数: layoutResult.edges.length
      });

      // 步骤4: 添加到画布
      console.log('\n=== 步骤4: 添加到画布 ===');

      // 先添加所有Group（按层级顺序，父级先添加）
      const sortedGroups = [...layoutResult.groups].sort((a, b) => {
        // 计算层级：有groupId的层级更深
        const aLevel = a.groupId ? 1 : 0;
        const bLevel = b.groupId ? 1 : 0;
        return aLevel - bLevel;
      });

      for (const group of sortedGroups) {
        addNode(group);
        console.log(`  ✓ 添加Group: ${group.title}`);
      }

      // 再添加所有Node
      for (const node of layoutResult.nodes) {
        addNode(node);
        console.log(`  ✓ 添加Node: ${node.title}`);
      }

      // 最后添加所有Edge
      for (const edge of layoutResult.edges) {
        addEdge(edge);
        console.log(`  ✓ 添加Edge: ${edge.source} -> ${edge.target}`);
      }

      console.log('\n✅ Mermaid导入成功！');
      console.log(`总计: ${layoutResult.nodes.length + layoutResult.groups.length} 个节点, ${layoutResult.edges.length} 条边`);

      return {
        success: true,
        nodeCount: layoutResult.nodes.length,
        groupCount: layoutResult.groups.length,
        edgeCount: layoutResult.edges.length
      };
    } catch (err: any) {
      console.error('\n❌ Mermaid导入失败:', err);
      setError(err.message || '导入失败，请检查Mermaid语法');
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
