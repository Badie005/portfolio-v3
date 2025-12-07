export function EmptyState() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center select-none animate-in fade-in duration-700 bg-white/50">
            
            {/* Logo en filigrane - Couleur Terracotta très pâle */}
            <div className="text-[#D97757] opacity-10 mb-8 transform hover:scale-105 transition-transform duration-700 ease-out hover:opacity-20">
                <svg width="160" height="200" viewBox="0 0 969 1257" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_157_959)">
                        <g clipPath="url(#clip1_157_959)">
                            <path d="M63.5 967V317H347.5C458.5 317 537.5 386 537.5 483C537.5 551 495.5 609 427.5 629C507.5 649 559.5 711 559.5 791C559.5 894 481.5 967 371.5 967H63.5ZM147.5 885H355.5C423.5 885 473.5 841 473.5 780C473.5 719 423.5 675 355.5 675H147.5V885ZM147.5 595H339.5C404.5 595 451.5 553 451.5 496C451.5 439 404.5 397 339.5 397H147.5V595Z" fill="currentColor" />
                            <path d="M750.5 409.5L769.967 592L860 543.333L787 609.033L969.5 628.5L787 647.967L860 713.667L769.967 665L750.5 847.5L731.033 665L641 713.667L714 647.967L531.5 628.5L714 609.033L641 543.333L731.033 592L750.5 409.5Z" fill="currentColor" />
                        </g>
                    </g>
                    <defs>
                        <clipPath id="clip0_157_959"><rect width="969" height="1257" fill="white" /></clipPath>
                        <clipPath id="clip1_157_959"><rect width="969" height="1257" fill="white" /></clipPath>
                    </defs>
                </svg>
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
