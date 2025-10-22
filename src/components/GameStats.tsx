import { Clock, Target, Trophy } from "lucide-react";

interface GameStatsProps {
  moves: number;
  matches: number;
  totalPairs: number;
  time: number;
}

export const GameStats = ({ moves, matches, totalPairs, time }: GameStatsProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex gap-4 justify-center flex-wrap">
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
        <Clock className="w-5 h-5 text-primary" />
        <span className="font-semibold">{formatTime(time)}</span>
      </div>

      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
        <Target className="w-5 h-5 text-secondary" />
        <span className="font-semibold">{moves} Moves</span>
      </div>

      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
        <Trophy className="w-5 h-5 text-accent" />
        <span className="font-semibold">{matches}/{totalPairs}</span>
      </div>
    </div>
  );
};
