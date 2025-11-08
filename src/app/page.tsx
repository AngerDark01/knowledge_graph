'use client';

import GraphPage from '@/components/graph/core';

export default function Home() {
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