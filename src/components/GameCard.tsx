import { memo } from "react";
import { cn } from "@/lib/utils";

interface GameCardProps {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: () => void;
}

export const GameCard = memo(({ id, emoji, isFlipped, isMatched, onClick }: GameCardProps) => {
  return (
    <button
      onClick={onClick}
      disabled={isFlipped || isMatched}
      className={cn(
        "relative aspect-square rounded-xl transition-all duration-300",
        "hover:scale-105 active:scale-95",
        "disabled:cursor-not-allowed",
        isMatched && "opacity-0 pointer-events-none"
      )}
      style={{ perspective: "1000px" }}
    >
      <div
        className={cn(
          "relative w-full h-full transition-transform duration-500",
          "transform-style-3d",
          isFlipped && "rotate-y-180"
        )}
      >
        {/* Card Back */}
        <div
          className={cn(
            "absolute inset-0 rounded-xl backface-hidden",
            "bg-gradient-to-br from-primary via-accent to-secondary",
            "flex items-center justify-center",
            "shadow-lg border-2 border-primary/20"
          )}
        >
          <div className="text-4xl opacity-50">?</div>
        </div>

        {/* Card Front */}
        <div
          className={cn(
            "absolute inset-0 rounded-xl backface-hidden rotate-y-180",
            "bg-card border-2 border-border",
            "flex items-center justify-center",
            "shadow-xl"
          )}
        >
          <span className="text-5xl">{emoji}</span>
        </div>
      </div>
    </button>
  );
});

GameCard.displayName = "GameCard";
