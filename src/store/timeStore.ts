import { create } from 'zustand';

interface TimeState {
  time: number;
  updateTime: (delta: number) => void;
}

export const useTimeStore = create<TimeState>((set) => ({
  time: 0,
  updateTime: (delta) => set((state) => ({ time: state.time + delta })),
}));