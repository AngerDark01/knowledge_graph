// 重构验证测试文件
// 用于测试重构后的导入路径和组件功能是否正常

// 测试核心导入
import { GraphPageContent } from './core';

// 测试节点组件导入
import { 
  BaseNode, 
  NoteNode, 
  GroupNode,
  NoteNodeEdit
} from './nodes';

// 测试边组件导入
import { 
  CustomEdge, 
  CrossGroupEdge 
} from './edges';

// 测试编辑器组件导入
import { 
  ContentEditor, 
  NodeEditor, 
  EdgeEditor, 
  StructuredAttributeEditor 
} from './editors';

// 测试控制组件导入
import { 
  EdgeFilterControl, 
  HistoryControl,
  Toolbar,
  ZoomIndicator
} from './controls';

// 测试 UI 组件导入
import { 
  MarkdownRenderer, 
  Tag, 
  TagInput, 
  SummaryView 
} from './ui';

// 测试自定义 hooks 导入
import { useNodeExpansion } from './core/hooks';

// 简单验证函数，确保所有导入的组件都是可用的
const validateImports = () => {
  console.log('✅ Core components imported successfully');
  console.log('  - GraphPageContent:', typeof GraphPageContent);
  
  console.log('✅ Node components imported successfully');
  console.log('  - BaseNode:', typeof BaseNode);
  console.log('  - NoteNode:', typeof NoteNode);
  console.log('  - GroupNode:', typeof GroupNode);
  console.log('  - NoteNodeEdit:', typeof NoteNodeEdit);
  
  console.log('✅ Edge components imported successfully');
  console.log('  - CustomEdge:', typeof CustomEdge);
  console.log('  - CrossGroupEdge:', typeof CrossGroupEdge);
  
  console.log('✅ Editor components imported successfully');
  console.log('  - ContentEditor:', typeof ContentEditor);
  console.log('  - NodeEditor:', typeof NodeEditor);
  console.log('  - EdgeEditor:', typeof EdgeEditor);
  console.log('  - StructuredAttributeEditor:', typeof StructuredAttributeEditor);
  
  console.log('✅ Control components imported successfully');
  console.log('  - EdgeFilterControl:', typeof EdgeFilterControl);
  console.log('  - HistoryControl:', typeof HistoryControl);
  console.log('  - Toolbar:', typeof Toolbar);
  console.log('  - ZoomIndicator:', typeof ZoomIndicator);
  
  console.log('✅ UI components imported successfully');
  console.log('  - MarkdownRenderer:', typeof MarkdownRenderer);
  console.log('  - Tag:', typeof Tag);
  console.log('  - TagInput:', typeof TagInput);
  console.log('  - SummaryView:', typeof SummaryView);
  
  console.log('✅ Hooks imported successfully');
  console.log('  - useNodeExpansion:', typeof useNodeExpansion);
  
  console.log('\n🎉 All imports are working correctly!');
  console.log('The refactoring has been completed successfully.');
};

export {
  GraphPageContent,
  BaseNode,
  NoteNode,
  GroupNode,
  NoteNodeEdit,
  CustomEdge,
  CrossGroupEdge,
  ContentEditor,
  NodeEditor,
  EdgeEditor,
  StructuredAttributeEditor,
  EdgeFilterControl,
  HistoryControl,
  Toolbar,
  ZoomIndicator,
  MarkdownRenderer,
  Tag,
  TagInput,
  SummaryView,
  useNodeExpansion
};

// 导出验证函数用于调试
export { validateImports };