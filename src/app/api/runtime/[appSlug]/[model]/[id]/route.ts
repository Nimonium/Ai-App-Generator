import { NextRequest, NextResponse } from "next/server";
import { RuntimeCrudService } from "@/server/services/runtime-crud.service";
import { RuntimeError } from "@/lib/runtime/runtime-errors";

import { auth } from "@/auth";

/**
 * Resolves the actual user ID from the Auth.js session.
 */
async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthenticated");
  return session.user.id;
}

function handleApiError(error: any) {
  if (error instanceof RuntimeError) {
    return NextResponse.json(
      { error: error.message, details: error.details },
      { status: error.statusCode }
    );
  }
  console.error("[Runtime API Error]:", error);
  return NextResponse.json(
    { error: "Internal Server Error" },
    { status: 500 }
  );
}

/**
 * GET /api/runtime/[appSlug]/[model]/[id]
 * Retrieves a single record safely.
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ appSlug: string; model: string; id: string }> }
) {
  try {
    const params = await props.params;
    const userId = await getUserId();
    const record = await RuntimeCrudService.getRecord(params.appSlug, params.model, params.id, userId);
    return NextResponse.json(record);
  } catch (error: any) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/runtime/[appSlug]/[model]/[id]
 * Updates an existing record safely using partial updates.
 */
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ appSlug: string; model: string; id: string }> }
) {
  try {
    const params = await props.params;
    const payload = await request.json();
    const userId = await getUserId();
    const record = await RuntimeCrudService.updateRecord(params.appSlug, params.model, params.id, payload, userId);
    return NextResponse.json(record);
  } catch (error: any) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/runtime/[appSlug]/[model]/[id]
 * Deletes a specific dynamic record securely.
 */
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ appSlug: string; model: string; id: string }> }
) {
  try {
    const params = await props.params;
    const userId = await getUserId();
    const result = await RuntimeCrudService.deleteRecord(params.appSlug, params.model, params.id, userId);
    return NextResponse.json(result);
  } catch (error: any) {
    return handleApiError(error);
  }
}
