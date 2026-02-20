import { NextResponse } from 'next/server';

// ── Typed application errors ──────────────────────────────────────────────────

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} no encontrado`, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado') {
    super('UNAUTHORIZED', message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acción no permitida') {
    super('FORBIDDEN', message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super('CONFLICT', message, 409);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message, 422);
  }
}

export class StockError extends AppError {
  constructor(sku: string) {
    super('INSUFFICIENT_STOCK', `Stock insuficiente para el SKU: ${sku}`, 409);
  }
}

// ── Global error → NextResponse mapper ─────────────────────────────────────

export function handleError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.statusCode }
    );
  }
  console.error('[Unhandled error]', error);
  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } },
    { status: 500 }
  );
}
