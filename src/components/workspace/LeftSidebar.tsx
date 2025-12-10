'use client';

import React from 'react';
import { useWorkspaceStore } from '@/stores/workspace';
import UserProfile from './UserProfile';
import CanvasTree from './CanvasTree';

const LeftSidebar: React.FC = () => {
  const { user } = useWorkspaceStore();

  return (
    <div className="flex flex-col h-full">
      {/* 用户信息区域 */}
      <div className="p-4 border-b border-border">
        <UserProfile user={user} />
      </div>

      {/* 画布树区域 */}
      <div className="flex-1 overflow-y-auto p-2">
        <CanvasTree />
      </div>
    </div>
  );
};

export default LeftSidebar;