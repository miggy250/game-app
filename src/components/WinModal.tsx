import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trophy, RotateCcw } from "lucide-react";

interface WinModalProps {
  isOpen: boolean;
  moves: number;
  time: number;
  onPlayAgain: () => void;
}

export const WinModal = ({ isOpen, moves, time, onPlayAgain }: WinModalProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/10 animate-scale-in">
              <Trophy className="w-16 h-16 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-3xl text-center font-bold">
            You Won! 🎉
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">Congratulations!</p>
            <div className="flex justify-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{moves}</div>
                <div className="text-sm text-muted-foreground">Moves</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">{formatTime(time)}</div>
                <div className="text-sm text-muted-foreground">Time</div>
              </div>
            </div>
          </div>

          <Button 
            onClick={onPlayAgain} 
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
            size="lg"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Play Again
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
