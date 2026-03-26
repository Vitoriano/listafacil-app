import { create } from 'zustand';

interface UserStoreState {
  isEditing: boolean;
  editName: string;
  editEmail: string;
  setIsEditing: (isEditing: boolean) => void;
  setEditName: (name: string) => void;
  setEditEmail: (email: string) => void;
  reset: () => void;
}

export const useUserStore = create<UserStoreState>((set) => ({
  isEditing: false,
  editName: '',
  editEmail: '',
  setIsEditing: (isEditing) => set({ isEditing }),
  setEditName: (name) => set({ editName: name }),
  setEditEmail: (email) => set({ editEmail: email }),
  reset: () => set({ isEditing: false, editName: '', editEmail: '' }),
}));
