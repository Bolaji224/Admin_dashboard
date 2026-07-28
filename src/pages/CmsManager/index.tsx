import { useEffect, useCallback, useState } from "react";
import axios from "@/utils/axios";
import Button from "@/components/Base/Button";
import { FormInput, FormTextarea, FormSwitch, FormLabel } from "@/components/Base/Form";
import { ClassicEditor } from "@/components/Base/Ckeditor";
import { Dialog, Slideover } from "@/components/Base/Headless";
import Lucide from "@/components/Base/Lucide";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import {
  setLoading,
  setModules,
  setCurrentModule,
  setPendingModule,
  updateField,
  setSaving,
  setSaved,
  setSaveError,
  selectAdminCms,
  selectCurrentContent,
  ModuleContent,
  ModulesMap,
} from "@/stores/adminCmsSlice";

// ── Constants ─────────────────────────────────────────────────────────────────

const MODULE_LABELS: Record<string, string> = {
  homepage: "Homepage",
  about: "About Us",
  employers: "Employers (SkillStamp™)",
  employers_ordinary: "Employers → Ordinary",
  employers_smartstart: "Employers → SmartStart",
  freelancers_ordinary: "Freelancers → Ordinary",
  freelancers_smartstart: "Freelancers → SmartStart",
  freelancers_talentvault: "Freelancers → Talent Vault",
  freelancers_inhouse: "Freelancers → In House",
  employer_dashboard: "Employer Dashboard",
  employer_dashboard_post_job: "Employer Dashboard → Post Job",
  employer_dashboard_talent_vault: "Employer Dashboard → Talent Vault",
  employer_dashboard_smartstart: "Employer Dashboard → SmartStart Form",
  candidate_dashboard: "Candidate Dashboard",
  candidate_dashboard_smartstart: "Candidate Dashboard → SmartStart App",
  candidate_dashboard_smartguide: "Candidate Dashboard → SmartGuide",
  footer: "Footer",
  global: "Global Settings",
};

const MODULE_ICONS: Record<string, React.ComponentProps<typeof Lucide>["icon"]> = {
  homepage: "Home",
  about: "Info",
  employers: "Shield",
  employers_ordinary: "ShoppingBag",
  employers_smartstart: "Zap",
  freelancers_ordinary: "Users",
  freelancers_smartstart: "Award",
  freelancers_talentvault: "Lock",
  freelancers_inhouse: "Building2",
  employer_dashboard: "Briefcase",
  employer_dashboard_post_job: "FileText",
  employer_dashboard_talent_vault: "Database",
  employer_dashboard_smartstart: "Rocket",
  candidate_dashboard: "User",
  candidate_dashboard_smartstart: "Star",
  candidate_dashboard_smartguide: "BookOpen",
  footer: "Mail",
  global: "Settings",
};

const MODULE_ORDER = [
  "homepage",
  "about",
  "employers",
  "employers_ordinary",
  "employers_smartstart",
  "freelancers_ordinary",
  "freelancers_smartstart",
  "freelancers_talentvault",
  "freelancers_inhouse",
  "employer_dashboard",
  "employer_dashboard_post_job",
  "employer_dashboard_talent_vault",
  "employer_dashboard_smartstart",
  "candidate_dashboard",
  "candidate_dashboard_smartstart",
  "candidate_dashboard_smartguide",
  "footer",
  "global",
];

// ── Field helpers ─────────────────────────────────────────────────────────────

function isHtmlField(key: string): boolean {
  return key.endsWith("_html");
}

function isJsonField(key: string): boolean {
  return key.endsWith("_json");
}

function isTextareaField(key: string): boolean {
  return [
    "_message", "_subtitle", "_text", "_banner",
    "_tagline", "_description", "_overview", "_body",
  ].some((p) => key.endsWith(p));
}

