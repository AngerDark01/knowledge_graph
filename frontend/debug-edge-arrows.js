// 诊断脚本：检查边的箭头问题
// 在浏览器 Console 中执行

console.log('========== 边数据诊断 ==========');

// 1. 检查边的数据
const store = useGraphStore.getState();
const edges = store.getEdges();

console.log(`总边数: ${edges.length}`);

// 2. 检查direction字段
const directionStats = edges.reduce((acc, e) => {
  const dir = e.data?.direction || 'undefined';
  acc[dir] = (acc[dir] || 0) + 1;
  return acc;
}, {});

console.log('Direction统计:', directionStats);

// 3. 检查markerEnd
const markerStats = edges.reduce((acc, e) => {
  const hasMarker = !!e.markerEnd;
  acc[hasMarker ? 'hasMarker' : 'noMarker'] = (acc[hasMarker ? 'hasMarker' : 'noMarker'] || 0) + 1;
  return acc;
}, {});

console.log('MarkerEnd统计:', markerStats);

// 4. 详细列出前5条边
console.log('\n前5条边的详细信息:');
edges.slice(0, 5).forEach((e, i) => {
  console.log(`边 ${i + 1}:`, {
    id: e.id,
    type: e.type || 'default',
    direction: e.data?.direction,
    markerEnd: e.markerEnd,
    data: e.data
  });
});

// 5. 检查DOM中的SVG marker定义
console.log('\n========== DOM检查 ==========');
const svgDefs = document.querySelectorAll('svg defs marker');
console.log(`SVG中定义的marker数量: ${svgDefs.length}`);
svgDefs.forEach((marker, i) => {
  console.log(`Marker ${i + 1}:`, {
    id: marker.id,
    markerWidth: marker.getAttribute('markerWidth'),
    markerHeight: marker.getAttribute('markerHeight')
  });
});

// 6. 检查实际渲染的edge path（非交互层）
const edgePaths = document.querySelectorAll('.react-flow__edge-path');
console.log(`\n实际渲染的边路径数量: ${edgePaths.length}`);
if (edgePaths.length > 0) {
  console.log('第一条边的属性:', {
    markerEnd: edgePaths[0].getAttribute('marker-end'),
    markerStart: edgePaths[0].getAttribute('marker-start'),
    stroke: edgePaths[0].getAttribute('stroke'),
    strokeWidth: edgePaths[0].getAttribute('stroke-width')
  });
}

console.log('\n========== 诊断完成 ==========');
