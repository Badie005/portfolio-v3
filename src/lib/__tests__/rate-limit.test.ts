/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { enforceRateLimit } from '../rate-limit';

// Mock Request
function createMockRequest(ip: string = '127.0.0.1'): Request {
    const headers = new Headers();
    headers.set('x-forwarded-for', ip);

    return {
        headers,
    } as unknown as Request;
}

describe('Rate Limiting', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Clear env vars to use in-memory fallback
        delete process.env.UPSTASH_REDIS_REST_URL;
        delete process.env.UPSTASH_REDIS_REST_TOKEN;
    });

    afterEach(() => {
        vi.resetModules();
    });

    describe('In-Memory Fallback', () => {
        it('should allow first request', async () => {
            const req = createMockRequest('192.168.1.1');

            const result = await enforceRateLimit(req, 5, 3600);

            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(4);
        });

        it('should track request count', async () => {
            const req = createMockRequest('192.168.1.2');

            // First request
            await enforceRateLimit(req, 5, 3600);

            // Second request
            const result = await enforceRateLimit(req, 5, 3600);

            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(3);
        });

        it('should block after limit exceeded', async () => {
            const req = createMockRequest('192.168.1.3');

            // Use up all requests
            for (let i = 0; i < 5; i++) {
                await enforceRateLimit(req, 5, 3600);
            }

            // This should be blocked
            const result = await enforceRateLimit(req, 5, 3600);

            expect(result.allowed).toBe(false);
            expect(result.remaining).toBe(0);
        });

        it('should use different limits for different IPs', async () => {
            const req1 = createMockRequest('10.0.0.1');
            const req2 = createMockRequest('10.0.0.2');

            // Use up all requests for IP 1
            for (let i = 0; i < 5; i++) {
                await enforceRateLimit(req1, 5, 3600);
            }

            // IP 1 should be blocked
            const result1 = await enforceRateLimit(req1, 5, 3600);
            expect(result1.allowed).toBe(false);

            // IP 2 should still be allowed
            const result2 = await enforceRateLimit(req2, 5, 3600);
            expect(result2.allowed).toBe(true);
        });
    });

    describe('IP Extraction', () => {
        it('should extract IP from x-forwarded-for header', async () => {
            const headers = new Headers();
            headers.set('x-forwarded-for', '203.0.113.195, 70.41.3.18');

            const req = { headers } as unknown as Request;
            const result = await enforceRateLimit(req, 100, 3600);

            expect(result.allowed).toBe(true);
        });

        it('should use x-real-ip as fallback', async () => {
            const headers = new Headers();
            headers.set('x-real-ip', '203.0.113.100');

            const req = { headers } as unknown as Request;
            const result = await enforceRateLimit(req, 100, 3600);

            expect(result.allowed).toBe(true);
        });

        it('should use cf-connecting-ip for Cloudflare', async () => {
            const headers = new Headers();
            headers.set('cf-connecting-ip', '203.0.113.200');

            const req = { headers } as unknown as Request;
            const result = await enforceRateLimit(req, 100, 3600);

            expect(result.allowed).toBe(true);
        });
    });
});
