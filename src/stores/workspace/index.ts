import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { UserSlice, createUserSlice } from './userSlice';
import { CanvasSlice, createCanvasSlice } from './canvasSlice';

type WorkspaceStore = UserSlice & CanvasSlice;

export const useWorkspaceStore = create<WorkspaceStore>()(
  devtools(
    (...a) => ({
      ...createUserSlice(...a),
      ...createCanvasSlice(...a),
    }),
    { name: 'WorkspaceStore' }
  )
);
