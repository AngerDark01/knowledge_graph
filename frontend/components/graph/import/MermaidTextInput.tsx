/**
 * Mermaid文本输入组件
 */

'use client';

import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface MermaidTextInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const MermaidTextInput: React.FC<MermaidTextInputProps> = ({
  value,
  onChange
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Mermaid Flowchart代码</label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`flowchart TD
    A[开始] --> B{判断}
    B -->|是| C[处理]
    B -->|否| D[结束]

    subgraph 子系统
        C --> E[步骤1]
        E --> F[步骤2]
    end`}
        className="font-mono text-sm min-h-[300px] resize-y"
        spellCheck={false}
      />
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>支持Mermaid Flowchart语法，包括节点、边和子图</span>
        <span>{value.length} 字符</span>
      </div>
    </div>
  );
};
