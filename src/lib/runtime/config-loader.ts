import { AppConfig, validateAppConfig, AppConfigSchema } from "../schema/app-config";
import { AppNotFoundError } from "./runtime-errors";
import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

// In Next.js App Router, it's best practice to instantiate a single PrismaClient.
// For brevity in this module, we instantiate it here, but typically it would be imported from `src/lib/db/prisma.ts`.

/**
 * Loads and strictly validates the application configuration from the database.
 * Uses unstable_cache to avoid hitting the PostgreSQL DB on every dynamic route.
 */
const fetchAppConfigFromDb = async (appSlug: string): Promise<{ id: string; config: AppConfig; ownerId: string } | null> => {
  const app = await prisma.app.findUnique({
    where: { slug: appSlug },
    select: { id: true, config: true, ownerId: true }
  });

  if (!app) return null;

  // Strict schema enforcement at the boundary
  const validConfig = AppConfigSchema.parse(app.config);

  return { id: app.id, config: validConfig, ownerId: app.ownerId };
};

const getCachedAppConfig = unstable_cache(
  fetchAppConfigFromDb,
  ["app-config-cache"],
  { 
    revalidate: 3600 
  }
);

export async function loadAppConfig(appSlug: string): Promise<{ appId: string; config: AppConfig; ownerId: string }> {
  const app = await getCachedAppConfig(appSlug);

  if (!app) {
    throw new AppNotFoundError(appSlug);
  }

  return { appId: app.id, config: app.config, ownerId: app.ownerId };
}
