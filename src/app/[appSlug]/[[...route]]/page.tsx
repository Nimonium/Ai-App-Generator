import { notFound } from "next/navigation";
import { loadAppConfig } from "@/lib/runtime/config-loader";
import { DynamicEngine } from "@/components/dynamic/engine";

interface DynamicPageProps {
  params: Promise<{
    appSlug: string;
    route?: string[];
  }>;
}

export default async function DynamicAppPage(props: DynamicPageProps) {
  const params = await props.params;
  try {
    // 1. Load the requested app
    const { config, appId } = await loadAppConfig(params.appSlug);

    // 2. Resolve the current route path
    const pathSegments = params.route || [];
    const currentPath = "/" + pathSegments.join("/");

    // 3. Find the matching view in the configuration
    const view = config.views.find((v) => v.path === currentPath);

    if (!view) {
      // If the app exists but the route doesn't, return a 404
      notFound();
    }

    // 4. Render the page using the Dynamic Engine
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Simple Dynamic Navigation Bar */}
        <nav className="bg-white border-b px-6 py-4 flex items-center gap-6">
          <h1 className="text-xl font-semibold text-gray-900">{config.name}</h1>
          <div className="flex gap-4">
            {config.navigation.map((nav) => (
              <a
                key={nav.path}
                href={`/${params.appSlug}${nav.path}`}
                className={`text-sm font-medium ${
                  currentPath === nav.path ? "text-indigo-600" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {nav.label}
              </a>
            ))}
          </div>
        </nav>

        {/* Dynamic View Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{view.name}</h2>
            <DynamicEngine appSlug={params.appSlug} appId={appId} view={view} config={config} />
          </div>
        </main>
      </div>
    );
  } catch (error: any) {
    if (error?.name === "AppNotFoundError" || error?.message?.includes("not found")) {
      notFound();
    }
    console.error("DynamicAppPage Error:", error);
    // Generic error fallback for invalid config or DB connection issues
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-xl shadow-sm max-w-md w-full border border-red-100">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Application Error</h2>
          <p className="text-gray-600 text-sm">
            This application failed to load. The configuration may be malformed or unavailable.
          </p>
        </div>
      </div>
    );
  }
}
