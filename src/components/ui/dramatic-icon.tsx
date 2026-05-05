import { cn } from "@/lib/utils";
import React from "react";

function DramaticIcon({ className }: { className?: string }) {
  return (
    <div className={cn("relative mb-12", className)}>
      <div className="w-32 h-32 mx-auto mb-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-400 rounded-full animate-pulse"></div>
        <div className="relative w-full h-full bg-gradient-to-br from-gray-100 to-gray-300 rounded-full flex items-center justify-center border-4 border-white shadow-pink-950/10 shadow-2xl">
          <svg
            className="w-16 h-16 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.006-5.5-2.5"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>
      {/* Floating @ symbols */}
      <div className="absolute top-0 -left-8 text-6xl text-purple-300 opacity-30 animate-bounce animation-delay-1000">
        @
      </div>
      <div className="absolute bottom-0 right-2 text-4xl text-pink-300 opacity-40 animate-bounce animation-delay-2000">
        @
      </div>
    </div>
  );
}

export default DramaticIcon;
