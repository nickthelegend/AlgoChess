"use client"

import { useEffect, useState, useCallback, useRef } from "react"
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
import { use } from "react"
import { Chess } from "chess.js"

export default function GamePage({ params }: { params: Promise<{ id: string }> }) {
  // Properly unwrap params using React.use()
  const resolvedParams = use(params)
  const gameId = resolvedParams.id

  const router = useRouter()
  const { gameState, setGameState, playerColor, setPlayerColor, playerName } = useGameState()
  const [isLoading, setIsLoading] = useState(true)
  const [showResignDialog, setShowResignDialog] = useState(false)

  // Local chess instance for immediate updates
  const [localPosition, setLocalPosition] = useState<string | null>(null)
  const [isMoving, setIsMoving] = useState(false)

  // Track the last server FEN to detect changes
  const lastServerFenRef = useRef<string | null>(null)

  // Ref to prevent auto-scrolling
  const pageRef = useRef<HTMLDivElement>(null)
  const scrollPositionRef = useRef<number>(0)

  // Save scroll position before updates
  const saveScrollPosition = useCallback(() => {
    if (typeof window !== "undefined") {
      scrollPositionRef.current = window.scrollY
    }
  }, [])

  // Restore scroll position after updates
  const restoreScrollPosition = useCallback(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, scrollPositionRef.current)
    }
  }, [])

  // Poll for game state updates
  useEffect(() => {
    let intervalId: NodeJS.Timeout

    const pollGameState = async () => {
      try {
        // Save current scroll position
        saveScrollPosition()

        const state = await fetchGameState(gameId)
        if (state) {
          // Check if the server FEN has changed
          const serverFenChanged = lastServerFenRef.current !== state.fen

          // Update the last server FEN
          lastServerFenRef.current = state.fen

          // Update the game state
          setGameState(state)

          // Update local position in these cases:
          // 1. If we don't have a local position yet
          // 2. If the server FEN has changed (opponent made a move)
          // 3. If it's not our turn
          if (
            !localPosition ||
            serverFenChanged ||
            (playerColor === "white" && state.turn === "b") ||
            (playerColor === "black" && state.turn === "w")
          ) {
            console.log("Updating local position from server:", state.fen)
            setLocalPosition(state.fen)
          }

          // Set player color if not already set
          if (!playerColor && playerName) {
            if (state.players.white?.name === playerName) {
              setPlayerColor("white")
            } else if (state.players.black?.name === playerName) {
              setPlayerColor("black")
            }
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

        // Restore scroll position after state update
        setTimeout(restoreScrollPosition, 0)
      }
    }

    // Initial fetch
    pollGameState()

    // Set up polling with a shorter interval for more responsive updates
    intervalId = setInterval(pollGameState, 1000)

    return () => {
      clearInterval(intervalId)
    }
  }, [
    gameId,
    playerName,
    playerColor,
    setGameState,
    setPlayerColor,
    localPosition,
    saveScrollPosition,
    restoreScrollPosition,
  ])

  // Optimized move handler with immediate local updates
  const handleMove = useCallback(
    async (from: string, to: string, promotion?: string) => {
      if (!gameState || gameState.result || isMoving) return false

      setIsMoving(true)

      try {
        // Create a local chess instance for immediate update
        const chess = new Chess(gameState.fen)

        // Try the move locally first
        const moveResult = chess.move({
          from,
          to,
          promotion: promotion || undefined,
        })

        if (!moveResult) {
          throw new Error("Invalid move")
        }

        // Update local position immediately for responsive UI
        const newPosition = chess.fen()
        console.log("Setting local position after move:", newPosition)
        setLocalPosition(newPosition)

        // Make the actual move on the server
        await makeMove(gameId, from, to, promotion)

        return true
      } catch (error) {
        console.error("Move error:", error)

        // Reset local position on error
        setLocalPosition(gameState.fen)

        toast({
          title: "Invalid move",
          description: "That move is not allowed",
          variant: "destructive",
        })
        return false
      } finally {
        setIsMoving(false)
      }
    },
    [gameId, gameState, isMoving],
  )

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

  // Use local position for immediate updates if available, otherwise use server position
  const displayPosition = localPosition || gameState.fen

  // Debug info
  console.log("Current display position:", displayPosition)
  console.log("Server position:", gameState.fen)
  console.log("Current turn:", gameState.turn)
  console.log("Player color:", playerColor)

  return (
    <div className="container py-8 px-4" ref={pageRef}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Chessboard
            key={displayPosition} // Force re-render when position changes
            position={displayPosition}
            orientation={playerColor === "black" ? "black" : "white"}
            onPieceDrop={(from, to) => handleMove(from, to)}
            isDraggable={
              !gameState.result &&
              !isMoving &&
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
