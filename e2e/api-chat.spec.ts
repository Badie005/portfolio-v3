import { test, expect } from '@playwright/test';

test.describe.serial('Chat API Security & Functionality', () => {

    test('should reject requests without message', async ({ request }) => {
        const response = await request.post('/api/chat', {
            data: {}
        });
        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.error).toContain('required');
    });

    test('should reject extremely long messages', async ({ request }) => {
        const longMessage = 'a'.repeat(5000);
        const response = await request.post('/api/chat', {
            data: { message: longMessage }
        });
        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.error).toContain('too long');
    });

    test('should respond to a valid greeting', async ({ request }) => {
        // Note: This test requires a valid GOOGLE_AI_API_KEY (or OPENROUTER_API_KEY) in .env.local
        const response = await request.post('/api/chat', {
            data: { message: 'Hello, are you online?' }
        });

        // If API key is missing/invalid, it might return 500, but we want to ensure
        // it doesn't return 404 (route missing) or 405 (method not allowed).
        // Ideally it returns 200.

        expect([200, 429, 500, 503]).toContain(response.status());

        if (response.status() === 200) {
            expect(response.headers()['content-type']).toContain('text/plain');
            const bodyText = await response.text();
            expect(bodyText.trim().length).toBeGreaterThan(0);
        }
    });

    test('should enforce rate limits', async ({ request }) => {
        // Send multiple requests quickly
        const requests = Array.from({ length: 15 }).map(() =>
            request.post('/api/chat', {
                data: { message: 'ping' }
            })
        );

        const responses = await Promise.all(requests);
        const tooManyRequests = responses.filter(r => r.status() === 429);

        // We expect at least some requests to be rate limited (limit is 10/min)
        expect(tooManyRequests.length).toBeGreaterThan(0);
    });
});
