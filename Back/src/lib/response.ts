import { NextResponse } from 'next/server';

export interface ApiResponse<T = unknown> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total:    number;
    page:     number;
    per_page: number;
    cursor?:  string | null;
  };
}

/** Returns a 200 JSON response with the data envelope. */
export function ok<T>(data: T, meta?: Record<string, unknown>, status = 200): NextResponse {
  return NextResponse.json({ data, ...(meta ? { meta } : {}) }, { status });
}

/** Returns a 201 Created response. */
export function created<T>(data: T): NextResponse {
  return NextResponse.json({ data }, { status: 201 });
}

/** Returns a 204 No Content response. */
export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/** Returns a paginated response. */
export function paginated<T>(
  items: T[],
  meta: PaginatedResponse<T>['meta']
): NextResponse {
  return NextResponse.json({ data: items, meta });
}
