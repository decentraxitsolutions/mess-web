import React from "react";

export default function FoodBackground() {
  return (
    <div className="fixed inset-0 -z-50 w-full h-full overflow-hidden bg-slate-50/50 pointer-events-none select-none">
      {/* Subtle Food Doodle repeating pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04] text-indigo-950" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="food-pattern" width="160" height="160" patternUnits="userSpaceOnUse">
            {/* Burger */}
            <path d="M20 40 Q40 25 60 40 M20 45 L60 45 M18 50 Q40 55 62 50 M25 55 L55 55" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            {/* Pizza */}
            <path d="M120 30 L100 70 L140 70 Z M110 50 A 2 2 0 1 0 110 50.1 M125 60 A 2 2 0 1 0 125 60.1" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            {/* Cup of Coffee/Tea */}
            <path d="M110 120 L130 120 L127 138 Q120 142 110 138 Z M130 123 Q136 125 129 130" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            {/* Apple */}
            <path d="M25 125 Q15 110 25 102 Q35 110 25 125 Z M25 102 Q27 92 32 95" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            {/* Fork & Spoon */}
            <path d="M140 30 L140 55 M136 30 L136 38 M144 30 L144 38 M150 30 Q156 30 156 42 L150 42 Z M153 42 L153 55" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            {/* Donut */}
            <circle cx="70" cy="110" r="12" fill="none" stroke="currentColor" strokeWidth="1.2"/>
            <circle cx="70" cy="110" r="4" fill="none" stroke="currentColor" strokeWidth="1.2"/>
            {/* Chef Hat */}
            <path d="M65 48 L85 48 L85 44 Q75 40 65 44 Z M68 44 Q63 26 75 30 Q87 26 82 44" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#food-pattern)" />
      </svg>

      {/* Floating larger, elegant vector food doodles at the sides (Hidden on Mobile) */}
      
      {/* Top Left: Pizza Slice */}
      <div className="absolute top-[10%] left-[3%] hidden xl:block text-indigo-500/10 animate-float-gentle select-none pointer-events-none">
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M30 15 L70 15 L50 85 Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="45" cy="30" r="4" fill="currentColor"/>
          <circle cx="55" cy="45" r="3.5" fill="currentColor"/>
          <circle cx="48" cy="60" r="3" fill="currentColor"/>
        </svg>
      </div>

      {/* Middle Right: Tea Cup */}
      <div className="absolute top-[35%] right-[2%] hidden xl:block text-indigo-500/10 animate-float-reverse select-none pointer-events-none">
        <svg width="90" height="90" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 35 H70 L65 75 A15 15 0 0 1 50 90 H40 A15 15 0 0 1 25 75 Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M70 45 C78 45 83 50 80 60 C78 67 70 67 70 67" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M30 15 Q35 25 35 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M45 12 Q50 25 50 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M60 15 Q65 25 65 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Bottom Left: Burger */}
      <div className="absolute bottom-[15%] left-[2%] hidden xl:block text-indigo-500/10 animate-float-reverse select-none pointer-events-none">
        <svg width="105" height="105" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 50 C15 25 85 25 85 50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 58 H90" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M20 50 H80" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M15 58 C15 75 85 75 85 58" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          {/* Seeds */}
          <path d="M35 38 H38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M50 34 H53" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M65 38 H68" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Bottom Right: Salad Bowl */}
      <div className="absolute bottom-[8%] right-[4%] hidden xl:block text-indigo-500/10 animate-float-gentle select-none pointer-events-none">
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 40 C15 70 85 70 85 40 Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 40 Q25 30 40 38 Q60 30 75 40 Q90 35 90 40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M45 40 Q55 20 62 38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M30 40 Q35 25 40 38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
}
