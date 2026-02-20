import type { User } from '@supabase/supabase-js';

/** Attached to the request context after auth middleware validation. */
export interface AuthContext {
  user: User;
}

/** Generic cursor-based pagination params. */
export interface CursorPaginationParams {
  cursor?: string;
  limit?:  number;
}

/** Offset-based pagination params. */
export interface PaginationParams {
  page:     number;
  per_page: number;
}

/** Standard list filter params shared across modules. */
export interface BaseFilterParams {
  q?: string; // full-text search query
}

export type SortOrder = 'asc' | 'desc';
