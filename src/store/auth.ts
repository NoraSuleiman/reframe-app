import { create } from 'zustand';
import { authRepo } from '@/data';
import type { Profile } from '@/domain/types';

interface AuthState {
  profile: Profile | null;
  loading: boolean;
  initialised: boolean;
  init: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  magicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  profile: null,
  loading: false,
  initialised: false,
  init: async () => {
    const session = await authRepo.currentSession();
    set({ profile: session?.profile ?? null, initialised: true });
  },
  signIn: async (email, password) => {
    set({ loading: true });
    try {
      const { profile } = await authRepo.signIn(email, password);
      set({ profile });
    } finally {
      set({ loading: false });
    }
  },
  signUp: async (email, password, displayName) => {
    set({ loading: true });
    try {
      const { profile } = await authRepo.signUp(email, password, displayName);
      set({ profile });
    } finally {
      set({ loading: false });
    }
  },
  magicLink: async (email) => {
    set({ loading: true });
    try {
      const { profile } = await authRepo.magicLink(email);
      set({ profile });
    } finally {
      set({ loading: false });
    }
  },
  signOut: async () => {
    await authRepo.signOut();
    set({ profile: null });
  },
}));
