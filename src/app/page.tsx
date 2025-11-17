'use client';

import { useEffect } from 'react';
import GraphPage from '@/components/graph/core';
import generateTestData from '@/utils/tempDataGenerator';

export default function Home() {
  useEffect(() => {
    // 在客户端渲染时生成临时数据
    // 检查store是否已经有数据，避免重复生成
    const { getNodes, getEdges } = require('@/stores/graph').useGraphStore.getState();
    if (getNodes().length === 0 && getEdges().length === 0) {
      console.log('🔍 Store为空，生成临时数据...');
      generateTestData();
    } else {
      console.log('📊 Store已有数据，跳过临时数据生成');
    }
  }, []);

  return (
    <div className="flex flex-col h-screen w-full">
      <header className="bg-gray-100 dark:bg-gray-800 p-4 border-b">
        <h1 className="text-xl font-bold">Knowledge Graph Editor</h1>
      </header>
      <main className="flex-1">
        <GraphPage />
      </main>
    </div>
  );
}