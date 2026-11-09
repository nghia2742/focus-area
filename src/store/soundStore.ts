"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CustomSound } from "@/data/sounds";

interface SoundState {
  /** User-uploaded notification sounds, stored as data URLs. */
  customSounds: CustomSound[];
  hydrated: boolean;
  addCustomSound: (sound: CustomSound) => void;
  removeCustomSound: (id: string) => void;
  resetCustomSounds: () => void;
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set) => ({
      customSounds: [],
      hydrated: false,
      addCustomSound: (sound) =>
        set((state) => ({ customSounds: [...state.customSounds, sound] })),
      removeCustomSound: (id) =>
        set((state) => ({
          customSounds: state.customSounds.filter((sound) => sound.id !== id),
        })),
      resetCustomSounds: () => set({ customSounds: [] }),
    }),
    {
      name: "focus-sounds",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ customSounds: state.customSounds }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
