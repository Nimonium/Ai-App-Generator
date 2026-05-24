import { View, AppConfig } from "@/lib/schema/app-config";
import { DynamicTable } from "./views/dynamic-table";
import { DynamicForm } from "./views/dynamic-form";

interface DynamicEngineProps {
  appSlug: string;
  appId: string;
  view: View;
  config: AppConfig;
}

/**
 * The Component Registry (Dynamic Engine)
 * Responsibilities:
 * 1. Matches the config "view type" to the correct React Component.
 * 2. Injects the relevant model definition down to the views.
 * 3. Gracefully degrades if a view references a broken model.
 */
export function DynamicEngine({ appSlug, view, config }: DynamicEngineProps) {
  // Resolve the target model for this view
  const model = config.models.find((m) => m.name === view.model);

  if (!model) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
        <strong>Configuration Error:</strong> This view is trying to render the model "{view.model}", but it does not exist.
      </div>
    );
  }

  // The Registry pattern
  switch (view.type) {
    case "table":
      return <DynamicTable appSlug={appSlug} view={view} model={model} />;
    case "form":
      return <DynamicForm appSlug={appSlug} view={view} model={model} />;
    case "detail":
      return (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-md text-sm">
          Detail view engine block is under construction.
        </div>
      );
    default:
      return (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
          <strong>Configuration Error:</strong> Unknown view type "{view.type}"
        </div>
      );
  }
}
