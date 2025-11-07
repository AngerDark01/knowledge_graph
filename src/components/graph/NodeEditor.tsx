import React, { useState, useEffect, useCallback } from 'react';
import { useGraphStore } from '@/stores/graph';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Node, Group } from '@/types/graph/models';
import StructuredAttributeEditor from './StructuredAttributeEditor';
import { validateNodeContent } from '@/utils/validation';

interface NodeEditorProps {
  nodeId: string;
}

const NodeEditor: React.FC<NodeEditorProps> = ({ nodeId }) => {
  const { getNodeById, getNodes, updateNode, addChildToParent, removeChildFromParent } = useGraphStore();
  const node = getNodeById(nodeId) as Node | undefined;
  const nodes = getNodes();

  const [title, setTitle] = useState(node?.title || '');
  const [content, setContent] = useState(node?.content || '');
  const [parentId, setParentId] = useState(node?.parentId || ''); // 新架构：使用 parentId
  const [summary, setSummary] = useState(node?.summary || '');
  const [tags, setTags] = useState(node?.tags?.join(', ') || '');
  const [attributes, setAttributes] = useState(node?.attributes || {});

  // 获取所有容器节点（群组）
  const groups = nodes.filter((n: any): n is Group => n.viewMode === 'container'); // 新架构：使用 viewMode

  useEffect(() => {
    if (node) {
      setTitle(node.title || '');
      setContent(node.content || '');
      setParentId(node.parentId || ''); // 新架构：使用 parentId
      setSummary(node.summary || '');
      setTags(node.tags?.join(', ') || '');
      setAttributes(node.attributes || {});
    }
  }, [node]);

  if (!node) {
    return <div className="text-gray-500">Select a node to edit</div>;
  }

  const handleSave = useCallback(() => {
    const tagsList = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    const nodeToUpdate = {
      ...node,
      title,
      content,
      summary,
      tags: tagsList,
      attributes,
    };

    const validation = validateNodeContent(nodeToUpdate);

    if (!validation.isValid) {
      alert(`验证错误: ${validation.errors.join(', ')}`);
      return;
    }

    // 更新节点内容
    updateNode(nodeId, {
      ...nodeToUpdate,
      validationError: undefined, // 清除之前的验证错误
    });

    // 新架构：使用 addChildToParent 管理父子关系
    if (parentId && parentId !== node.parentId) {
      addChildToParent(nodeId, parentId);
    } else if (!parentId && node.parentId) {
      removeChildFromParent(nodeId);
    }
  }, [node, title, content, summary, tags, attributes, parentId, nodeId, updateNode, addChildToParent, removeChildFromParent]);

  const handleReset = () => {
    if (node) {
      setTitle(node.title || '');
      setContent(node.content || '');
      setParentId(node.parentId || ''); // 新架构：使用 parentId
      setSummary(node.summary || '');
      setTags(node.tags?.join(', ') || '');
      setAttributes(node.attributes || {});
    }
  };

  const handleRemoveFromGroup = () => {
    // 新架构：使用 removeChildFromParent
    removeChildFromParent(nodeId);
    setParentId(''); // 更新本地状态
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
          <Label htmlFor="node-summary">Summary</Label>
          <Textarea
            id="node-summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Enter node summary"
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="node-tags">Tags (comma separated)</Label>
          <Input
            id="node-tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tag1, tag2, tag3"
          />
        </div>
        <div className="space-y-2">
          <Label>Attributes</Label>
          <StructuredAttributeEditor
            attributes={attributes}
            onChange={setAttributes}
          />
        </div>
        <div className="space-y-2">
          <Label>Parent Container</Label>
          <Select value={parentId} onValueChange={setParentId}>
            <SelectTrigger id="node-parent">
              <SelectValue placeholder="Select a parent container" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group: Group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.data?.title || group.title || group.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {node.parentId && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={handleRemoveFromGroup}
            >
              Remove from Parent
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

export default React.memo(NodeEditor);