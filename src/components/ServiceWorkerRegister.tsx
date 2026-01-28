"use client";

import { useEffect, useState } from "react";

interface ServiceWorkerState {
    isSupported: boolean;
    isRegistered: boolean;
    hasUpdate: boolean;
    isOffline: boolean;
}

export function ServiceWorkerRegister() {
    // State for internal tracking - setter is used, value is tracked but not rendered
    const [, setSwState] = useState<ServiceWorkerState>({
        isSupported: false,
        isRegistered: false,
        hasUpdate: false,
        isOffline: false,
    });

    useEffect(() => {
        const isDev = process.env.NODE_ENV !== "production";
        let updateIntervalId: number | undefined;

        // Check if service workers are supported
        if (!("serviceWorker" in navigator)) {
            if (isDev) console.log("[SW] Service Workers not supported");
            return;
        }

        setSwState((prev) => ({ ...prev, isSupported: true }));

        // Track online/offline status
        const handleOnline = () => setSwState((prev) => ({ ...prev, isOffline: false }));
        const handleOffline = () => setSwState((prev) => ({ ...prev, isOffline: true }));

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        // Set initial offline state
        setSwState((prev) => ({ ...prev, isOffline: !navigator.onLine }));

        // Register service worker
        const registerSW = async () => {
            try {
                const registration = await navigator.serviceWorker.register("/sw.js", {
                    scope: "/",
                    updateViaCache: "none",
                });

                if (isDev) console.log("[SW] Service Worker registered with scope:", registration.scope);
                setSwState((prev) => ({ ...prev, isRegistered: true }));

                // Check for updates
                registration.addEventListener("updatefound", () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener("statechange", () => {
                            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                                // New update available
                                if (isDev) console.log("[SW] New version available");
                                setSwState((prev) => ({ ...prev, hasUpdate: true }));
                            }
                        });
                    }
                });

                // Check for updates periodically (every hour)
                updateIntervalId = window.setInterval(() => {
                    registration.update();
                }, 60 * 60 * 1000);

            } catch (error) {
                if (isDev) console.error("[SW] Service Worker registration failed:", error);
            }
        };

        // Register when the page loads
        if (document.readyState === "complete") {
            registerSW();
        } else {
            window.addEventListener("load", registerSW);
        }

        return () => {
            if (updateIntervalId) window.clearInterval(updateIntervalId);
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
            window.removeEventListener("load", registerSW);
        };
    }, []);

    // Don't render anything visible - this is just for registration
    // You could add a toast notification for updates here
    return null;
}

// Hook to access SW state from other components
export function useServiceWorker() {
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        setIsOffline(!navigator.onLine);

        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    const skipWaiting = () => {
        navigator.serviceWorker.controller?.postMessage({ type: "SKIP_WAITING" });
        window.location.reload();
    };

    return { isOffline, skipWaiting };
}
