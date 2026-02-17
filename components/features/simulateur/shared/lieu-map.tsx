"use client"

export function LieuMap() {
  return (
    <div className="rounded-2xl border shadow-sm bg-white overflow-hidden p-4 md:p-6">
      <p className="font-heading uppercase text-xs font-bold tracking-wider text-muted-foreground mb-3">
        Plan du domaine
      </p>
      <div className="aspect-square rounded-lg bg-[#2A4A51]/5 flex items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full text-muted-foreground/20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Terrain outline */}
          <path
            d="M30 160 C30 160 25 100 40 70 C55 40 80 30 110 28 C140 26 165 45 175 70 C185 95 180 140 170 160 Z"
            fill="currentColor"
            opacity="0.3"
          />
          {/* Main building */}
          <rect x="75" y="65" width="50" height="35" rx="3" fill="currentColor" opacity="0.6" />
          <rect x="85" y="55" width="30" height="10" rx="2" fill="currentColor" opacity="0.5" />
          {/* Secondary buildings */}
          <rect x="45" y="95" width="25" height="18" rx="2" fill="currentColor" opacity="0.4" />
          <rect x="130" y="90" width="25" height="18" rx="2" fill="currentColor" opacity="0.4" />
          {/* Paths */}
          <path
            d="M100 100 L70 105 M100 100 L142 99"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            opacity="0.3"
          />
          {/* Trees */}
          <circle cx="50" cy="55" r="6" fill="currentColor" opacity="0.25" />
          <circle cx="155" cy="55" r="5" fill="currentColor" opacity="0.25" />
          <circle cx="40" cy="130" r="7" fill="currentColor" opacity="0.25" />
          <circle cx="160" cy="130" r="6" fill="currentColor" opacity="0.25" />
          <circle cx="100" cy="140" r="5" fill="currentColor" opacity="0.25" />
          <circle cx="65" cy="145" r="4" fill="currentColor" opacity="0.2" />
          <circle cx="140" cy="148" r="5" fill="currentColor" opacity="0.2" />
        </svg>
      </div>
      <p className="text-[10px] text-muted-foreground/50 text-center mt-2">
        Carte interactive disponible prochainement
      </p>
    </div>
  )
}
