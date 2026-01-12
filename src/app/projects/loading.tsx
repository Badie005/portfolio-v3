export default function ProjectsLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 py-20 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header skeleton */}
                <div className="text-center mb-12">
                    <div className="h-10 w-64 bg-neutral-200 rounded-lg mx-auto mb-4 animate-pulse" />
                    <div className="h-5 w-96 bg-neutral-200 rounded mx-auto animate-pulse" />
                </div>

                {/* Projects grid skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-200"
                        >
                            {/* Image skeleton */}
                            <div className="h-48 bg-neutral-200 animate-pulse" />

                            {/* Content skeleton */}
                            <div className="p-6 space-y-3">
                                <div className="h-6 w-3/4 bg-neutral-200 rounded animate-pulse" />
                                <div className="h-4 w-full bg-neutral-100 rounded animate-pulse" />
                                <div className="h-4 w-2/3 bg-neutral-100 rounded animate-pulse" />

                                {/* Tags skeleton */}
                                <div className="flex gap-2 pt-2">
                                    <div className="h-6 w-16 bg-neutral-100 rounded-full animate-pulse" />
                                    <div className="h-6 w-20 bg-neutral-100 rounded-full animate-pulse" />
                                    <div className="h-6 w-14 bg-neutral-100 rounded-full animate-pulse" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
