import { StateCreator } from 'zustand';
import { User, DEFAULT_USER } from '@/types/workspace/models';

export interface UserSlice {
  user: User;
  setUser: (user: User) => void;
}

export const createUserSlice: StateCreator<UserSlice> = (set) => ({
  user: DEFAULT_USER,
  setUser: (user) => set({ user }),
});
