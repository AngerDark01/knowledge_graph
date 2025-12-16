/**
 * Mermaid布局适配器
 *
 * 调用ELK布局算法，计算导入节点的位置
 */

import { LayoutManager } from '@/services/layout/LayoutManager';
import { Node, Group, Edge, BlockEnum } from '@/types/graph/models';
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
      console.log('📐 开始应用ELK布局...');

      // 合并节点和群组
      const allNodes = [...nodes, ...groups];

      console.log(`  输入: ${nodes.length} 个节点, ${groups.length} 个群组, ${edges.length} 条边`);

      // 使用ELK算法进行全局布局
      const layoutResult = await this.layoutManager.applyLayout(
        allNodes,
        edges,
        {
          strategy: 'elk',  // 使用ELK算法
          layoutScope: 'canvas'
        }
      );

      console.log('  ✓ ELK布局计算完成');

      // 应用布局结果到节点
      const layoutedNodes: Node[] = [];
      const layoutedGroups: Group[] = [];

      for (const entity of allNodes) {
        const position = layoutResult.nodes.get(entity.id);

        if (position) {
          const layoutedEntity = {
            ...entity,
            position: {
              x: position.x,
              y: position.y
            }
          };

          if (entity.type === BlockEnum.GROUP) {
            layoutedGroups.push(layoutedEntity as Group);
          } else {
            layoutedNodes.push(layoutedEntity as Node);
          }
        } else {
          // 如果没有布局信息，保持原位置
          if (entity.type === BlockEnum.GROUP) {
            layoutedGroups.push(entity as Group);
          } else {
            layoutedNodes.push(entity as Node);
          }
        }
      }

      console.log('✅ 布局应用完成');
      console.log(`  输出: ${layoutedNodes.length} 个节点, ${layoutedGroups.length} 个群组`);

      return {
        nodes: layoutedNodes,
        groups: layoutedGroups,
        edges
      };
    } catch (error: any) {
      console.error('❌ 布局失败:', error);
      console.warn('⚠ 使用默认位置（未布局）');

      // 如果布局失败，使用简单的网格布局作为后备
      return this.applyFallbackLayout(nodes, groups, edges);
    }
  }

  /**
   * 后备布局方案（简单网格布局）
   */
  private applyFallbackLayout(
    nodes: Node[],
    groups: Group[],
    edges: Edge[]
  ): LayoutResult {
    console.log('📐 应用后备网格布局...');

    const spacing = 400;
    const cols = Math.ceil(Math.sqrt(nodes.length + groups.length));

    let index = 0;

    // 布局群组
    const layoutedGroups = groups.map(group => {
      const col = index % cols;
      const row = Math.floor(index / cols);

      index++;

      return {
        ...group,
        position: {
          x: col * spacing,
          y: row * spacing
        }
      };
    });

    // 布局节点
    const layoutedNodes = nodes.map(node => {
      // 如果节点属于群组，放在群组内部
      if (node.groupId) {
        const ownerGroup = layoutedGroups.find(g => g.id === node.groupId);
        if (ownerGroup) {
          return {
            ...node,
            position: {
              x: ownerGroup.position.x + 50,
              y: ownerGroup.position.y + 80
            }
          };
        }
      }

      // 否则使用网格布局
      const col = index % cols;
      const row = Math.floor(index / cols);

      index++;

      return {
        ...node,
        position: {
          x: col * spacing,
          y: row * spacing
        }
      };
    });

    console.log('✅ 后备布局完成');

    return {
      nodes: layoutedNodes,
      groups: layoutedGroups,
      edges
    };
  }
}
