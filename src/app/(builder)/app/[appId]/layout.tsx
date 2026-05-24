import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import { BuilderStoreProvider } from "@/components/builder/store-provider";
import Link from "next/link";
import { Database, Layout, Eye } from "lucide-react";
import { validateAppConfig } from "@/lib/schema/app-config";
import { BuilderSaveButton } from "@/components/builder/shared/save-button";

import prisma from "@/lib/prisma";

export default async function AppBuilderLayout(props: {
  children: React.ReactNode;
  params: Promise<{ appId: string }>;
}) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const app = await prisma.app.findUnique({
    where: { id: params.appId }
  });

  // Strict ownership check
  if (!app || app.ownerId !== session.user.id) {
    notFound();
  }

  // Ensure config is valid before passing to client store to prevent corrupted UI states
  const validConfig = validateAppConfig(app.config);

  return (
    <BuilderStoreProvider appId={app.id} config={validConfig}>
      <div className="flex flex-col h-full">
        {/* Top Navigation for the App Builder */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{app.name}</h2>
              <p className="text-xs text-gray-500">Builder Mode</p>
            </div>
            <nav className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              <Link href={`/app/${app.id}/models`} className="flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium hover:bg-white hover:shadow-sm transition-all text-gray-700">
                <Database className="h-4 w-4" /> Models
              </Link>
              <Link href={`/app/${app.id}/views`} className="flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium hover:bg-white hover:shadow-sm transition-all text-gray-700">
                <Layout className="h-4 w-4" /> Views
              </Link>
              <Link href={`/app/${app.id}/preview`} className="flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium hover:bg-white hover:shadow-sm transition-all text-gray-700">
                <Eye className="h-4 w-4" /> Preview
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
             <BuilderSaveButton appId={app.id} />
          </div>
        </header>

        {/* Editor Content Area */}
        <div className="flex-1 overflow-auto bg-gray-50">
          {props.children}
        </div>
      </div>
    </BuilderStoreProvider>
  );
}
