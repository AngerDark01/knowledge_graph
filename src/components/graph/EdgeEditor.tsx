import React, { useState, useEffect } from 'react';
import { useGraphStore } from '@/stores/graph';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EdgeEditorProps {
  edgeId: string;
}

const EdgeEditor: React.FC<EdgeEditorProps> = ({ edgeId }) => {
  const { getEdgeById, updateEdge } = useGraphStore();
  const edge = getEdgeById(edgeId);
  
  const [label, setLabel] = useState(edge?.label || '');
  const [color, setColor] = useState<string>(edge?.data?.color || '#000000');
  const [strokeWidth, setStrokeWidth] = useState<string>(edge?.data?.strokeWidth?.toString() || '2');

  useEffect(() => {
    if (edge) {
      setLabel(edge.label || '');
      setColor(edge.data?.color || '#000000');
      setStrokeWidth(edge.data?.strokeWidth?.toString() || '2');
    }
  }, [edge]);

  if (!edge) {
    return <div className="text-gray-500">Select an edge to edit</div>;
  }

  const handleSave = () => {
    updateEdge(edgeId, {
      ...edge,
      label,
      data: {
        ...edge.data,
        color,
        strokeWidth: Number(strokeWidth),
      } as any // 临时修复类型问题，实际项目中应定义更精确的类型
    });
  };

  const handleReset = () => {
    if (edge) {
      setLabel(edge.label || '');
      setColor(edge.data?.color || '#000000');
      setStrokeWidth(edge.data?.strokeWidth?.toString() || '2');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Edge Editor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edge-label">Label</Label>
          <Input
            id="edge-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Enter edge label"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edge-color">Color</Label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              id="edge-color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 border border-gray-300 rounded"
            />
            <Input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="#000000"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="stroke-width">Stroke Width</Label>
          <Input
            id="stroke-width"
            type="number"
            min="1"
            max="10"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(e.target.value)}
            placeholder="2"
          />
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleSave}>Save</Button>
          <Button variant="outline" onClick={handleReset}>Reset</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EdgeEditor;