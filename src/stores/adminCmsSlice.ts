import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

// ── Public types ──────────────────────────────────────────────────────────────

/** One CMS module's content: field keys mapped to string or boolean values. */
export type ModuleContent = Record<string, string | boolean>;

/** All CMS modules keyed by module name (e.g. "homepage", "footer"). */
export type ModulesMap = Record<string, ModuleContent>;

// ── State shape ───────────────────────────────────────────────────────────────

interface AdminCmsState {
  /** All module content as loaded from GET /admin/cms/settings, keyed by module name. */
  modules: ModulesMap;

  /** The module currently open in the editor panel. */
  currentModule: string | null;

  /**
   * Set when the admin clicks a different module while the editor has unsaved
   * changes. The confirmation dialog reads this to know where to navigate after
   * the admin chooses to save or discard.
   */
  pendingModule: string | null;

  /** True when the current module's fields differ from the last saved/loaded state. */
  isDirty: boolean;

  /** True during the initial GET /admin/cms/settings network request. */
  isLoading: boolean;

  /** True during a PUT /admin/cms/settings/{module} network request. */
  isSaving: boolean;

  /** ISO timestamp set on every successful save. Reset when a new module is opened. */
  lastSaved: string | null;

  /** Human-readable error from the most recent failed save. Cleared on next save attempt. */
  error: string | null;
}

// ── Initial state ─────────────────────────────────────────────────────────────

const initialState: AdminCmsState = {
  modules: {},
  currentModule: null,
  pendingModule: null,
  isDirty: false,
  isLoading: false,
  isSaving: false,
  lastSaved: null,
  error: null,
};

// ── Slice ─────────────────────────────────────────────────────────────────────

const adminCmsSlice = createSlice({
  name: "adminCms",
  initialState,
  reducers: {
    /** Mark the start of the initial modules fetch. */
    setLoading(state) {
      state.isLoading = true;
      state.error = null;
    },

    /**
     * Store all modules returned by the API and open the first one.
     * Resets all edit-lifecycle state.
     */
    setModules(state, action: PayloadAction<ModulesMap>) {
      state.modules = action.payload;
      state.isLoading = false;
      state.isDirty = false;
      state.pendingModule = null;
      state.error = null;
    },

    /**
     * Switch the active module.
     * If the editor is currently dirty, callers should set `pendingModule`
     * first and wait for user confirmation rather than calling this directly.
     */
    setCurrentModule(state, action: PayloadAction<string>) {
      state.currentModule = action.payload;
      state.pendingModule = null;
      state.isDirty = false;
      state.lastSaved = null;
      state.error = null;
    },

    /**
     * Record a requested navigation target when the editor has unsaved changes.
     * The confirmation dialog reads this and calls setCurrentModule on confirm.
     * Pass null to clear the pending navigation (user cancelled).
     */
    setPendingModule(state, action: PayloadAction<string | null>) {
      state.pendingModule = action.payload;
    },

    /**
     * Update a single field value in a module.
     * Marks the editor as dirty immediately so the Save button activates.
     */
    updateField(
      state,
      action: PayloadAction<{ module: string; key: string; value: string | boolean }>
    ) {
      const { module, key, value } = action.payload;
      if (!state.modules[module]) {
        state.modules[module] = {};
      }
      state.modules[module][key] = value;
      state.isDirty = true;
    },

    /** Mark the start of a PUT save request. */
    setSaving(state) {
      state.isSaving = true;
      state.error = null;
    },

    /**
     * Record a successful save.
     * The API response's `data` field is the authoritative new state for this module.
     */
    setSaved(
      state,
      action: PayloadAction<{ module: string; content: ModuleContent }>
    ) {
      const { module, content } = action.payload;
      state.modules[module] = content;
      state.isSaving = false;
      state.isDirty = false;
      state.lastSaved = new Date().toISOString();
      state.error = null;
    },

    /** Record a save failure. isDirty stays true so the admin can retry. */
    setSaveError(state, action: PayloadAction<string>) {
      state.isSaving = false;
      state.error = action.payload;
    },

    /** Full reset — call on page unmount or admin logout. */
    resetCmsEditor() {
      return { ...initialState };
    },
  },
});

export const {
  setLoading,
  setModules,
  setCurrentModule,
  setPendingModule,
  updateField,
  setSaving,
  setSaved,
  setSaveError,
  resetCmsEditor,
} = adminCmsSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectAdminCms = (state: RootState) => state.adminCms;

/** Returns the content of the currently-open module, or null if none is open. */
export const selectCurrentContent = (state: RootState): ModuleContent | null => {
  const { modules, currentModule } = state.adminCms;
  if (!currentModule) return null;
  return modules[currentModule] ?? null;
};

export default adminCmsSlice.reducer;
