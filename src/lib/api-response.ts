import { NextResponse } from 'next/server';

/**
 * Standard error response for API routes
 */
export function errorResponse(
    message: string,
    status: number,
    details?: Record<string, unknown>
): NextResponse {
    const body: { error: string; details?: Record<string, unknown> } = { error: message };
    if (details) {
        body.details = details;
    }
    return NextResponse.json(body, { status });
}

/**
 * Standard success response for API routes
 */
export function successResponse<T>(
    data: T,
    status: number = 200
): NextResponse {
    return NextResponse.json(data, { status });
}

/**
 * Rate limit exceeded response with Retry-After header
 */
export function rateLimitResponse(resetTimestamp: number): NextResponse {
    const retryAfter = Math.max(0, Math.ceil((resetTimestamp - Date.now()) / 1000));

    return new NextResponse(
        JSON.stringify({ error: 'Trop de requêtes. Réessayez plus tard.' }),
        {
            status: 429,
            headers: {
                'Content-Type': 'application/json',
                'Retry-After': retryAfter.toString(),
            },
        }
    );
}

/**
 * Validation error response with field details
 */
export function validationErrorResponse(
    message: string,
    issues: unknown[]
): NextResponse {
    return NextResponse.json(
        { error: message, details: issues },
        { status: 400 }
    );
}
