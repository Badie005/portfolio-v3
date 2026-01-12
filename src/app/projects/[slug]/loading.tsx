export default function ProjectDetailLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 py-20 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Back button skeleton */}
                <div className="h-10 w-32 bg-neutral-200 rounded-lg mb-8 animate-pulse" />

                {/* Hero image skeleton */}
                <div className="h-80 w-full bg-neutral-200 rounded-2xl mb-8 animate-pulse" />

                {/* Title skeleton */}
                <div className="h-10 w-3/4 bg-neutral-200 rounded-lg mb-4 animate-pulse" />

                {/* Description skeleton */}
                <div className="space-y-3 mb-8">
                    <div className="h-5 w-full bg-neutral-100 rounded animate-pulse" />
                    <div className="h-5 w-full bg-neutral-100 rounded animate-pulse" />
                    <div className="h-5 w-2/3 bg-neutral-100 rounded animate-pulse" />
                </div>

                {/* Tech stack skeleton */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-8 w-24 bg-neutral-200 rounded-full animate-pulse"
                        />
                    ))}
                </div>

                {/* Content sections skeleton */}
                <div className="space-y-6">
                    <div className="h-8 w-48 bg-neutral-200 rounded-lg animate-pulse" />
                    <div className="space-y-3">
                        <div className="h-4 w-full bg-neutral-100 rounded animate-pulse" />
                        <div className="h-4 w-full bg-neutral-100 rounded animate-pulse" />
                        <div className="h-4 w-3/4 bg-neutral-100 rounded animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
}
