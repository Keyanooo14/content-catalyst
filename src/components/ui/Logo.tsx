import { Sparkles } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const textClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 blur-lg" />
        <Sparkles className={`${sizeClasses[size]} text-primary relative`} />
      </div>
      {showText && (
        <span className={`${textClasses[size]} font-bold tracking-tight`}>
          Repurposer
        </span>
      )}
    </div>
  );
}
