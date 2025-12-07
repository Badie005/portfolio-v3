import { TerminalStatus } from "@/components/ui/TerminalStatus";
import { AnimatedLogo } from "@/components/AnimatedLogo";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FAFAFA] overflow-hidden">
            {/* Technical Grid Background */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-ide-accent/5 rounded-full blur-[120px] animate-pulse pointer-events-none" />

            <div className="relative flex flex-col items-center gap-10 z-10">
                {/* Brand Logo Animation */}
                <div className="scale-[2] mb-2">
                    <AnimatedLogo loopPingPong={true} />
                </div>

                {/* System Boot Sequence */}
                <div className="flex flex-col items-center gap-6">
                    <TerminalStatus
                        texts={[
                            "Abdelbadie Khoubiza",
                            "Full-Stack Developer",
                            "Loading Portfolio v3.02...",
                            "Welcome.",
                            "B.411 x B.DEV"
                        ]}
                        className="!bg-white/50 !backdrop-blur-xl !border-black/5 shadow-2xl scale-110"
                    />

                    {/* Minimal Progress Line */}
                    <div className="w-48 h-[2px] bg-black/5 rounded-full overflow-hidden">
                        <div className="h-full bg-ide-accent animate-[loading_2.5s_ease-in-out_infinite] w-full origin-left" />
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes loading {
          0% { transform: scaleX(0); transform-origin: left; }
          50% { transform: scaleX(0.7); transform-origin: left; }
          100% { transform: scaleX(0); transform-origin: right; }
        }
      `}</style>
        </div>
    );
}
