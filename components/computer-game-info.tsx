"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Cpu, User } from "lucide-react"

interface ComputerGameInfoProps {
  game: any
  playerColor: "white" | "black"
  difficulty: string
  result: string | null
  onNewGame: () => void
}

export function ComputerGameInfo({ game, playerColor, difficulty, result, onNewGame }: ComputerGameInfoProps) {
  if (!game) return null

  const isPlayerTurn =
    (playerColor === "white" && game.turn() === "w") || (playerColor === "black" && game.turn() === "b")

  const difficultyColor = {
    easy: "bg-green-500",
    medium: "bg-yellow-500",
    hard: "bg-red-500",
  }

  // Helper function to get move number
  const getMoveNumber = () => {
    try {
      return Math.floor(game.moveNumber() / 2) + 1
    } catch (error) {
      // Fallback in case moveNumber() is not available
      return Math.floor(game.history().length / 2) + 1
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-medium">Players</h3>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-white border border-gray-300"></div>
              <span className="font-medium">White</span>
            </div>
            <div className="flex items-center gap-2">
              {playerColor === "white" ? (
                <>
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>You</span>
                </>
              ) : (
                <>
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                  <span>Computer</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-black"></div>
              <span className="font-medium">Black</span>
            </div>
            <div className="flex items-center gap-2">
              {playerColor === "black" ? (
                <>
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>You</span>
                </>
              ) : (
                <>
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                  <span>Computer</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Game Info</h3>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Difficulty</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${difficultyColor[difficulty] || "bg-gray-500"}`}></div>
              <span className="capitalize">{difficulty}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Turn</span>
            <Badge variant={isPlayerTurn ? "default" : "outline"}>{game.turn() === "w" ? "White" : "Black"}</Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Move Number</span>
            <span>{getMoveNumber()}</span>
          </div>
        </div>
      </div>

      {result && (
        <div className="p-3 bg-muted rounded-md text-center">
          <p className="font-medium">{result}</p>
          <Button variant="outline" size="sm" onClick={onNewGame} className="mt-2">
            New Game
          </Button>
        </div>
      )}
    </div>
  )
}
