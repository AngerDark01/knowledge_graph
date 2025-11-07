# 📖 迁移指南

## 🎯 目标

本指南将帮助你从旧的 `Node`/`Group` 架构平滑迁移到新的优雅架构（统一 `BaseNode` 模型）。

---

## 📋 迁移概览

### **迁移策略：渐进式迁移**

我们采用渐进式迁移策略，确保在迁移过程中系统始终可用：

```
Phase 1: 准备阶段
  ├─ ✅ 新架构文件已创建
  ├─ ✅ 兼容层已就绪
  └─ ✅ 新旧代码可以并存

Phase 2: 迁移阶段 (当前)
  ├─ 🔄 更新 ReactFlow 节点类型注册
  ├─ 🔄 更新页面组件
  └─ 🔄 测试功能

Phase 3: 完成阶段
  ├─ 清理旧代码
  ├─ 移除适配器层
  └─ 性能优化
```

---

## 🚀 快速开始

### **Step 1: 更新依赖**

确保安装了必要的依赖：

```bash
npm install nanoid
# 或
pnpm install nanoid
```

### **Step 2: 更新 ReactFlow 节点类型**

在主要的 GraphPage 组件中注册新的智能节点：

```typescript
// src/components/graph/graph-page/GraphPageContent.tsx

import SmartNode from '../node';  // 导入智能节点路由器

// 节点类型映射
const nodeTypes = useMemo(() => ({
  // 新架构：统一使用 SmartNode
  node: SmartNode,
  group: SmartNode,  // Group 也使用 SmartNode

  // 或者保持向后兼容（两种方式并存）
  // node: NoteNode,   // 旧组件
  // group: GroupNode, // 旧组件
  // smart: SmartNode, // 新组件
}), []);
```

### **Step 3: 使用新 API**

在组件中使用新的 API：

```typescript
import { useGraphStore } from '@/stores/graph';

const MyComponent = () => {
  // 新的 API
  const {
    convertToNote,
    convertToContainer,
    toggleNodeExpanded,
    addChildToParent,
    getChildNodes,
  } = useGraphStore();

  // 使用新 API
  const handleConvert = () => {
    convertToContainer(nodeId);
  };

  return (
    <button onClick={handleConvert}>
      Convert to Container
    </button>
  );
};
```

---

## 🔄 API 迁移对照表

### **1. 创建节点**

```typescript
// ❌ 旧代码
const node = {
  id: nanoid(),
  type: BlockEnum.NODE,
  position: { x: 100, y: 100 },
  title: 'My Node',
  content: 'Content',
  isExpanded: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};
addNode(node);

// ✅ 新代码
import { createNode } from '@/utils/graph/nodeFactory';

const node = createNode({
  position: { x: 100, y: 100 },
  title: 'My Node',
  content: 'Content',
  viewMode: 'note',
});
addNode(node); // addNode 仍然可用（兼容层）
```

### **2. 节点类型转换**

```typescript
// ❌ 旧代码 (不存在，需要复杂实现)
const convertNodeToGroup = (nodeId) => {
  const node = getNodeById(nodeId);
  // 复杂的转换逻辑...
  deleteNode(nodeId);
  addGroup(newGroup);
};

// ✅ 新代码
convertToContainer(nodeId);  // 一行搞定！
```

### **3. 展开/折叠**

```typescript
// ❌ 旧代码
updateNode(nodeId, { isExpanded: true });      // Note
updateNode(groupId, { collapsed: false });     // Group

// ✅ 新代码（统一接口）
expandNode(nodeId);      // 展开任意节点
collapseNode(nodeId);    // 折叠任意节点
toggleNodeExpanded(nodeId);  // 切换
```

### **4. 父子关系**

```typescript
// ❌ 旧代码
addNodeToGroup(nodeId, groupId);
removeNodeFromGroup(nodeId);

// ✅ 新代码（更通用）
addChildToParent(childId, parentId);
removeChildFromParent(childId);
```

### **5. 查询子节点**

```typescript
// ❌ 旧代码
const group = getNodeById(groupId) as Group;
const childrenIds = group.nodeIds || [];
const children = nodes.filter(n => childrenIds.includes(n.id));

// ✅ 新代码
const children = getChildNodes(parentId);
```

### **6. 查询父节点**

```typescript
// ❌ 旧代码
const node = getNodeById(nodeId);
const parentId = node.groupId || node.parentId;
const parent = parentId ? getNodeById(parentId) : undefined;

// ✅ 新代码
const parent = getParentNode(nodeId);
```

---

## 📦 组件迁移

### **迁移 NoteNode 组件**

如果你自定义了 NoteNode 组件，可以这样迁移：

```typescript
// ❌ 旧代码
import NoteNode from '@/components/graph/node/NoteNode';

const MyCustomNoteNode = ({ id, data, selected }) => {
  // 自定义逻辑...
  return <NoteNode id={id} data={data} selected={selected} />;
};

// ✅ 新代码
import SmartNode from '@/components/graph/node';
import { useGraphStore } from '@/stores/graph';
import { toBaseNode } from '@/utils/graph/nodeAdapter';

const MyCustomNoteNode = ({ id, data, selected }) => {
  const { getNodeById } = useGraphStore();
  const node = getNodeById(id);
  const baseNode = toBaseNode(node);

  // 自定义逻辑...
  return <SmartNode id={id} data={data} selected={selected} />;
};
```

