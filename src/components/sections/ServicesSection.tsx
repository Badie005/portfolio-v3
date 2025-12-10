import Image from "next/image";
import { TerminalStatus } from "@/components/ui/TerminalStatus";

const services = [
    {
        icon: "/icons/code-icon.svg",
        title: "Frontend Development",
        description: "Création d'interfaces réactives et modernes avec React, Next.js et Tailwind CSS. Je transforme vos designs en code pixel-perfect.",
    },
    {
        icon: "/icons/globe-icon.svg",
        title: "Responsive Design",
        description: "Des sites web qui s'adaptent parfaitement à tous les écrans, du mobile au desktop, pour une expérience utilisateur fluide partout.",
    },
    {
        icon: "/icons/server-icon.svg",
        title: "Backend Solutions",
        description: "Architecture robuste et évolutive. API RESTful, bases de données et logique serveur sécurisée pour propulser vos applications.",
    },
    {
        icon: "/icons/sparkles-icon.svg",
        title: "UI/UX Design",
        description: "Conception centrée utilisateur. Je crée des maquettes intuitives et esthétiques qui mettent en valeur votre marque.",
    },
    {
        icon: "/icons/bar-graph-icon.svg",
        title: "SEO Optimization",
        description: "Optimisation technique pour les moteurs de recherche. J'assure que votre site est visible et performant.",
    },
    {
        icon: "/icons/workflow-icon.svg",
        title: "Performance",
        description: "Sites ultra-rapides et optimisés. Je veille à ce que chaque milliseconde compte pour retenir vos visiteurs.",
    }
];

export function ServicesSection() {
    return (
        <section className="py-24 lg:py-32 relative overflow-hidden" id="services">

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* Section Header */}
                <div className="mb-16 lg:mb-24 max-w-2xl">
                    <TerminalStatus texts={["Loading services...", "Fetching expertise...", "Scanning modules..."]} className="mb-6 animate-fade-in" />

                    <h2 className="text-4xl lg:text-5xl font-medium text-ide-accent mb-6 font-heading tracking-tight animate-fade-in">
                        Mes Expertises
                    </h2>
                    <p className="text-lg text-ide-muted leading-relaxed font-body animate-fade-in animation-delay-100">
                        J&apos;accompagne mes clients de la conception à la mise en ligne, avec une approche technique rigoureuse et un sens aigu du détail.
                    </p>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className="group relative p-8 rounded-2xl border border-white/30 shadow-sm hover:shadow-xl transition-all duration-500 ease-out animate-fade-in-up overflow-hidden backdrop-blur-md bg-white/40 hover:bg-white/50 hover:border-ide-accent/40"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Top accent border - subtle */}
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ide-accent/40 to-transparent" />

                            {/* Animated bottom border on hover */}
                            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ide-accent/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                            {/* Glass shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-60 pointer-events-none" />

                            {/* Hover glow */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-ide-accent/0 via-ide-accent/10 to-ide-accent/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none" />

                            <div className="relative z-10">
                                <div className="w-12 h-12 flex items-center justify-center mb-6 rounded-xl bg-white/50 backdrop-blur-sm border border-white/30">
                                    <Image
                                        src={service.icon}
                                        alt={service.title}
                                        width={24}
                                        height={24}
                                        className="w-6 h-6"
                                    />
                                </div>

                                <h3 className="text-xl font-semibold text-brand mb-3 font-heading tracking-tight">
                                    {service.title}
                                </h3>

                                <p className="text-ide-muted leading-relaxed text-base font-body">
                                    {service.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
