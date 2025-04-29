"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Chessboard } from "@/components/chessboard"
import { GameInfo } from "@/components/game-info"
import { GameChat } from "@/components/game-chat"
import { useGameState } from "@/lib/game-state"
import { fetchGameState, makeMove, resignGame } from "@/lib/actions"
import { toast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function GamePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const gameId = params.id
  const { gameState, setGameState, playerColor, setPlayerColor, playerName } = useGameState()
  const [isLoading, setIsLoading] = useState(true)
  const [showResignDialog, setShowResignDialog] = useState(false)

  // Poll for game state updates
  useEffect(() => {
    let intervalId: NodeJS.Timeout

    const pollGameState = async () => {
      try {
        const state = await fetchGameState(gameId)
        if (state) {
          setGameState(state)

          // Set player color if not already set
          if (!playerColor && playerName) {
            if (state.players.white?.name === playerName) {
              setPlayerColor("white")
            } else if (state.players.black?.name === playerName) {
              setPlayerColor("black")
            }
            // If player name doesn't match either player, they might be a spectator
          }

          // Show game result notifications
          if (state.result && !state.resultAcknowledged) {
            let resultMessage = ""
            if (state.result === "checkmate") {
              resultMessage = `Checkmate! ${state.turn === "w" ? "Black" : "White"} wins!`
            } else if (state.result === "draw") {
              resultMessage = "Game ended in a draw!"
            } else if (state.result === "resignation") {
              resultMessage = `${state.resignedBy === "w" ? "White" : "Black"} resigned. ${state.resignedBy === "w" ? "Black" : "White"} wins!`
            }

            toast({
              title: "Game Over",
              description: resultMessage,
            })
          }
        }
      } catch (error) {
        console.error("Error fetching game state:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Initial fetch
    pollGameState()

    // Set up polling
    intervalId = setInterval(pollGameState, 2000)

    return () => {
      clearInterval(intervalId)
    }
  }, [gameId, playerName, playerColor, setGameState, setPlayerColor])

  const handleMove = async (from: string, to: string, promotion?: string) => {
    if (!gameState || gameState.result) return

    try {
      await makeMove(gameId, from, to, promotion)
    } catch (error) {
      toast({
        title: "Invalid move",
        description: "That move is not allowed",
        variant: "destructive",
      })
    }
  }

  const handleResign = async () => {
    try {
      await resignGame(gameId, playerColor === "white" ? "w" : "b")
      setShowResignDialog(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resign game",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading game...</p>
        </div>
      </div>
    )
  }

  if (!gameState) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Game Not Found</h2>
          <p className="text-muted-foreground mb-6">This game doesn't exist or has expired.</p>
          <Button onClick={() => router.push("/")}>Return Home</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Chessboard
            position={gameState.fen}
            orientation={playerColor === "black" ? "black" : "white"}
            onPieceDrop={(from, to) => handleMove(from, to)}
            isDraggable={
              !gameState.result &&
              ((playerColor === "white" && gameState.turn === "w") ||
                (playerColor === "black" && gameState.turn === "b"))
            }
          />
        </div>
        <div className="space-y-6">
          <GameInfo gameState={gameState} playerColor={playerColor} onResign={() => setShowResignDialog(true)} />
          <GameChat gameId={gameId} playerName={playerName || ""} />
        </div>
      </div>

      <AlertDialog open={showResignDialog} onOpenChange={setShowResignDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resign Game</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to resign? This will end the game and count as a loss.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResign}>Resign</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
