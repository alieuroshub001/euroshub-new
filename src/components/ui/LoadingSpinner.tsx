"use client"

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-cyan-200 border-t-cyan-500 animate-spin"></div>
        <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-transparent border-r-cyan-400 animate-spin animation-delay-150"></div>
        <div className="absolute inset-1 w-10 h-10 rounded-full border-2 border-cyan-300 border-b-transparent animate-spin animation-delay-300 animate-reverse"></div>
      </div>
    </div>
  );
}