export interface QueryOptions {
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  filters?: Record<string, any>;
}

/**
 * Parses generic URL search parameters into structured QueryOptions
 * Examples:
 * ?page=2&limit=50
 * ?sort=price:asc
 * ?filter[status]=active
 */
export function parseSearchParams(searchParams: URLSearchParams): QueryOptions {
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const sort = searchParams.get("sort");
  
  let sortField;
  let sortOrder: "asc" | "desc" = "desc";
  
  if (sort) {
    const [field, order] = sort.split(":");
    sortField = field;
    if (order === "asc" || order === "desc") {
      sortOrder = order;
    }
  } else {
    sortField = "createdAt"; // Default sorting
  }

  const filters: Record<string, string> = {};
  for (const [key, value] of searchParams.entries()) {
    const match = key.match(/^filter\[(.*)\]$/);
    if (match && match[1]) {
      filters[match[1]] = value;
    }
  }

  return {
    page: isNaN(page) ? 1 : Math.max(1, page),
    limit: isNaN(limit) ? 20 : Math.min(100, Math.max(1, limit)), // Max 100 records per page
    sortField,
    sortOrder,
    filters: Object.keys(filters).length > 0 ? filters : undefined,
  };
}

/**
 * Transforms parsed QueryOptions into a Prisma query object.
 * Handles pagination and basic JSONB filtering.
 */
export function buildPrismaQuery(appId: string, modelName: string, options: QueryOptions) {
  const { page = 1, limit = 20, sortField = "createdAt", sortOrder = "desc", filters } = options;

  const skip = (page - 1) * limit;

  const where: any = {
    appId,
    modelName,
  };

  if (filters) {
    // Map multiple filters into a Prisma AND array for JSONB deep filtering
    where.AND = Object.entries(filters).map(([key, val]) => ({
      data: {
        path: [key],
        equals: val,
      }
    }));
  }

  let orderBy: any = {};
  if (sortField === "createdAt" || sortField === "updatedAt") {
    orderBy[sortField] = sortOrder;
  } else {
    // Note: Prisma does not natively support orderBy on deeply nested JSON fields out of the box.
    // For MVP, we enforce sorting by root columns (createdAt, updatedAt).
    // In a fully scaled system, we would inject a raw query or use generated SQL columns.
    orderBy = { createdAt: "desc" };
  }

  return {
    where,
    skip,
    take: limit,
    orderBy,
  };
}
