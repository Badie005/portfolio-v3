// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Only enable in production
    enabled: process.env.NODE_ENV === "production",

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 0.1,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    // Replay configuration
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,

    integrations: [
        Sentry.replayIntegration({
            // Additional SDK configuration goes in here, for example:
            maskAllText: true,
            blockAllMedia: true,
        }),
    ],

    // Filter out common non-actionable errors
    beforeSend(event, hint) {
        const error = hint.originalException;

        // Ignore ResizeObserver errors (common, non-critical)
        if (error instanceof Error && error.message.includes("ResizeObserver")) {
            return null;
        }

        // Ignore network errors that aren't actionable
        if (error instanceof Error && error.message.includes("NetworkError")) {
            return null;
        }

        return event;
    },
});
