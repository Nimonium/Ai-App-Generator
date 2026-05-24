import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { AppConfigSchema } from "@/lib/schema/app-config";

/**
 * Handles the Export App feature.
 * Generates a structured JSON bundle representing the entire App Architecture.
 * This proves platform extensibility by allowing metadata portability.
 */
export async function GET(req: Request, props: { params: Promise<{ appId: string }> }) {
  try {
    const params = await props.params;
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const app = await prisma.app.findUnique({ where: { id: params.appId } });
    if (!app || app.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Ensure what we export is clean and strictly matches the latest schema
    const cleanConfig = AppConfigSchema.parse(app.config);

    const exportData = {
      _metadata: {
        generatorVersion: "1.0.0",
        exportedAt: new Date().toISOString(),
      },
      app: {
        name: app.name,
        slug: app.slug,
        description: app.description,
        config: cleanConfig
      }
    };

    // Return as a downloadable file attachment
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${app.slug}-architecture.json"`
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Export failed: " + error.message }, { status: 500 });
  }
}
