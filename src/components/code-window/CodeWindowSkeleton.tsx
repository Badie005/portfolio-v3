'use client';

import { motion } from 'motion/react';

/**
 * Skeleton placeholder for CodeWindow component during lazy loading.
 * Mimics the IDE-style layout with animated placeholders.
 */
export function CodeWindowSkeleton() {
    return (
        <div className="w-full h-[600px] bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl">
            {/* Title bar skeleton */}
            <div className="h-10 bg-neutral-800 flex items-center px-4 gap-2">
                {/* Traffic lights */}
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50 animate-pulse" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50 animate-pulse" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50 animate-pulse" />
                </div>
                {/* Title placeholder */}
                <div className="flex-1 flex justify-center">
                    <div className="h-4 w-32 bg-neutral-700 rounded animate-pulse" />
                </div>
            </div>

            <div className="flex h-[calc(100%-2.5rem)]">
                {/* Left sidebar skeleton */}
                <div className="w-48 bg-neutral-850 border-r border-neutral-800 p-3 space-y-2">
                    <div className="h-4 w-20 bg-neutral-700 rounded animate-pulse mb-4" />
                    {Array.from({ length: 6 }).map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0.3 }}
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                            className="flex items-center gap-2"
                        >
                            <div className="w-4 h-4 bg-neutral-700 rounded" />
                            <div className="h-3 bg-neutral-700 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
                        </motion.div>
                    ))}
                </div>

                {/* Main content area skeleton */}
                <div className="flex-1 p-4 space-y-3">
                    {/* Tab bar */}
                    <div className="flex gap-2 mb-4">
                        <div className="h-8 w-24 bg-neutral-800 rounded-t animate-pulse" />
                        <div className="h-8 w-20 bg-neutral-700 rounded-t animate-pulse" />
                    </div>

                    {/* Code lines */}
                    {Array.from({ length: 12 }).map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0.2 }}
                            animate={{ opacity: [0.2, 0.5, 0.2] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.08 }}
                            className="flex items-center gap-4"
                        >
                            {/* Line number */}
                            <div className="w-6 h-4 bg-neutral-700 rounded" />
                            {/* Code content */}
                            <div
                                className="h-4 bg-neutral-700 rounded"
                                style={{ width: `${20 + Math.random() * 60}%` }}
                            />
                        </motion.div>
                    ))}
                </div>

                {/* Right sidebar skeleton (chat preview) */}
                <div className="w-64 bg-neutral-850 border-l border-neutral-800 p-3 hidden lg:block">
                    <div className="h-4 w-16 bg-neutral-700 rounded animate-pulse mb-4" />
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0.3 }}
                                animate={{ opacity: [0.3, 0.5, 0.3] }}
                                transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.15 }}
                                className="p-3 bg-neutral-800 rounded-lg space-y-2"
                            >
                                <div className="h-3 w-full bg-neutral-700 rounded" />
                                <div className="h-3 w-3/4 bg-neutral-700 rounded" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Terminal skeleton at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-neutral-850 border-t border-neutral-800 p-3">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500/50" />
                    <div className="h-3 w-16 bg-neutral-700 rounded animate-pulse" />
                </div>
                <div className="space-y-1">
                    <div className="h-3 w-48 bg-neutral-700 rounded animate-pulse" />
                    <div className="h-3 w-32 bg-neutral-700 rounded animate-pulse" />
                </div>
            </div>
        </div>
    );
}

export default CodeWindowSkeleton;
