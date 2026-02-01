import Image from 'next/image';

export function EmptyState() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center select-none animate-in fade-in duration-700 bg-white/50">

            {/* Logo en filigrane - Illustration B.AI */}
            <div className="mb-8">
                <Image
                    src="/logo/IDE/Logo-AI-illustration.svg"
                    alt="B.AI"
                    width={180}
                    height={180}
                    priority
                />
            </div>

            {/* Texte & Raccourcis */}
            <div className="text-center space-y-5">

                {/* Titre : Police Serif pour le côté "Editorial" */}
                <h3 className="text-[#2D2A26] font-serif text-lg tracking-wide">
                    Aucun fichier ouvert
                </h3>

                {/* Sous-titre */}
                <p className="text-[#8A8580] text-sm font-light max-w-xs mx-auto leading-relaxed">
                    Sélectionnez un fichier dans l&apos;explorateur <br /> pour voir le code source.
                </p>

                {/* Raccourcis Clavier Stylisés */}
                <div className="flex items-center gap-4 justify-center pt-2">

                    {/* Item 1 */}
                    <div className="flex items-center gap-2 text-xs text-[#8A8580]">
                        <kbd className="bg-white border border-[#E5E0DB] border-b-2 px-2 py-1 rounded-md font-mono text-[#5C5550] shadow-sm min-w-[24px] text-center flex items-center justify-center">
                            ⌘ J
                        </kbd>
                        <span className="opacity-70">Terminal</span>
                    </div>

                    {/* Séparateur visuel léger */}
                    <div className="w-1 h-1 rounded-full bg-[#E5E0DB]" />

                    {/* Item 2 */}
                    <div className="flex items-center gap-2 text-xs text-[#8A8580]">
                        <kbd className="bg-white border border-[#E5E0DB] border-b-2 px-2 py-1 rounded-md font-mono text-[#5C5550] shadow-sm min-w-[24px] text-center flex items-center justify-center">
                            ⌘ P
                        </kbd>
                        <span className="opacity-70">Fichiers</span>
                    </div>

                </div>
            </div>
        </div>
    );
}
