"use client";

import { useBuilderStore } from "@/lib/store/builder-store";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { FieldType } from "@/lib/schema/app-config";

export default function ModelsEditor() {
  const { draftConfig, updateDraft } = useBuilderStore();
  const [newModelName, setNewModelName] = useState("");

  if (!draftConfig) return null;

  const handleAddModel = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newModelName.trim().replace(/[^a-zA-Z0-9]/g, ""); // basic sanitization
    if (!name) return;
    
    // Check for duplicates
    if (draftConfig.models.some(m => m.name.toLowerCase() === name.toLowerCase())) {
      alert("A model with this name already exists.");
      return;
    }

    updateDraft(draft => {
      draft.models.push({ name, fields: [] });
      return draft;
    });
    setNewModelName("");
  };

  const handleDeleteModel = (modelName: string) => {
    if (confirm(`Are you sure you want to delete the model "${modelName}"? Views depending on it will break.`)) {
      updateDraft(draft => {
        draft.models = draft.models.filter(m => m.name !== modelName);
        return draft;
      });
    }
  };

  const handleAddField = (modelName: string) => {
    updateDraft(draft => {
      const model = draft.models.find(m => m.name === modelName);
      if (model) {
        model.fields.push({
          name: `field_${model.fields.length + 1}`,
          type: "string",
          required: false
        });
      }
      return draft;
    });
  };

  const handleUpdateField = (modelName: string, index: number, fieldData: any) => {
    updateDraft(draft => {
      const model = draft.models.find(m => m.name === modelName);
      if (model) {
        model.fields[index] = { ...model.fields[index], ...fieldData };
      }
      return draft;
    });
  };

  const handleDeleteField = (modelName: string, index: number) => {
    updateDraft(draft => {
      const model = draft.models.find(m => m.name === modelName);
      if (model) {
        model.fields.splice(index, 1);
      }
      return draft;
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Data Models</h1>
        <p className="text-gray-500 mt-1">Define the database schema for your dynamic application.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <form onSubmit={handleAddModel} className="flex gap-4">
          <input 
            value={newModelName}
            onChange={e => setNewModelName(e.target.value)}
            placeholder="e.g. Customer, Order, Product"
            className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2 font-medium transition-colors">
            <Plus className="w-4 h-4" /> Add Model
          </button>
        </form>
      </div>

      <div className="space-y-6">
        {draftConfig.models.length === 0 && (
          <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-xl">
            No models created yet. Add one above.
          </div>
        )}
        
        {draftConfig.models.map(model => (
          <div key={model.name} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-mono">Model</span>
                {model.name}
              </h3>
              <button onClick={() => handleDeleteModel(model.name)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6">
              {model.fields.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4 bg-gray-50 rounded-lg border border-dashed">No fields defined yet. Add fields to store data.</p>
              ) : (
                <div className="space-y-4">
                  {model.fields.map((field, idx) => (
                    <div key={idx} className="flex gap-4 items-start border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex-1 space-y-3">
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Field Name (camelCase)</label>
                            <input 
                              value={field.name}
                              onChange={e => handleUpdateField(model.name, idx, { name: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') })}
                              className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            />
                          </div>
                          <div className="w-48">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                            <select 
                              value={field.type}
                              onChange={e => handleUpdateField(model.name, idx, { type: e.target.value })}
                              className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:ring-indigo-500 outline-none"
                            >
                              <option value="string">String (Text)</option>
                              <option value="number">Number</option>
                              <option value="boolean">Boolean (Checkbox)</option>
                              <option value="date">Date</option>
                              <option value="email">Email</option>
                            </select>
                          </div>
                          <div className="w-24 pt-6">
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <input 
                                type="checkbox"
                                checked={field.required}
                                onChange={e => handleUpdateField(model.name, idx, { required: e.target.checked })}
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                              />
                              Required
                            </label>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteField(model.name, idx)} className="mt-6 text-gray-400 hover:text-red-500 transition-colors p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button 
                onClick={() => handleAddField(model.name)}
                className="mt-6 text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Field
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
