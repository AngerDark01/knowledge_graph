import { Node, Group, Edge, BlockEnum } from '@/types/graph/models';
import { MermaidParser } from './MermaidParser';
import { MermaidConverter } from './MermaidConverter';
import { useGraphStore } from '@/stores/graph';
import { useWorkspaceStore } from '@/stores/workspace';
import { LayoutManager } from '@/services/layout';
import { saveCurrentCanvasData } from '@/utils/workspace/canvasSync';

export class MermaidConverterService {
  private parser: MermaidParser;
  private converter: MermaidConverter;

  constructor() {
    this.parser = new MermaidParser();
    this.converter = new MermaidConverter();
  }

  async convertAndImport(mermaidCode: string, canvasName: string = 'Mermaid Import'): Promise<{
    success: boolean;
    nodes?: (Node | Group)[];
    edges?: Edge[];
    canvasId?: string;
    error?: string;
  }> {
    try {
      // 1. 解析Mermaid代码
      const parseResult = await this.parser.parse(mermaidCode);

      // 2. 转换Mermaid结果为项目数据模型
      const conversionResult = this.converter.convert(parseResult);

      // 3. 创建新画布
      const newCanvas = useWorkspaceStore.getState().createCanvas(canvasName);

      // 4. 切换到新画布
      useWorkspaceStore.getState().switchCanvas(newCanvas.id);

      // 5. 添加节点和边到graph store
      const graphState = useGraphStore.getState();

      // 按类型分别添加节点和群组
      conversionResult.nodes.forEach(node => {
        graphState.addNode(node);
      });

      conversionResult.groups.forEach(group => {
        graphState.addNode(group);
      });

      // 添加边到graph store
      console.log(`准备添加 ${conversionResult.edges.length} 条边到graph store.`);
      conversionResult.edges.forEach(edge => {
        console.log(`添加边: ${edge.source} -> ${edge.target} (ID: ${edge.id})`);
        graphState.addEdge(edge);
      });
      console.log(`已添加 ${conversionResult.edges.length} 条边，当前graph store中的边总数: ${graphState.getEdges().length}`);

      // 6. 应用全局布局
      const layoutManager = new LayoutManager();
      const layoutResult = await layoutManager.applyLayout([...conversionResult.nodes, ...conversionResult.groups], conversionResult.edges, { strategy: 'elk-layout' });

      // 如果布局成功，更新节点和边的位置
      if (layoutResult.success) {
        const { updateNodePosition, updateEdge } = useGraphStore.getState();

        // 更新节点位置
        layoutResult.nodes.forEach((newPosition, nodeId) => {
          if (newPosition) {
            updateNodePosition(nodeId, {
              x: newPosition.x,
              y: newPosition.y
            });
          }
        });

        // 更新边的信息
        layoutResult.edges.forEach((edgeData, edgeId) => {
          if (edgeData && (edgeData.sourceHandle || edgeData.targetHandle)) {
            const updates: any = {};
            if (edgeData.sourceHandle) updates.sourceHandle = edgeData.sourceHandle;
            if (edgeData.targetHandle) updates.targetHandle = edgeData.targetHandle;
            updateEdge(edgeId, updates);
          }
        });
      }

      // 7. 立即保存当前画布数据到workspaceStore
      saveCurrentCanvasData();

      // 8. 手动触发保存到后端
      await this.saveToBackend();

      console.log(`成功导入 ${conversionResult.nodes.length} 个节点、${conversionResult.groups.length} 个组和 ${conversionResult.edges.length} 条边`);
      return { 
        success: true, 
        nodes: [...conversionResult.nodes, ...conversionResult.groups], 
        edges: conversionResult.edges, 
        canvasId: newCanvas.id 
      };
    } catch (error) {
      console.error('Mermaid转换失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      return { success: false, error: errorMessage };
    }
  }

  private async saveToBackend() {
    // 通过API保存到后端
    try {
      const workspace = useWorkspaceStore.getState();
      const response = await fetch('/api/workspace/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            version: '1.0.0',
            workspace: {
              userId: workspace.user?.id || 'user_0',
              currentCanvasId: workspace.currentCanvasId,
              canvases: workspace.canvases,
              canvasTree: workspace.canvasTree,
            },
            timestamp: new Date(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`保存失败: ${response.statusText}`);
      }

      console.log('画布数据已保存到后端');
      return { success: true };
    } catch (error) {
      console.error('保存到后端失败:', error);
      throw error;
    }
  }
}