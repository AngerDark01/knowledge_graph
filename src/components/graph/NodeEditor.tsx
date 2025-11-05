import React, { useState, useEffect } from 'react';
import { useGraphStore } from '@/stores/graph';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Group } from '@/types/graph/models';

interface NodeEditorProps {
  nodeId: string;
}

const NodeEditor: React.FC<NodeEditorProps> = ({ nodeId }) => {
  const { getNodeById, getNodes, updateNode } = useGraphStore();
  const node = getNodeById(nodeId);
  const nodes = getNodes();
  
  const [title, setTitle] = useState(node?.data?.title || '');
  const [content, setContent] = useState(node?.data?.content || '');
  const [groupId, setGroupId] = useState(node?.groupId || '');

  // 获取所有群组
  const groups = nodes.filter((n: any): n is Group => n.type === 'group');

  useEffect(() => {
    if (node) {
      setTitle(node.data?.title || '');
      setContent(node.data?.content || '');
      setGroupId(node.groupId || '');
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
      },
      groupId: groupId || undefined, // 如果groupId为空，则不设置
    });
  };

  const handleReset = () => {
    if (node) {
      setTitle(node.data?.title || '');
      setContent(node.data?.content || '');
      setGroupId(node.groupId || '');
    }
  };

  const handleRemoveFromGroup = () => {
    updateNode(nodeId, {
      groupId: undefined,
    });
    setGroupId(''); // 更新本地状态
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
        <div className="space-y-2">
          <Label>Group</Label>
          <Select value={groupId} onValueChange={setGroupId}>
            <SelectTrigger id="node-group">
              <SelectValue placeholder="Select a group" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group: Group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.data?.title || group.title || group.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {node.groupId && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 w-full"
              onClick={handleRemoveFromGroup}
            >
              Remove from Group
            </Button>
          )}
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