import { auth, signOut } from "@/auth";
import Link from "next/link";
import { LayoutDashboard, LogOut, Settings, AppWindow } from "lucide-react";

export default async function BuilderLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gray-900 text-gray-300 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <span className="text-white text-lg font-bold flex items-center gap-2">
            <AppWindow className="h-5 w-5 text-indigo-400" />
            App Generator
          </span>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-800 hover:text-white transition-colors"
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
              {session?.user?.email?.[0].toUpperCase() || "U"}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium text-white truncate">{session?.user?.email}</p>
            </div>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <button
              type="submit"
              className="w-full mt-2 flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
}
