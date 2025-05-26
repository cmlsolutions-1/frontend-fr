import { create } from 'zustand';

interface UIState {
  isSideMenuOpen: boolean;
  openSideMenu: () => void;
  closeSideMenu: () => void;

}


export const useUIStore = create<UIState>()((set) => ({
  isSideMenuOpen: false,
  openSideMenu: () => set({ isSideMenuOpen: true }),
  closeSideMenu: () => set({ isSideMenuOpen: false }),
}));