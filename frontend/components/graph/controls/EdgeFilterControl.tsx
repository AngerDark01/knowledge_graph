import React, { useState } from 'react';
import { useGraphStore } from '@/stores/graph';

const EdgeFilterControl: React.FC = () => {
  const { 
    getCrossGroupEdges, 
    getInternalGroupEdges, 
    filterEdges, 
    getEdges, 
    setVisibleEdgeIds,
    nodes
  } = useGraphStore();
  
  const [filterType, setFilterType] = useState<'all' | 'crossGroup' | 'internal' | 'custom'>('all');
  const [customFilter, setCustomFilter] = useState<string>('');
  
  // 应用过滤器
  const applyFilter = () => {
    let edgeIdsToDisplay: string[] = [];
    
    switch (filterType) {
      case 'crossGroup':
        edgeIdsToDisplay = getCrossGroupEdges().map(edge => edge.id);
        break;
      case 'internal':
        // 这里需要指定一个群组ID来获取内部边，我们暂时只获取第一个群组的内部边
        // 在实际应用中，用户可能需要选择特定的群组
        const groups = nodes.filter(n => n.type === 'group');
        if (groups.length > 0) {
          // 获取所有群组的内部边
          const internalEdges = [];
          for (const group of groups) {
            internalEdges.push(...getInternalGroupEdges(group.id));
          }
          edgeIdsToDisplay = internalEdges.map(edge => edge.id);
        } else {
          edgeIdsToDisplay = [];
        }
        break;
      case 'custom':
        // 对自定义过滤进行基本的解析
        try {
          // 简化版本，实际实现可能需要更复杂的过滤逻辑
          if (customFilter === 'weight>5') {
            edgeIdsToDisplay = filterEdges(edge => (edge.data?.weight || 0) > 5).map(edge => edge.id);
          } else if (customFilter === 'strength>5') {
            edgeIdsToDisplay = filterEdges(edge => (edge.data?.strength || 0) > 5).map(edge => edge.id);
          } else if (customFilter === 'dashed') {
            edgeIdsToDisplay = filterEdges(edge => (edge.data?.strokeDasharray || '') !== '').map(edge => edge.id);
          } else {
            edgeIdsToDisplay = getEdges().map(edge => edge.id);
          }
        } catch (e) {
          console.error('Invalid filter expression:', e);
          edgeIdsToDisplay = getEdges().map(edge => edge.id);
        }
        break;
      default:
        edgeIdsToDisplay = getEdges().map(edge => edge.id);
    }
    
    // 设置可见的边ID
    setVisibleEdgeIds(edgeIdsToDisplay);
  };

  const handleApplyFilter = () => {
    applyFilter();
  };

  return (
    <div className="p-4 border-b border-gray-200">
      <h3 className="text-md font-semibold mb-3">边过滤</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">过滤类型</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="w-full p-2 border border-gray-300 rounded text-sm"
          >
            <option value="all">全部</option>
            <option value="crossGroup">跨群关系</option>
            <option value="internal">群内关系</option>
            <option value="custom">自定义</option>
          </select>
        </div>

        {filterType === 'custom' && (
          <div>
            <label className="block text-xs text-gray-600 mb-1">自定义过滤表达式</label>
            <input
              type="text"
              value={customFilter}
              onChange={(e) => setCustomFilter(e.target.value)}
              placeholder="例如: weight>5, strength>5, dashed"
              className="w-full p-2 border border-gray-300 rounded text-sm"
            />
          </div>
        )}

        <button
          onClick={handleApplyFilter}
          className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          应用过滤
        </button>
      </div>
    </div>
  );
};

export default EdgeFilterControl;