function fieldLabel(key: string): string {
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ── Main Component ────────────────────────────────────────────────────────────

function Main() {
  const dispatch = useAppDispatch();
  const {
    modules,
    currentModule,
    pendingModule,
    isDirty,
    isLoading,
    isSaving,
    lastSaved,
    error,
  } = useAppSelector(selectAdminCms);
  const currentContent = useAppSelector(selectCurrentContent);

  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // ── Toast ─────────────────────────────────────────────────────────────────

  const showToast = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ── Fetch all modules on mount ────────────────────────────────────────────

  const fetchModules = useCallback(async () => {
    dispatch(setLoading());
    try {
      const res = await axios.get("/v1/admin/cms/settings");
      if (res.data?.status === "success" && Array.isArray(res.data.data)) {
        const modulesMap: ModulesMap = {};
        for (const record of res.data.data) {
          if (record.module && record.content) {
            modulesMap[record.module] = record.content as ModuleContent;
          }
        }
        dispatch(setModules(modulesMap));
        const first = MODULE_ORDER.find((m) => modulesMap[m]);
        if (first) dispatch(setCurrentModule(first));
      } else {
        showToast("Failed to load CMS settings", false);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message || err.message || "Failed to load CMS settings";
      showToast(msg, false);
    }
  }, [dispatch, showToast]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  // ── Module sidebar click ──────────────────────────────────────────────────

  const handleModuleClick = useCallback(
    (mod: string) => {
      if (!modules[mod]) return;
      if (isDirty && currentModule !== mod) {
        dispatch(setPendingModule(mod));
      } else {
        dispatch(setCurrentModule(mod));
      }
    },
    [modules, isDirty, currentModule, dispatch]
  );

  // ── Save current module ───────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!currentModule || !currentContent || isSaving) return;
    dispatch(setSaving());
    try {
      const res = await axios.put(`/v1/admin/cms/settings/${currentModule}`, {
        content: currentContent,
      });
      if (res.data?.status === "success") {
        const saved =
          (res.data.data?.content ?? res.data.data ?? currentContent) as ModuleContent;
        dispatch(setSaved({ module: currentModule, content: saved }));
        showToast(
          `"${MODULE_LABELS[currentModule] ?? currentModule}" saved successfully!`
        );
      } else {
        const msg = res.data?.message || "Save failed — unexpected response";
        dispatch(setSaveError(msg));
        showToast(msg, false);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Save failed";
      dispatch(setSaveError(msg));
      showToast(msg, false);
    }
  }, [currentModule, currentContent, isSaving, dispatch, showToast]);

  // ── Save & switch to pendingModule ────────────────────────────────────────

  const handleSaveAndSwitch = useCallback(async () => {
    if (!currentModule || !currentContent || isSaving) return;
    const target = pendingModule;
    dispatch(setSaving());
    try {
      const res = await axios.put(`/v1/admin/cms/settings/${currentModule}`, {
        content: currentContent,
      });
      if (res.data?.status === "success") {
        const saved =
          (res.data.data?.content ?? res.data.data ?? currentContent) as ModuleContent;
        dispatch(setSaved({ module: currentModule, content: saved }));
        showToast(`"${MODULE_LABELS[currentModule] ?? currentModule}" saved!`);
        if (target) dispatch(setCurrentModule(target));
      } else {
        const msg = res.data?.message || "Save failed — unexpected response";
        dispatch(setSaveError(msg));
        showToast(msg, false);
        dispatch(setPendingModule(null));
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Save failed";
      dispatch(setSaveError(msg));
      showToast(msg, false);
      dispatch(setPendingModule(null));
    }
  }, [currentModule, currentContent, isSaving, pendingModule, dispatch, showToast]);

  // ── Discard changes & switch ──────────────────────────────────────────────

  const handleDiscardAndSwitch = useCallback(() => {
    if (pendingModule) dispatch(setCurrentModule(pendingModule));
  }, [pendingModule, dispatch]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Toast notification ── */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[9999] px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${
            toast.ok ? "bg-success" : "bg-danger"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* ── Unsaved changes confirmation Dialog ── */}
      <Dialog
        open={pendingModule !== null}
        onClose={() => dispatch(setPendingModule(null))}
        staticBackdrop
      >
        <Dialog.Panel>
          <Dialog.Title>
            <Lucide icon="AlertTriangle" className="w-5 h-5 text-warning mr-2" />
            Unsaved Changes
          </Dialog.Title>
          <Dialog.Description>
            <p className="text-slate-600">
              You have unsaved changes in{" "}
              <span className="font-semibold text-slate-800">
                {MODULE_LABELS[currentModule ?? ""] ?? currentModule}
              </span>
              . What would you like to do before switching to{" "}
              <span className="font-semibold text-slate-800">
                {MODULE_LABELS[pendingModule ?? ""] ?? pendingModule}
              </span>
              ?
            </p>
          </Dialog.Description>
          <Dialog.Footer className="flex items-center justify-end gap-2 text-left">
            <Button
              variant="outline-secondary"
              onClick={() => dispatch(setPendingModule(null))}
            >
              Cancel
            </Button>
            <Button variant="outline-danger" onClick={handleDiscardAndSwitch}>
              Discard & Switch
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveAndSwitch}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Lucide icon="Loader" className="w-4 h-4 animate-spin mr-1.5" />
                  Saving…
                </>
              ) : (
                "Save & Switch"
              )}
            </Button>
          </Dialog.Footer>
        </Dialog.Panel>
      </Dialog>

      {/* ── Live Preview Slideover ── */}
      <Slideover open={previewOpen} onClose={() => setPreviewOpen(false)} size="xl">
        <Slideover.Panel>
          <Slideover.Title>
            <Lucide
              icon="Eye"
              className="w-5 h-5 text-primary mr-2 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className="font-semibold">
                {MODULE_LABELS[currentModule ?? ""] ?? currentModule ?? "Preview"}
              </span>
              <p className="text-xs font-normal text-slate-400 mt-0.5">
                Live preview — updates as you edit
              </p>
            </div>
            <button
              onClick={() => setPreviewOpen(false)}
              className="ml-3 flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <Lucide icon="X" className="w-5 h-5" />
            </button>
          </Slideover.Title>

          <Slideover.Description>
            {currentModule && modules[currentModule] ? (
              <div className="space-y-6">
                {Object.entries(modules[currentModule]).map(([key, val]) => (
                  <div key={key}>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      {fieldLabel(key)}
                      <span className="ml-2 normal-case font-normal text-slate-300 text-[11px]">
                        {key}
                      </span>
                    </p>
                    {typeof val === "boolean" ? (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          val
                            ? "bg-success/10 text-success"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Lucide
                          icon={val ? "CheckCircle" : "XCircle"}
                          className="w-3 h-3"
                        />
                        {val ? "Enabled" : "Disabled"}
                      </span>
                    ) : isHtmlField(key) ? (
                      <div
                        className="prose prose-sm max-w-none bg-slate-50 rounded-lg p-4 border border-slate-200 text-slate-700"
                        dangerouslySetInnerHTML={{ __html: val as string }}
                      />
                    ) : (
                      <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 border border-slate-200 whitespace-pre-wrap break-words">
                        {(val as string) || (
                          <span className="text-slate-300 italic">— empty —</span>
                        )}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                <Lucide icon="Eye" className="w-10 h-10 opacity-20 mb-3" />
                <p className="text-sm">No module selected</p>
              </div>
            )}
          </Slideover.Description>

          <Slideover.Footer>
            <Button variant="outline-secondary" onClick={() => setPreviewOpen(false)}>
              Close Preview
            </Button>
          </Slideover.Footer>
        </Slideover.Panel>
      </Slideover>

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-10 intro-y">
        <div>
          <h2 className="text-lg font-medium flex items-center gap-2">
            <Lucide icon="LayoutDashboard" className="w-5 h-5 text-primary" />
            CMS Manager
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Edit the platform's content modules. Changes take effect after the
            frontend cache expires (up to 1 hour) or on next page load.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {currentModule && (
            <Button
              variant="outline-secondary"
              className="flex items-center gap-2"
              onClick={() => setPreviewOpen(true)}
            >
              <Lucide icon="Eye" className="w-4 h-4" />
              Preview
            </Button>
          )}
          <Button
            variant="outline-secondary"
            className="flex items-center gap-2"
            onClick={fetchModules}
            disabled={isLoading}
          >
            <Lucide
              icon="RefreshCw"
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Reload
          </Button>
        </div>
      </div>

      {/* ── Main content: sidebar + editor ── */}
      <div className="grid grid-cols-12 gap-6 mt-6">

        {/* ── Module sidebar ── */}
        <div className="col-span-12 lg:col-span-3">
          <div className="box p-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">
              Modules
            </p>
            <nav className="space-y-0.5">
              {MODULE_ORDER.map((mod) => {
                const isActive = currentModule === mod;
                const exists = !!modules[mod];
                return (
                  <button
                    key={mod}
                    onClick={() => handleModuleClick(mod)}
                    disabled={!exists}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                      isActive
                        ? "bg-primary text-white shadow-sm"
                        : exists
                        ? "text-slate-700 hover:bg-slate-100"
                        : "text-slate-300 cursor-not-allowed"
                    }`}
                  >
                    <Lucide
                      icon={MODULE_ICONS[mod] ?? "FileText"}
                      className={`w-4 h-4 flex-shrink-0 ${
                        isActive ? "text-white" : "text-slate-400"
                      }`}
                    />
                    <span className="flex-1 truncate">
                      {MODULE_LABELS[mod] ?? mod}
                    </span>
                    {isDirty && isActive && (
                      <span className="w-2 h-2 rounded-full bg-warning flex-shrink-0" />
                    )}
                    {!exists && isLoading && (
                      <Lucide
                        icon="Loader"
                        className="w-3 h-3 flex-shrink-0 animate-spin text-slate-300"
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* ── Editor panel ── */}
        <div className="col-span-12 lg:col-span-9">

          {/* Loading state */}
          {isLoading && (
            <div className="box p-10 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Lucide icon="Loader" className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm">Loading CMS settings…</p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !currentModule && (
            <div className="box p-10 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Lucide icon="LayoutDashboard" className="w-12 h-12 opacity-20" />
              <p className="font-medium">Select a module</p>
              <p className="text-sm text-center max-w-xs">
                Choose a content module from the sidebar to begin editing.
              </p>
            </div>
          )}

          {/* Editor */}
          {!isLoading && currentModule && currentContent && (
            <div className="box intro-y">

              {/* Editor header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-b border-slate-200/60">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Lucide
                      icon={MODULE_ICONS[currentModule] ?? "FileText"}
                      className="w-4 h-4 text-primary"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-800 truncate">
                      {MODULE_LABELS[currentModule] ?? currentModule}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {isDirty && (
                        <span className="flex items-center gap-1 text-xs text-warning font-medium">
                          <Lucide icon="Circle" className="w-2 h-2 fill-warning" />
                          Unsaved changes
                        </span>
                      )}
                      {!isDirty && lastSaved && (
                        <span className="flex items-center gap-1 text-xs text-success">
                          <Lucide icon="Check" className="w-3 h-3" />
                          Saved{" "}
                          {new Date(lastSaved).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                      {error && (
                        <span className="flex items-center gap-1 text-xs text-danger">
                          <Lucide icon="AlertCircle" className="w-3 h-3" />
                          {error}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
                  <Button
                    variant="outline-secondary"
                    className="flex items-center gap-2"
                    onClick={() => setPreviewOpen(true)}
                  >
                    <Lucide icon="Eye" className="w-4 h-4" />
                    Preview
                  </Button>
                  <Button
                    variant="primary"
                    className="flex items-center gap-2"
                    onClick={handleSave}
                    disabled={!isDirty || isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Lucide icon="Loader" className="w-4 h-4 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Lucide icon="Save" className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Field list */}
              <div className="p-6 space-y-5">
                {Object.entries(currentContent).map(([key, value]) => (
                  <FieldRow
                    key={`${currentModule}-${key}`}
                    fieldKey={key}
                    value={value}
                    module={currentModule}
                    onUpdate={(k, v) =>
                      dispatch(
                        updateField({ module: currentModule, key: k, value: v })
                      )
                    }
                  />
                ))}
                {Object.keys(currentContent).length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-8">
                    No fields found for this module.
                  </p>
                )}
              </div>

              {/* Sticky save bar — shown when editor is dirty */}
              {isDirty && (
                <div className="sticky bottom-0 border-t border-slate-200/60 bg-white/95 backdrop-blur-sm px-6 py-3 flex items-center justify-between rounded-b-xl">
                  <p className="text-sm text-slate-500">
                    You have unsaved changes in{" "}
                    <span className="font-medium text-slate-700">
                      {MODULE_LABELS[currentModule] ?? currentModule}
                    </span>
                    .
                  </p>
                  <Button
                    variant="primary"
                    className="flex items-center gap-2"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Lucide icon="Loader" className="w-4 h-4 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Lucide icon="Save" className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── FieldRow ──────────────────────────────────────────────────────────────────
// Keyed by `${currentModule}-${fieldKey}` in the parent so CKEditor
// unmounts/remounts cleanly whenever the active module changes.

interface FieldRowProps {
  fieldKey: string;
  value: string | boolean;
  module: string;
  onUpdate: (key: string, value: string | boolean) => void;
}

function FieldRow({ fieldKey, value, onUpdate }: FieldRowProps) {
  const label = fieldLabel(fieldKey);

  // ── Boolean → toggle switch ──────────────────────────────────────────────
  if (typeof value === "boolean") {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-2 border-b border-slate-100 last:border-0">
        <div className="sm:w-56 flex-shrink-0">
          <FormLabel className="!mb-0 font-medium text-slate-700 text-sm">
            {label}
          </FormLabel>
          <p className="text-xs text-slate-400 mt-0.5">{fieldKey}</p>
        </div>
        <div className="flex items-center gap-3">
          <FormSwitch>
            <FormSwitch.Input
              type="checkbox"
              checked={value}
              onChange={(e) => onUpdate(fieldKey, e.target.checked)}
            />
          </FormSwitch>
          <span
            className={`text-sm font-medium ${
              value ? "text-success" : "text-slate-400"
            }`}
          >
            {value ? "Enabled" : "Disabled"}
          </span>
        </div>
      </div>
    );
  }

  // ── HTML field → CKEditor ────────────────────────────────────────────────
  if (isHtmlField(fieldKey)) {
    return (
      <div className="py-2 border-b border-slate-100 last:border-0">
        <div className="mb-2 flex items-baseline justify-between">
          <FormLabel className="!mb-0 font-medium text-slate-700 text-sm">
            {label}
          </FormLabel>
          <span className="text-xs text-slate-400">{fieldKey}</span>
        </div>
        <ClassicEditor
          value={value as string}
          onChange={(data: string) => onUpdate(fieldKey, data)}
        />
      </div>
    );
  }

  // ── JSON array field → monospace textarea ────────────────────────────────
  if (isJsonField(fieldKey)) {
    let isValid = true;
    try { JSON.parse(value as string); } catch { isValid = false; }

    return (
      <div className="py-2 border-b border-slate-100 last:border-0">
        <div className="mb-1.5 flex items-baseline justify-between">
          <FormLabel className="!mb-0 font-medium text-slate-700 text-sm">
            {label}
          </FormLabel>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-medium ${
                isValid ? "text-success" : "text-danger"
              }`}
            >
              {isValid ? "Valid JSON" : "Invalid JSON"}
            </span>
            <span className="text-xs text-slate-400">{fieldKey}</span>
          </div>
        </div>
        <FormTextarea
          rows={8}
          value={value as string}
          onChange={(e) => onUpdate(fieldKey, e.target.value)}
          className="resize-y font-mono text-xs"
          placeholder="[]"
        />
        <p className="mt-1 text-xs text-slate-400">
          JSON array. Each item is one entry in this section. Changes take effect after saving.
        </p>
      </div>
    );
  }

  // ── Long text → textarea ─────────────────────────────────────────────────
  if (isTextareaField(fieldKey)) {
    return (
      <div className="py-2 border-b border-slate-100 last:border-0">
        <div className="mb-1.5 flex items-baseline justify-between">
          <FormLabel className="!mb-0 font-medium text-slate-700 text-sm">
            {label}
          </FormLabel>
          <span className="text-xs text-slate-400">{fieldKey}</span>
        </div>
        <FormTextarea
          rows={3}
          value={value as string}
          onChange={(e) => onUpdate(fieldKey, e.target.value)}
          className="resize-y"
        />
      </div>
    );
  }

  // ── Default → single-line text input ─────────────────────────────────────
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-2 border-b border-slate-100 last:border-0">
      <div className="sm:w-56 flex-shrink-0">
        <FormLabel className="!mb-0 font-medium text-slate-700 text-sm">
          {label}
        </FormLabel>
        <p className="text-xs text-slate-400 mt-0.5">{fieldKey}</p>
      </div>
      <FormInput
        type="text"
        value={value as string}
        onChange={(e) => onUpdate(fieldKey, e.target.value)}
        className="flex-1"
      />
    </div>
  );
}

export default Main;
