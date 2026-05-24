"use client";

import { useBuilderStore } from "@/lib/store/builder-store";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { ViewType } from "@/lib/schema/app-config";

export default function ViewsEditor() {
  const { draftConfig, updateDraft } = useBuilderStore();
  const [newViewName, setNewViewName] = useState("");
  const [newViewType, setNewViewType] = useState<"table" | "form" | "detail">("table");
  const [newViewModel, setNewViewModel] = useState("");

  if (!draftConfig) return null;

  const handleAddView = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newViewName.trim() || !newViewModel) return;

    // Generate path
    const path = `/${newViewName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

    updateDraft(draft => {
      draft.views.push({
        name: newViewName.trim(),
        path,
        type: newViewType,
        model: newViewModel,
        columns: [],
        formFields: []
      });
      return draft;
    });

    setNewViewName("");
  };

  const handleDeleteView = (index: number) => {
    updateDraft(draft => {
      draft.views.splice(index, 1);
      return draft;
    });
  };

  const handleUpdateView = (index: number, data: any) => {
    updateDraft(draft => {
      draft.views[index] = { ...draft.views[index], ...data };
      return draft;
    });
  };

  // Helper to toggle strings in string arrays (like columns)
  const toggleArrayItem = (index: number, arrayName: "columns" | "formFields", item: string) => {
    updateDraft(draft => {
      const view = draft.views[index];
      const arr = view[arrayName] || [];
      const itemIdx = arr.indexOf(item);
      
      if (itemIdx > -1) {
        arr.splice(itemIdx, 1);
      } else {
        arr.push(item);
      }
      
      view[arrayName] = arr;
      return draft;
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Views</h1>
        <p className="text-gray-500 mt-1">Define the user interfaces that interact with your models.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <form onSubmit={handleAddView} className="flex gap-4">
          <input 
            value={newViewName}
            onChange={e => setNewViewName(e.target.value)}
            placeholder="e.g. Customers List"
            className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
          <select 
            value={newViewType}
            onChange={e => setNewViewType(e.target.value as any)}
            className="w-48 border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-indigo-500 outline-none"
          >
            <option value="table">Table (List)</option>
            <option value="form">Form (Create/Edit)</option>
          </select>
          <select 
            value={newViewModel}
            onChange={e => setNewViewModel(e.target.value)}
            required
            className="w-48 border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-indigo-500 outline-none"
          >
            <option value="" disabled>Select Model...</option>
            {draftConfig.models.map(m => (
              <option key={m.name} value={m.name}>{m.name}</option>
            ))}
          </select>
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2 font-medium transition-colors">
            <Plus className="w-4 h-4" /> Add View
          </button>
        </form>
        {draftConfig.models.length === 0 && (
           <p className="text-amber-600 text-sm mt-3">You must create a Model first before you can create a View.</p>
        )}
      </div>

      <div className="space-y-6">
        {draftConfig.views.length === 0 && (
          <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-xl">
            No views created yet. Add one above.
          </div>
        )}

        {draftConfig.views.map((view, index) => {
          const modelDef = draftConfig.models.find(m => m.name === view.model);

          return (
            <div key={index} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-4">
                   <h3 className="text-lg font-semibold text-gray-900">{view.name}</h3>
                   <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-mono">{view.type}</span>
                   <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs font-mono">path: {view.path}</span>
                </div>
                <button onClick={() => handleDeleteView(index)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6">
                {!modelDef ? (
                  <div className="text-red-600 text-sm p-4 bg-red-50 rounded-md">
                    Error: The model "{view.model}" no longer exists. Please delete this view or update it.
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">URL Path</label>
                       <input 
                         value={view.path}
                         onChange={e => handleUpdateView(index, { path: e.target.value })}
                         className="w-full max-w-md border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 outline-none"
                       />
                    </div>

                    {view.type === "table" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Columns to Display</label>
                        <div className="flex flex-wrap gap-2">
                          {modelDef.fields.map(f => {
                            const isSelected = view.columns?.includes(f.name);
                            return (
                              <button
                                key={f.name}
                                onClick={() => toggleArrayItem(index, "columns", f.name)}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                                  isSelected 
                                    ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                                    : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                                }`}
                              >
                                {f.name}
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">If none are selected, all fields will be displayed by default.</p>
                      </div>
                    )}

                    {view.type === "form" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Form Fields to Edit</label>
                        <div className="flex flex-wrap gap-2">
                          {modelDef.fields.map(f => {
                            const isSelected = view.formFields?.includes(f.name);
                            return (
                              <button
                                key={f.name}
                                onClick={() => toggleArrayItem(index, "formFields", f.name)}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                                  isSelected 
                                    ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                                    : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                                }`}
                              >
                                {f.name} {f.required && "*"}
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Required fields should usually be included in forms.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
