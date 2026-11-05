import { useEffect, useState } from "react";

interface LoadingScreenProps {
  message?: string;
  onComplete?: () => void;
  speed?: number;
}

export default function LoadingScreen({
  message = "Authenticating & Launching Dashboard...",
  onComplete,
  speed = 90,
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          onComplete?.();
          return 100;
        }
        // Smooth random increment matching video playback
        const step = Math.floor(Math.random() * 12) + 7;
        return Math.min(prev + step, 100);
      });
    }, speed);

    return () => clearInterval(interval);
  }, [speed, onComplete]);

  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none animate-in fade-in duration-300"
      style={{
        background: "radial-gradient(circle at 50% 35%, #185eb8 0%, #05358a 70%, #032563 100%)",
      }}
    >
      <div className="relative flex flex-col items-center justify-center max-w-lg w-full px-6 text-center animate-in zoom-in-95 duration-400">
        {/* Loading Branding Graphic */}
        <img
          src="/Loading.jpg"
          alt="ChatDr - A doctor when you need one"
          className="w-full max-w-md h-auto object-contain rounded-2xl shadow-2xl drop-shadow-[0_20px_35px_rgba(0,0,0,0.35)]"
        />

        {/* Animated Progress Bar (Matching Video) */}
        <div className="mt-7 w-full max-w-xs sm:max-w-sm flex flex-col items-center">
          <div className="w-full h-3 rounded-full bg-white/15 border border-white/20 p-0.5 overflow-hidden backdrop-blur-sm shadow-inner relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 via-white to-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.8)] transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Status text & percentage counter */}
          <div className="mt-3 flex items-center justify-between w-full text-xs font-medium text-sky-100/90 px-1">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-300 animate-pulse" />
              {message}
            </span>
            <span className="font-mono text-sky-200 font-semibold">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

