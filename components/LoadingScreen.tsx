import { Building2 } from "lucide-react";

interface Props {
  message?: string;
  fullscreen?: boolean;
  fixed?: boolean;
}

export default function LoadingScreen({ message = "Memuat...", fullscreen = true, fixed = false }: Props) {
  return (
    <div
      className={`${
        fullscreen ? "min-h-screen" : "h-full"
      } ${ fixed ? "fixed top-0 bottom-0 left-0 right-0" : "relative" } flex items-center justify-center bg-background overflow-hidden z-50`}
    >
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative flex flex-col items-center gap-5 animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-primary/30 blur-xl animate-pulse" />
          <div className="relative h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
          {/* spinning ring */}
          <div className="absolute -inset-2 rounded-3xl border-2 border-transparent border-t-primary border-r-primary/50 animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-xl font-semibold text-foreground">ASSETRA</p>
          <p className="text-sm text-muted-foreground mt-1">{message}</p>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
