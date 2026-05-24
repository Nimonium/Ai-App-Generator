"use client";

import { useState } from "react";
import { useBuilderStore } from "@/lib/store/builder-store";
import { saveAppConfig } from "@/app/(builder)/app/[appId]/actions";
import { Save, AlertCircle } from "lucide-react";

export function BuilderSaveButton({ appId }: { appId: string }) {
  const { isDirty, draftConfig, commitDraft } = useBuilderStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!draftConfig) return;
    setSaving(true);
    setError(null);
    try {
      await saveAppConfig(appId, draftConfig);
      // If server action succeeds, sync draft to server state in Zustand
      commitDraft(); 
    } catch (err: any) {
      setError(err.message || "Failed to save configuration. Please check your models.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {error && (
        <span className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4"/> {error}
        </span>
      )}
      {isDirty && !error && (
        <span className="text-sm text-amber-600 font-medium">Unsaved changes</span>
      )}
      <button
        onClick={handleSave}
        disabled={!isDirty || saving}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          isDirty 
            ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm" 
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
        <Save className="h-4 w-4" />
        {saving ? "Saving..." : "Save Config"}
      </button>
    </div>
  );
}
