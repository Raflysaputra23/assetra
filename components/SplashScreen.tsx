"use client"

import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";

interface Props {
  duration: number;
}

export default function SplashScreen({ duration = 10000 }: Props) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setExiting(true);
    }, duration);
    return () => clearTimeout(timeout);
  }, [duration]);

  return (
    <div
      className={`fixed inset-0 z-100 flex items-center justify-center gradient-hero overflow-hidden transition-opacity duration-500 ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* glowing orbs */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-pulse" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }} />

      <div className="relative flex flex-col items-center gap-6 text-primary-foreground animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-white/30 blur-2xl animate-pulse" />
          <div className="relative h-24 w-24 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-2xl">
            <Building2 className="h-12 w-12" strokeWidth={1.8} />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-extrabold tracking-tight drop-shadow-lg">ASSETRA</h1>
          <p className="text-xs uppercase tracking-[0.4em] opacity-90">Assets Era</p>
        </div>
        <p className="text-sm opacity-80 italic">Manajemen Aset Kampus Era Digital</p>

        {/* loader bar */}
        <div className="mt-4 h-1 w-48 rounded-full bg-white/20 overflow-hidden">
          <div className="h-full w-1/3 bg-white rounded-full animate-[loadingBar_1.4s_ease-in-out_infinite]" />
        </div>
      </div>

      <style>{`
        @keyframes loadingBar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}
