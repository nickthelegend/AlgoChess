import { Badge } from "@/components/ui/badge"
import { AlertCircle, Award, BrainCircuit } from "lucide-react"

interface PuzzleInfoProps {
  puzzle: any
  isComplete: boolean
  showHint: boolean
  onShowHint: () => void
}

export function PuzzleInfo({ puzzle, isComplete, showHint, onShowHint }: PuzzleInfoProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Difficulty</span>
          <Badge variant="outline" className="capitalize">
            {puzzle.difficulty}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Rating</span>
          <div className="flex items-center gap-1">
            <Award className="h-4 w-4 text-yellow-500" />
            <span>{puzzle.rating}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Theme</span>
          <Badge variant="secondary" className="capitalize">
            {puzzle.theme}
          </Badge>
        </div>
      </div>

      {isComplete ? (
        <div className="p-3 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-md">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            <p className="font-medium">Puzzle Solved!</p>
          </div>
          <p className="text-sm mt-1">Great job! You found the correct solution.</p>
        </div>
      ) : showHint ? (
        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-md">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" />
            <p className="font-medium">Hint Activated</p>
          </div>
          <p className="text-sm mt-1">Look for the highlighted move on the board.</p>
        </div>
      ) : (
        <div className="p-3 bg-muted rounded-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            <p className="font-medium">Instructions</p>
          </div>
          <p className="text-sm mt-1">
            Find the best move for {puzzle.playerColor === "white" ? "White" : "Black"}.
            {puzzle.objective && ` Your goal: ${puzzle.objective}.`}
          </p>
        </div>
      )}
    </div>
  )
}
