"use client";

import { useBuilderStore } from "@/lib/store/builder-store";
import { useState } from "react";
import { DynamicEngine } from "@/components/dynamic/engine";

export default function PreviewPage(props: { params: Promise<{ appId: string }> }) {
  const { draftConfig, appId } = useBuilderStore();
  const [selectedViewPath, setSelectedViewPath] = useState<string | null>(null);

  if (!draftConfig) return null;

  const views = draftConfig.views;
  // Default to the first view if none selected
  const activeView = views.find(v => v.path === selectedViewPath) || views[0];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-gray-100 rounded-xl border border-gray-300 shadow-inner overflow-hidden">
      {/* Fake Browser Chrome / Tab Bar */}
      <div className="bg-gray-800 text-white p-3 flex gap-4 overflow-x-auto shrink-0 shadow-md z-10">
        <div className="flex items-center gap-2 text-sm font-mono text-gray-400 mr-4">
          <div className="flex gap-1.5 ml-2 mr-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          Live Preview
        </div>
        {views.length === 0 ? (
          <span className="text-gray-500 text-sm italic py-1">No views created yet</span>
        ) : (
          views.map(view => (
            <button
              key={view.path}
              onClick={() => setSelectedViewPath(view.path)}
              className={`px-4 py-1 text-sm rounded-md transition-colors ${
                activeView?.path === view.path 
                  ? "bg-indigo-600 text-white font-medium shadow-sm" 
                  : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              {view.name}
            </button>
          ))
        )}
      </div>

      {/* Main viewport for rendering the selected view */}
      <div className="flex-1 overflow-auto p-8 relative isolate">
        {activeView ? (
          <div className="bg-white rounded-xl shadow-sm border p-8 max-w-6xl mx-auto min-h-full">
             <h2 className="text-3xl font-bold text-gray-900 mb-8">{activeView.name}</h2>
             
             {/* 
                We use the EngineContextProvider to supply the draftConfig instead of 
                hitting the database. This allows instant Live Preview.
              */}
             <DynamicEngine 
               appSlug="preview" // Placeholder slug for preview-specific API interactions
               appId={appId!} 
               view={activeView} 
               config={draftConfig} 
             />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-lg font-medium text-gray-600">Nothing to preview</p>
            <p className="text-sm mt-2">Go to the Views tab and create a view to see it here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
