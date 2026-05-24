import { create } from "zustand";
import { AppConfig } from "../schema/app-config";

interface BuilderState {
  appId: string | null;
  serverConfig: AppConfig | null;
  draftConfig: AppConfig | null;
  isDirty: boolean;
  
  // Actions
  initialize: (appId: string, config: AppConfig) => void;
  updateDraft: (updater: (draft: AppConfig) => AppConfig) => void;
  commitDraft: () => void; 
  rollbackDraft: () => void;
}

/**
 * Zustand Store for the Builder Editor.
 * 
 * ARCHITECTURE RATIONALE:
 * We use Zustand to hold the `draftConfig` separate from the React render tree.
 * This allows deep nested components (like a specific field editor) to update
 * a tiny slice of the JSON config without triggering a massive cascading re-render
 * from the root layout down.
 */
export const useBuilderStore = create<BuilderState>((set) => ({
  appId: null,
  serverConfig: null,
  draftConfig: null,
  isDirty: false,

  initialize: (appId, config) => set({
    appId,
    serverConfig: JSON.parse(JSON.stringify(config)),
    draftConfig: JSON.parse(JSON.stringify(config)),
    isDirty: false,
  }),

  updateDraft: (updater) => set((state) => {
    if (!state.draftConfig) return state;
    
    // We deep clone the draft before passing it to the updater.
    // This prevents direct state mutations and guarantees a fresh object reference
    // so React correctly triggers re-renders for deeply nested configuration views.
    const clonedDraft = structuredClone(state.draftConfig);
    const newDraft = updater(clonedDraft);
    
    // We use a simple JSON stringify comparison to detect unsaved changes.
    const isDirty = JSON.stringify(newDraft) !== JSON.stringify(state.serverConfig);
    
    return {
      draftConfig: newDraft,
      isDirty
    };
  }),

  // Called after a successful Server Action save
  commitDraft: () => set((state) => ({
    serverConfig: state.draftConfig ? JSON.parse(JSON.stringify(state.draftConfig)) : null,
    isDirty: false
  })),

  // Called if the user clicks "Discard Changes"
  rollbackDraft: () => set((state) => ({
    draftConfig: state.serverConfig ? JSON.parse(JSON.stringify(state.serverConfig)) : null,
    isDirty: false
  }))
}));
