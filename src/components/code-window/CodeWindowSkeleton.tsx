'use client';

/**
 * Skeleton placeholder for CodeWindow component during lazy loading.
 * Matches the actual IDE design with proper theme variables.
 */
export function CodeWindowSkeleton() {
    return (
        <div className="relative w-full h-full max-w-full bg-ide-bg rounded-xl shadow-2xl flex flex-col overflow-hidden border border-white/40 ring-1 ring-black/5">

            {/* ===== TITLE BAR ===== */}
            <div className="h-10 bg-ide-titlebar flex items-center px-4 shrink-0 border-b border-ide-border">
                {/* Traffic lights */}
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse" />
                    <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                </div>
                {/* Title placeholder */}
                <div className="flex-1 flex justify-center">
                    <div className="h-4 w-40 bg-ide-border rounded animate-pulse" />
                </div>
            </div>

            {/* ===== MAIN LAYOUT ===== */}
            <div className="flex-1 flex overflow-hidden min-h-0">

                {/* ===== LEFT SIDEBAR ===== */}
                <aside className="w-48 h-full bg-ide-bg border-r border-ide-border p-3 shrink-0">
                    {/* Explorer title */}
                    <div className="h-4 w-28 bg-ide-border rounded animate-pulse mb-4" />

                    {/* File tree skeleton */}
                    <div className="space-y-2">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 animate-pulse"
                                style={{
                                    animationDelay: `${i * 100}ms`,
                                    paddingLeft: i === 0 || i === 4 ? '0' : '12px'
                                }}
                            >
                                <div className="w-4 h-4 bg-ide-border rounded" />
                                <div
                                    className="h-3 bg-ide-border rounded"
                                    style={{ width: `${50 + (i * 7) % 40}%` }}
                                />
                            </div>
                        ))}
                    </div>
                </aside>

                {/* ===== CENTER: EDITOR ===== */}
                <main className="flex-1 flex flex-col bg-white overflow-hidden min-w-0 min-h-0">

                    {/* Tab bar skeleton */}
                    <div className="h-9 bg-ide-tabs border-b border-ide-border flex items-end px-2 shrink-0">
                        <div className="h-8 w-28 bg-ide-bg rounded-t border border-b-0 border-ide-border flex items-center justify-center gap-2 px-3 animate-pulse">
                            <div className="w-4 h-4 bg-ide-border rounded" />
                            <div className="h-3 w-16 bg-ide-border rounded" />
                        </div>
                        <div className="h-7 w-24 bg-ide-tabs flex items-center justify-center gap-2 px-3 animate-pulse ml-1" style={{ animationDelay: '150ms' }}>
                            <div className="w-4 h-4 bg-ide-border rounded" />
                            <div className="h-3 w-14 bg-ide-border rounded" />
                        </div>
                    </div>

                    {/* Editor content skeleton */}
                    <div className="flex-1 p-4 space-y-2 overflow-hidden">
                        {Array.from({ length: 14 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-4 animate-pulse"
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                {/* Line number */}
                                <div className="w-6 h-4 bg-neutral-100 rounded text-right" />
                                {/* Code content - varying widths */}
                                <div
                                    className="h-4 bg-neutral-100 rounded"
                                    style={{ width: `${20 + ((i * 17) % 60)}%` }}
                                />
                            </div>
                        ))}
                    </div>
                </main>

                {/* ===== RIGHT SIDEBAR (Chat) ===== */}
                <aside className="w-64 h-full bg-ide-bg border-l border-ide-border flex-col hidden lg:flex shrink-0">
                    {/* Chat header */}
                    <div className="h-12 border-b border-ide-border flex items-center px-4">
                        <div className="h-4 w-20 bg-ide-border rounded animate-pulse" />
                    </div>

                    {/* Chat messages skeleton */}
                    <div className="flex-1 p-3 space-y-3 overflow-hidden">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="p-3 bg-neutral-50 rounded-lg space-y-2 animate-pulse"
                                style={{ animationDelay: `${i * 200}ms` }}
                            >
                                <div className="h-3 w-full bg-ide-border rounded" />
                                <div className="h-3 w-4/5 bg-ide-border rounded" />
                                {i === 0 && <div className="h-3 w-2/3 bg-ide-border rounded" />}
                            </div>
                        ))}
                    </div>

                    {/* Input skeleton */}
                    <div className="h-14 border-t border-ide-border p-2">
                        <div className="h-full w-full bg-neutral-50 rounded-lg animate-pulse" />
                    </div>
                </aside>
            </div>

            {/* ===== STATUS BAR ===== */}
            <div className="h-6 bg-ide-statusbar border-t border-ide-border flex items-center justify-between px-4 shrink-0">
                <div className="h-3 w-20 bg-ide-border rounded animate-pulse" />
                <div className="h-3 w-32 bg-ide-border rounded animate-pulse" />
            </div>
        </div>
    );
}

export default CodeWindowSkeleton;
