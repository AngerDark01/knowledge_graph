import React from 'react';
import { Node } from '@/types/graph/models';

interface SummaryViewProps {
  node: Node;
  maxLength?: number;
}

const SummaryView: React.FC<SummaryViewProps> = ({ node, maxLength = 100 }) => {
  const getContentPreview = () => {
    if (node.summary) {
      return node.summary;
    }
    
    if (node.content) {
      return node.content.length > maxLength 
        ? node.content.substring(0, maxLength) + '...' 
        : node.content;
    }
    
    return '无内容';
  };

  return (
    <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
      <div className="text-xs font-semibold text-gray-500 uppercase mb-1">摘要</div>
      <div className="text-sm text-gray-700">
        {getContentPreview()}
      </div>
    </div>
  );
};

export default SummaryView;