import { useState, useEffect, useCallback } from "react";
import { GameCard } from "./GameCard";
import { GameStats } from "./GameStats";
import { WinModal } from "./WinModal";
import { Button } from "@/components/ui/button";
import { RotateCcw, Sparkles, Pause, Play } from "lucide-react";
import { toast } from "sonner";

type Difficulty = "easy" | "medium" | "hard";

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const EMOJIS = ["🎮", "🎯", "🎪", "🎨", "🎭", "🎸", "🎺", "🎻", "🎲", "🎰", "🚀", "🛸", "🌟", "⭐", "💎", "🔮"];

const DIFFICULTY_CONFIG = {
  easy: { pairs: 6, gridCols: "grid-cols-4" },
  medium: { pairs: 8, gridCols: "grid-cols-4" },
  hard: { pairs: 12, gridCols: "grid-cols-6" },
};

export const MemoryGame = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showWin, setShowWin] = useState(false);

  const initializeGame = useCallback((diff: Difficulty) => {
    const { pairs } = DIFFICULTY_CONFIG[diff];
    const gameEmojis = EMOJIS.slice(0, pairs);
    const duplicatedEmojis = [...gameEmojis, ...gameEmojis];
    const shuffled = duplicatedEmojis
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setTime(0);
    setIsPlaying(true);
    setIsPaused(false);
    setShowWin(false);
    toast.success(`Game started! Find ${pairs} pairs!`);
  }, []);

  useEffect(() => {
    initializeGame(difficulty);
  }, [difficulty, initializeGame]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && !isPaused) {
      timer = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isPaused]);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      const firstCard = cards[first];
      const secondCard = cards[second];

      if (firstCard.emoji === secondCard.emoji) {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === first || card.id === second
                ? { ...card, isMatched: true, isFlipped: false }
                : card
            )
          );
          setMatches((prev) => prev + 1);
          setFlippedCards([]);
          toast.success("Match found! 🎉");
        }, 500);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === first || card.id === second
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  }, [flippedCards, cards]);

  useEffect(() => {
    const totalPairs = DIFFICULTY_CONFIG[difficulty].pairs;
    if (matches === totalPairs && matches > 0) {
      setIsPlaying(false);
      setTimeout(() => setShowWin(true), 500);
    }
  }, [matches, difficulty]);

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2 || flippedCards.includes(id) || isPaused) return;

    setCards((prev) =>
      prev.map((card) =>
        card.id === id ? { ...card, isFlipped: true } : card
      )
    );
    setFlippedCards((prev) => [...prev, id]);

    if (flippedCards.length === 0) {
      setMoves((prev) => prev + 1);
    }
  };

  const totalPairs = DIFFICULTY_CONFIG[difficulty].pairs;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[hsl(var(--game-bg-start))] to-[hsl(var(--game-bg-end))]">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Memory Master
          </h1>
          <p className="text-muted-foreground">Test your memory and match all the pairs!</p>
        </div>

        {/* Difficulty Selector */}
        <div className="flex gap-2 justify-center flex-wrap">
          {(["easy", "medium", "hard"] as Difficulty[]).map((diff) => (
            <Button
              key={diff}
              onClick={() => {
                setDifficulty(diff);
                initializeGame(diff);
              }}
              variant={difficulty === diff ? "default" : "outline"}
              className="capitalize"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {diff}
            </Button>
          ))}
          <Button onClick={() => initializeGame(difficulty)} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          {isPlaying && (
            <Button
              onClick={() => {
                setIsPaused(!isPaused);
                toast.success(isPaused ? "Game resumed!" : "Game paused!");
              }}
              variant={isPaused ? "default" : "outline"}
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              )}
            </Button>
          )}
        </div>

        {/* Stats */}
        <GameStats moves={moves} matches={matches} totalPairs={totalPairs} time={time} />

        {/* Game Board */}
        <div className={`grid ${DIFFICULTY_CONFIG[difficulty].gridCols} gap-4 max-w-3xl mx-auto`}>
          {cards.map((card) => (
            <GameCard
              key={card.id}
              id={card.id}
              emoji={card.emoji}
              isFlipped={card.isFlipped}
              isMatched={card.isMatched}
              onClick={() => handleCardClick(card.id)}
            />
          ))}
        </div>
      </div>

      {/* Win Modal */}
      <WinModal
        isOpen={showWin}
        moves={moves}
        time={time}
        onPlayAgain={() => initializeGame(difficulty)}
      />
    </div>
  );
};
