'use client';

import { useReportWebVitals } from 'next/web-vitals';

type ReportWebVitalsCallback = Parameters<typeof useReportWebVitals>[0];

const reportWebVitals: ReportWebVitalsCallback = (metric) => {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  const body = {
    id: metric.id,
    name: metric.name,
    value: metric.value,
    delta: metric.delta,
    rating: metric.rating,
    navigationType: metric.navigationType,
    pathname: window.location.pathname,
    href: window.location.href,
    timestamp: Date.now(),
  };

  const url = '/api/vitals';

  try {
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      const blob = new Blob([JSON.stringify(body)], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
      return;
    }
  } catch {
    // ignore
  }

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => {});
};

export function WebVitals() {
  useReportWebVitals(reportWebVitals);
  return null;
}

export default WebVitals;
