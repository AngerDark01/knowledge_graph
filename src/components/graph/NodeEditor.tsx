import React, { useState, useEffect } from 'react';
import { useGraphStore } from '@/stores/graph';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface NodeEditorProps {
  nodeId: string;
}

const NodeEditor: React.FC<NodeEditorProps> = ({ nodeId }) => {
  const { getNodeById, updateNode } = useGraphStore();
  const node = getNodeById(nodeId);
  
  const [title, setTitle] = useState(node?.data?.title || '');
  const [content, setContent] = useState(node?.data?.content || '');

  useEffect(() => {
    if (node) {
      setTitle(node.data?.title || '');
      setContent(node.data?.content || '');
    }
  }, [node]);

  if (!node) {
    return <div className="text-gray-500">Select a node to edit</div>;
  }

  const handleSave = () => {
    updateNode(nodeId, {
      ...node,
      data: {
        ...node.data,
        title,
        content
      }
    });
  };

  const handleReset = () => {
    if (node) {
      setTitle(node.data?.title || '');
      setContent(node.data?.content || '');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Node Editor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="node-title">Title</Label>
          <Input
            id="node-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter node title"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="node-content">Content</Label>
          <Textarea
            id="node-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter node content"
            rows={4}
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

export default NodeEditor;