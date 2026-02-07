import { NextResponse } from 'next/server';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    name: string;
    status: 'pass' | 'fail' | 'warn';
    message?: string;
    duration?: number;
  }[];
}

// Edge runtime for faster health checks
export const runtime = "edge";
export async function GET(): Promise<NextResponse<HealthStatus>> {
  const startTime = Date.now();
  const checks: HealthStatus['checks'] = [];

  // Check 1: Basic runtime
  checks.push({
    name: 'runtime',
    status: 'pass',
    message: 'Edge runtime operational',
  });

  // Check 2: Environment variables
  const requiredEnvVars = ['RESEND_API_KEY', 'TO_EMAIL'];
  const missingEnvVars = requiredEnvVars.filter(
    (v) => !process.env[v]
  );

  if (missingEnvVars.length === 0) {
    checks.push({
      name: 'environment',
      status: 'pass',
      message: 'All required environment variables present',
    });
  } else {
    checks.push({
      name: 'environment',
      status: 'warn',
      message: `Missing env vars: ${missingEnvVars.join(', ')}`,
    });
  }

  // Check 3: Upstash Redis (if configured)
  if (process.env.UPSTASH_REDIS_REST_URL) {
    try {
      const redisStart = Date.now();
      const response = await fetch(
        `${process.env.UPSTASH_REDIS_REST_URL}/ping`,
        {
          headers: {
            Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
          },
        }
      );

      if (response.ok) {
        checks.push({
          name: 'redis',
          status: 'pass',
          message: 'Upstash Redis connected',
          duration: Date.now() - redisStart,
        });
      } else {
        checks.push({
          name: 'redis',
          status: 'warn',
          message: 'Upstash Redis not responding',
          duration: Date.now() - redisStart,
        });
      }
    } catch {
      checks.push({
        name: 'redis',
        status: 'fail',
        message: 'Upstash Redis connection failed',
      });
    }
  } else {
    checks.push({
      name: 'redis',
      status: 'warn',
      message: 'Upstash Redis not configured (using in-memory fallback)',
    });
  }

  // Determine overall status
  const hasFailure = checks.some((c) => c.status === 'fail');
  const hasWarning = checks.some((c) => c.status === 'warn');

  let overallStatus: HealthStatus['status'] = 'healthy';
  if (hasFailure) {
    overallStatus = 'unhealthy';
  } else if (hasWarning) {
    overallStatus = 'degraded';
  }

  const healthStatus: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    uptime: Date.now() - startTime,
    checks,
  };

  const statusCode = overallStatus === 'unhealthy' ? 503 : 200;

  return NextResponse.json(healthStatus, {
    status: statusCode,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
