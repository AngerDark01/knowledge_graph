// 简单的状态管理测试用例
import { useGraphStore } from '@/stores/graph';
import { Node, BlockEnum } from '@/types/graph/models';

// 测试节点 CRUD 操作
export const testNodeOperations = () => {
  const { addNode, updateNode, deleteNode, getNodes, getNodeById } = useGraphStore.getState();
  
  console.log('初始节点数量:', getNodes().length);
  
  // 测试添加节点
  const newNode: Node = {
    id: 'test-node-1',
    type: BlockEnum.NODE,
    position: { x: 100, y: 100 },
    data: { 
      title: 'Test Node',
      content: 'This is a test node'
    },
    title: 'Test Node',
    content: 'This is a test node',
    groupId: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  addNode(newNode);
  console.log('添加节点后数量:', getNodes().length);
  console.log('获取测试节点:', getNodeById('test-node-1'));
  
  // 测试更新节点
  updateNode('test-node-1', { title: 'Updated Test Node' });
  console.log('更新后的节点:', getNodeById('test-node-1'));
  
  // 测试删除节点
  deleteNode('test-node-1');
  console.log('删除节点后数量:', getNodes().length);
  
  console.log('节点 CRUD 操作测试完成');
};

// 测试边 CRUD 操作
export const testEdgeOperations = () => {
  const { addEdge, updateEdge, deleteEdge, getEdges, getEdgeById } = useGraphStore.getState();
  
  console.log('初始边数量:', getEdges().length);
  
  // 测试添加边
  const newEdge = {
    id: 'test-edge-1',
    source: 'node-1',
    target: 'node-2',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  addEdge(newEdge);
  console.log('添加边后数量:', getEdges().length);
  console.log('获取测试边:', getEdgeById('test-edge-1'));
  
  // 测试更新边
  updateEdge('test-edge-1', { label: 'Test Label' });
  console.log('更新后的边:', getEdgeById('test-edge-1'));
  
  // 测试删除边
  deleteEdge('test-edge-1');
  console.log('删除边后数量:', getEdges().length);
  
  console.log('边 CRUD 操作测试完成');
};

// 运行测试
export const runAllTests = () => {
  console.log('开始运行状态管理测试...');
  testNodeOperations();
  testEdgeOperations();
  console.log('所有测试完成');
};