### **迁移 GroupNode 组件**

```typescript
// ❌ 旧代码
import GroupNode from '@/components/graph/node/GroupNode';

// ✅ 新代码
import SmartNode from '@/components/graph/node';
// SmartNode 自动处理 Group 类型
```

---

## 🔍 测试清单

在迁移后，请测试以下功能：

### **基础功能**
- [ ] 创建 Note 节点
- [ ] 创建 Container 节点
- [ ] 编辑节点标题
- [ ] 编辑节点内容
- [ ] 删除节点

### **视图模式转换**
- [ ] Note → Container 转换
- [ ] Container → Note 转换
- [ ] 转换后内容保持
- [ ] 转换后位置保持
- [ ] 转换后样式正确

### **展开/折叠**
- [ ] Note 节点展开/折叠
- [ ] Container 节点展开/折叠
- [ ] 子节点显示/隐藏
- [ ] 尺寸自动调整

### **层级关系**
- [ ] 添加子节点
- [ ] 移除子节点
- [ ] 子节点位置约束
- [ ] 父节点移动时子节点跟随
- [ ] 防止循环引用

### **性能**
- [ ] 大量节点时性能
- [ ] 频繁切换时性能
- [ ] 内存占用

---

## ⚠️ 常见问题

### **Q1: 迁移后旧数据怎么办？**

**A:** 兼容层会自动处理旧数据。旧的 `Node` 和 `Group` 数据在读取时会自动转换为 `BaseNode`。

```typescript
// 自动转换
const baseNode = toBaseNode(oldNode);  // Node → BaseNode
const baseNode = toBaseNode(oldGroup); // Group → BaseNode
```

### **Q2: 可以混用新旧 API 吗？**

**A:** 可以！新旧 API 可以并存：

```typescript
// 旧 API 仍然可用
addNode(node);
updateNode(id, updates);

// 新 API 也可用
convertToContainer(id);
expandNode(id);
```

### **Q3: 需要修改数据库 schema 吗？**

**A:** 不需要立即修改。可以在保存时转换：

```typescript
// 保存到数据库时转换为旧格式
const oldNode = fromBaseNode(baseNode);
await saveToDatabase(oldNode);

// 从数据库读取时转换为新格式
const oldNode = await loadFromDatabase(id);
const baseNode = toBaseNode(oldNode);
```

### **Q4: 迁移会影响性能吗？**

**A:** 不会。新架构实际上更高效：
- ✅ 减少了代码量
- ✅ 减少了不必要的重渲染
- ✅ 优化了状态管理

### **Q5: 如果遇到问题怎么办？**

**A:** 可以回退到旧组件：

```typescript
// 暂时回退
const nodeTypes = {
  node: NoteNode,    // 使用旧组件
  group: GroupNode,  // 使用旧组件
};
```

---

## 🎯 迁移步骤详解

### **第一步：备份代码**

```bash
git checkout -b migration/elegant-architecture
git add .
git commit -m "Backup before migration"
```

### **第二步：更新导入**

在主页面组件中更新导入：

```typescript
// src/components/graph/graph-page/GraphPageContent.tsx

// 添加新的导入
import SmartNode from '../node';
import { useGraphStore } from '@/stores/graph';
```

### **第三步：注册新节点类型**

```typescript
const nodeTypes = useMemo(() => ({
  node: SmartNode,
  group: SmartNode,
}), []);
```

### **第四步：测试基础功能**

运行开发服务器并测试：

```bash
npm run dev
```

测试：
1. 创建节点
2. 编辑节点
3. 删除节点
4. 移动节点

### **第五步：测试新功能**

在 UI 中测试：
1. 点击转换按钮 (📁 或 📝 图标)
2. 验证视图模式切换
3. 验证内容保持
4. 验证子节点处理

### **第六步：处理边界情况**

测试边界情况：
1. 大量节点时的性能
2. 深层嵌套的节点
3. 空节点的处理
4. 错误数据的处理

### **第七步：提交代码**

```bash
git add .
git commit -m "feat: migrate to elegant architecture"
git push origin migration/elegant-architecture
```

---

## 📚 参考资料

- [优雅架构设计文档](./ELEGANT_ARCHITECTURE.md)
- [API 文档](./API_REFERENCE.md)
- [示例代码](./examples/)

---

## ✅ 迁移完成检查表

完成迁移后，确保以下项目都已完成：

### **代码层面**
- [ ] 所有新文件已创建
- [ ] ReactFlow 节点类型已更新
- [ ] 主页面组件已更新
- [ ] 测试通过

### **功能层面**
- [ ] 节点创建正常
- [ ] 节点编辑正常
- [ ] 视图模式转换正常
- [ ] 展开/折叠正常
- [ ] 层级关系正常

### **文档层面**
- [ ] 阅读架构文档
- [ ] 理解新 API
- [ ] 了解迁移策略

### **团队层面**
- [ ] 团队成员已知晓变更
- [ ] 代码已审查
- [ ] 文档已更新

---

## 🎉 恭喜！

如果你已完成上述所有步骤，恭喜你成功迁移到新的优雅架构！

现在你可以享受：
- ✨ 更简洁的代码
- ✨ 更强大的功能
- ✨ 更好的开发体验

有任何问题，请参考 [优雅架构设计文档](./ELEGANT_ARCHITECTURE.md)。
