import React, { useState, useEffect } from 'react';
import { useGraphStore } from '@/stores/graph';
import { Edge } from '@/types/graph/models';

interface EdgeEditorProps {
  edgeId: string;
}

const EdgeEditor: React.FC<EdgeEditorProps> = ({ edgeId }) => {
  const { getEdgeById, updateEdge } = useGraphStore();
  const [edge, setEdge] = useState<Edge | null>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const currentEdge = getEdgeById(edgeId);
    if (currentEdge) {
      setEdge(currentEdge);
      setFormData({
        label: currentEdge.label || currentEdge.data?.customProperties?.relationship || '',
        color: currentEdge.data?.color || '#000000',
        strokeWidth: currentEdge.data?.strokeWidth || 1,
        strokeDasharray: currentEdge.data?.strokeDasharray || '',
        weight: currentEdge.data?.weight || 1,
        strength: currentEdge.data?.strength || 1,
        direction: currentEdge.data?.direction || 'unidirectional',
        customProperties: currentEdge.data?.customProperties || {}
      });
    }
  }, [edgeId, getEdgeById]);

  useEffect(() => {
    if (edge) {
      // 更新边数据
      updateEdge(edge.id, {
        ...edge,
        label: formData.label,
        data: {
          ...edge.data,
          color: formData.color,
          strokeWidth: formData.strokeWidth,
          strokeDasharray: formData.strokeDasharray,
          weight: formData.weight,
          strength: formData.strength,
          direction: formData.direction,
          customProperties: {
            ...edge.data?.customProperties,
            relationship: formData.label, // 将关系标签保存到customProperties中
            ...formData.customProperties
          }
        },
      });
    }
  }, [formData, edge, updateEdge]);

  if (!edge) {
    return <div className="text-gray-500 text-center py-10">Edge not found</div>;
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // 常见的颜色选项
  const colorOptions = [
    { label: '黑色', value: '#000000' },
    { label: '红色', value: '#FF0000' },
    { label: '绿色', value: '#00FF00' },
    { label: '蓝色', value: '#0000FF' },
    { label: '橙色', value: '#FFA500' },
    { label: '紫色', value: '#800080' },
    { label: '青色', value: '#00FFFF' },
  ];

  // 线宽选项
  const strokeWidthOptions = [1, 2, 3, 4, 5];

  // 虚线样式选项
  const strokeDasharrayOptions = [
    { label: '实线', value: '' },
    { label: '虚线', value: '5,5' },
    { label: '点线', value: '2,2' },
    { label: '长虚线', value: '10,5' },
  ];

  // 方向选项
  const directionOptions = [
    { label: '单向', value: 'unidirectional' },
    { label: '双向', value: 'bidirectional' },
    { label: '无向', value: 'undirected' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">边编辑器</h3>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">关系标签</label>
          <textarea
            value={formData.label}
            onChange={(e) => handleInputChange('label', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="输入关系标签，如: 是...的...、包含、属于等"
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">颜色</label>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                className={`w-8 h-8 rounded-full border-2 ${formData.color === color.value ? 'border-blue-500' : 'border-gray-300'}`}
                style={{ backgroundColor: color.value }}
                onClick={() => handleInputChange('color', color.value)}
                title={color.label}
              />
            ))}
            <input
              type="color"
              value={formData.color}
              onChange={(e) => handleInputChange('color', e.target.value)}
              className="w-10 h-8"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">线宽</label>
          <div className="flex flex-wrap gap-2">
            {strokeWidthOptions.map((width) => (
              <button
                key={width}
                className={`px-3 py-1 rounded border ${formData.strokeWidth === width ? 'bg-blue-500 text-white' : 'bg-white'}`}
                onClick={() => handleInputChange('strokeWidth', width)}
              >
                {width}px
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">线型</label>
          <div className="flex flex-wrap gap-2">
            {strokeDasharrayOptions.map((option) => (
              <button
                key={option.value}
                className={`px-3 py-1 rounded border ${formData.strokeDasharray === option.value ? 'bg-blue-500 text-white' : 'bg-white'}`}
                onClick={() => handleInputChange('strokeDasharray', option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">关系权重</label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={formData.weight}
            onChange={(e) => handleInputChange('weight', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-center text-sm">{formData.weight}</div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">关系强度</label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={formData.strength}
            onChange={(e) => handleInputChange('strength', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-center text-sm">{formData.strength}</div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">方向性</label>
          <div className="flex flex-wrap gap-2">
            {directionOptions.map((option) => (
              <button
                key={option.value}
                className={`px-3 py-1 rounded border ${formData.direction === option.value ? 'bg-blue-500 text-white' : 'bg-white'}`}
                onClick={() => handleInputChange('direction', option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">自定义属性</label>
          <textarea
            value={JSON.stringify(formData.customProperties || {}, null, 2)}
            onChange={(e) => {
              try {
                if (e.target.value.trim() === '') {
                  // 如果文本框为空，设置为空对象
                  handleInputChange('customProperties', {});
                } else {
                  const parsed = JSON.parse(e.target.value);
                  handleInputChange('customProperties', parsed);
                }
              } catch (error) {
                // 如果JSON格式不正确，不更新值，但显示错误提示
                console.log("Invalid JSON format for custom properties, keeping previous value:", error);
                // 这里可以选择显示一个错误信息给用户
              }
            }}
            className="w-full p-2 border border-gray-300 rounded text-xs font-mono"
            placeholder="输入JSON格式的自定义属性"
            rows={4}
          />
        </div>
      </div>
    </div>
  );
};

export default EdgeEditor;