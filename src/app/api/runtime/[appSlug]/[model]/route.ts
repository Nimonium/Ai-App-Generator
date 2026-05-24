import { NextRequest, NextResponse } from "next/server";
import { RuntimeCrudService } from "@/server/services/runtime-crud.service";
import { parseSearchParams } from "@/lib/runtime/query-engine";
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

/**
 * Centralized error handler to catch our typed runtime exceptions and
 * safely convert them to standard JSON responses without exposing internal stack traces.
 */
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
 * GET /api/runtime/[appSlug]/[model]
 * Lists records for a model, supports pagination and filtering.
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ appSlug: string; model: string }> }
) {
  try {
    const params = await props.params;
    const userId = await getUserId();
    const queryOptions = parseSearchParams(request.nextUrl.searchParams);
    
    const result = await RuntimeCrudService.listRecords(
      params.appSlug,
      params.model,
      queryOptions,
      userId
    );
    
    return NextResponse.json(result);
  } catch (error: any) {
    return handleApiError(error);
  }
}

/**
 * POST /api/runtime/[appSlug]/[model]
 * Creates a new record for a model safely.
 */
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ appSlug: string; model: string }> }
) {
  try {
    const params = await props.params;
    const userId = await getUserId();
    const payload = await request.json();
    
    const record = await RuntimeCrudService.createRecord(
      params.appSlug,
      params.model,
      payload,
      userId
    );
    
    return NextResponse.json(record, { status: 201 });
  } catch (error: any) {
    return handleApiError(error);
  }
}
