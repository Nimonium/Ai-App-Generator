import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { PlusCircle, ExternalLink, Settings, LayoutTemplate } from "lucide-react";
import { AutoCreateApp } from "./auto-create-client";
import { createApp } from "./actions";

/**
 * The primary Dashboard view.
 * Lists all apps owned by the current session user.
 */
export default async function DashboardPage(props: { searchParams: Promise<{ prompt?: string }> }) {
  const searchParams = await props.searchParams;
  const session = await auth();
  if (!session?.user?.id) return null;

  // If a prompt is passed in the URL (e.g. from the landing page),
  // show the auto-generation overlay which will trigger the createApp action.
  if (searchParams.prompt) {
    return <AutoCreateApp prompt={searchParams.prompt} />;
  }

  const apps = await prisma.app.findMany({
    where: { ownerId: session.user.id },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Applications</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your dynamic apps and configurations.</p>
        </div>
        
        <form action={createApp} className="flex gap-2">
          <input 
            name="name" 
            required 
            placeholder="App Name" 
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
          <button 
            type="submit" 
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            Create App
          </button>
        </form>
      </div>

      {apps.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-white">
          <LayoutTemplate className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No applications yet</h3>
          <p className="text-gray-500 mt-1">Get started by creating your first dynamic application.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <div key={app.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{app.name}</h3>
                <p className="text-sm text-gray-500 mt-1 truncate">{app.description}</p>
                <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                  <span>Updated: {app.updatedAt.toLocaleDateString()}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded-full">{app.status}</span>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center">
                <Link 
                  href={`/app/${app.id}/models`} 
                  className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  <Settings className="h-4 w-4" />
                  Builder
                </Link>
                <a 
                  href={`/${app.slug}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  <ExternalLink className="h-4 w-4" />
                  Live App
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
