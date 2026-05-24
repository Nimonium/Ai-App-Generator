"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { AppConfig, validateAppConfig } from "@/lib/schema/app-config";
import { revalidatePath } from "next/cache";

/**
 * Server Action to persist the drafted application configuration.
 * It enforces Zod validation and user ownership before saving.
 */
export async function saveAppConfig(appId: string, draftConfig: AppConfig) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // 1. Strict server-side validation. Never trust the client draft.
  const validConfig = validateAppConfig(draftConfig);

  // 2. Ownership check
  const app = await prisma.app.findUnique({ where: { id: appId } });
  if (!app || app.ownerId !== session.user.id) {
    throw new Error("App not found or unauthorized");
  }

  // 3. Persist the validated config
  await prisma.app.update({
    where: { id: appId },
    data: { config: validConfig }
  });

  // Revalidate the runtime path so the live app sees the changes instantly
  revalidatePath(`/${app.slug}`, "layout");

  return { success: true };
}
