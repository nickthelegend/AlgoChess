"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User } from "lucide-react"

interface GameInfoProps {
  gameState: any
  playerColor: string | null
  onResign: () => void
}

export function GameInfo({ gameState, playerColor, onResign }: GameInfoProps) {
  if (!gameState) return null

  const isPlayerTurn =
    (playerColor === "white" && gameState.turn === "w") || (playerColor === "black" && gameState.turn === "b")

  const getResultMessage = () => {
    if (!gameState.result) return null

    if (gameState.result === "checkmate") {
      return `Checkmate! ${gameState.turn === "w" ? "Black" : "White"} wins!`
    } else if (gameState.result === "draw") {
      return "Game ended in a draw!"
    } else if (gameState.result === "resignation") {
      return `${gameState.resignedBy === "w" ? "White" : "Black"} resigned. ${gameState.resignedBy === "w" ? "Black" : "White"} wins!`
    }

    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-white border border-gray-300"></div>
              <span className="font-medium">White</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{gameState.players.white?.name || "Waiting..."}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-black"></div>
              <span className="font-medium">Black</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{gameState.players.black?.name || "Waiting..."}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Current Turn</span>
          <Badge variant={isPlayerTurn ? "default" : "outline"}>{gameState.turn === "w" ? "White" : "Black"}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Move Number</span>
          <span>{Math.floor(gameState.moveNumber / 2) + (gameState.moveNumber % 2)}</span>
        </div>

        {gameState.result ? (
          <div className="mt-4 p-3 bg-muted rounded-md text-center">
            <p className="font-medium">{getResultMessage()}</p>
          </div>
        ) : (
          <div className="flex justify-center mt-4">
            <Button variant="destructive" size="sm" onClick={onResign} disabled={!playerColor || gameState.result}>
              Resign
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
