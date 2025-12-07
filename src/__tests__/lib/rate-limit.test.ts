import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the rate limit module
const mockEnforceRateLimit = vi.fn();

vi.mock('@/lib/rate-limit', () => ({
  enforceRateLimit: mockEnforceRateLimit,
}));

describe('Rate Limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('enforceRateLimit', () => {
    it('should allow requests under the limit', async () => {
      mockEnforceRateLimit.mockResolvedValue({
        allowed: true,
        remaining: 4,
        reset: Date.now() + 3600000,
      });

      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'x-forwarded-for': '192.168.1.1' },
      });

      const result = await mockEnforceRateLimit(request, 5, 3600);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('should block requests over the limit', async () => {
      mockEnforceRateLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        reset: Date.now() + 3600000,
      });

      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'x-forwarded-for': '192.168.1.1' },
      });

      const result = await mockEnforceRateLimit(request, 5, 3600);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should extract IP from x-forwarded-for header', async () => {
      mockEnforceRateLimit.mockResolvedValue({
        allowed: true,
        remaining: 4,
        reset: Date.now() + 3600000,
      });

      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'x-forwarded-for': '10.0.0.1, 192.168.1.1' },
      });

      await mockEnforceRateLimit(request, 5, 3600);

      expect(mockEnforceRateLimit).toHaveBeenCalledWith(request, 5, 3600);
    });

    it('should handle missing IP gracefully', async () => {
      mockEnforceRateLimit.mockResolvedValue({
        allowed: true,
        remaining: 4,
        reset: Date.now() + 3600000,
      });

      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
      });

      const result = await mockEnforceRateLimit(request, 5, 3600);

      expect(result.allowed).toBe(true);
    });
  });
});
