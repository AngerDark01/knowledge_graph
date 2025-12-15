'use client';

import React from 'react';
import { ReactFlowProvider } from 'reactflow';

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers = ({ children }: ProvidersProps) => {
  return <ReactFlowProvider>{children}</ReactFlowProvider>;
};

export default Providers;