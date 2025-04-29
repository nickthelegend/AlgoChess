"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Chessboard } from "@/components/chessboard"
import { ComputerGameInfo } from "@/components/computer-game-info"
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
import { toast } from "@/hooks/use-toast"
import { Chess } from "chess.js"
import { makeComputerMove } from "@/lib/computer-ai"
import { useWallet } from "@txnlab/use-wallet-react"
import { useWalletModal } from "@/hooks/use-wallet-modal"
import { Wallet } from "lucide-react"

export default function ComputerGamePage() {
  const router = useRouter()
  const [game, setGame] = useState<Chess>(new Chess())
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white")
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const [isThinking, setIsThinking] = useState(false)
  const [showNewGameDialog, setShowNewGameDialog] = useState(false)
  const [gameResult, setGameResult] = useState<string | null>(null)
  const { activeAccount } = useWallet()
  const { openModal } = useWalletModal()

  // Redirect to home if wallet is not connected
  useEffect(() => {
    if (!activeAccount) {
      router.push("/")
    }
  }, [activeAccount, router])

  // Make computer move if it's computer's turn
  useEffect(() => {
    const makeMove = async () => {
      if (
        game &&
        !game.isGameOver() &&
        ((playerColor === "white" && game.turn() === "b") || (playerColor === "black" && game.turn() === "w"))
      ) {
        setIsThinking(true)

        // Add a delay to simulate "thinking" - longer for harder difficulties
        const thinkingTime = difficulty === "easy" ? 300 : difficulty === "medium" ? 800 : 1200

        setTimeout(async () => {
          try {
            // Use the improved AI to get a move
            const computerMove = await makeComputerMove(game, difficulty)

            if (computerMove) {
              // Create a new game instance with the current position
              const newGame = new Chess(game.fen())

              // Make the move
              newGame.move(computerMove)

              // Update the game state
              setGame(newGame)

              // Check for game over after computer move
              checkGameOver(newGame)
            }
          } catch (error) {
            console.error("Error making computer move:", error)

            // Fallback to random move if AI fails
            try {
              const legalMoves = game.moves({ verbose: true })
              if (legalMoves.length > 0) {
                const randomIndex = Math.floor(Math.random() * legalMoves.length)
                const randomMove = legalMoves[randomIndex]

                const newGame = new Chess(game.fen())
                newGame.move(randomMove)
                setGame(newGame)
                checkGameOver(newGame)
              }
            } catch (fallbackError) {
              console.error("Fallback move also failed:", fallbackError)
              toast({
                title: "Error",
                description: "The computer couldn't make a move. Please try again.",
                variant: "destructive",
              })
            }
          } finally {
            setIsThinking(false)
          }
        }, thinkingTime)
      }
    }

    makeMove()
  }, [game, playerColor, difficulty])

  const handleMove = (from: string, to: string, promotion?: string) => {
    try {
      const newGame = new Chess(game.fen())
      newGame.move({
        from,
        to,
        promotion: promotion || undefined,
      })

      setGame(newGame)

      // Check for game over after player move
      checkGameOver(newGame)
    } catch (error) {
      toast({
        title: "Invalid move",
        description: "That move is not allowed",
        variant: "destructive",
      })
    }
  }

  const checkGameOver = (game: Chess) => {
    if (game.isGameOver()) {
      let result = ""

      if (game.isCheckmate()) {
        const winner = game.turn() === "w" ? "Black" : "White"
        result = `Checkmate! ${winner} wins!`
      } else if (game.isDraw()) {
        if (game.isStalemate()) {
          result = "Game over - Stalemate (Draw)"
        } else if (game.isThreefoldRepetition()) {
          result = "Game over - Draw by repetition"
        } else if (game.isInsufficientMaterial()) {
          result = "Game over - Draw by insufficient material"
        } else {
          result = "Game over - Draw"
        }
      }

      setGameResult(result)

      toast({
        title: "Game Over",
        description: result,
      })
    }
  }

  const startNewGame = (color: "white" | "black") => {
    setGame(new Chess())
    setPlayerColor(color)
    setGameResult(null)
    setShowNewGameDialog(false)

    // If player chose black, make computer's first move
    if (color === "black") {
      setTimeout(() => {
        const newGame = new Chess()
        makeComputerMove(newGame, difficulty)
          .then((move) => {
            if (move) {
              newGame.move(move)
              setGame(newGame)
            }
          })
          .catch((error) => {
            console.error("Error making first computer move:", error)
          })
      }, 500)
    }
  }

  const canPlayerMove = () => {
    return (
      !game.isGameOver() &&
      ((playerColor === "white" && game.turn() === "w") || (playerColor === "black" && game.turn() === "b"))
    )
  }

  // If wallet is not connected, show connect wallet prompt
  if (!activeAccount) {
    return (
      <div className="container flex items-center justify-center min-h-screen py-12 px-4">
        <div className="flex flex-col items-center justify-center p-12 max-w-md text-center">
          <div className="bg-muted p-8 rounded-lg mb-6 w-full">
            <Wallet className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6">
              You need to connect your Algorand wallet to play against the computer.
            </p>
            <Button size="lg" onClick={openModal} className="w-full">
              Connect Wallet
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap gap-2 items-center justify-between">
            <div className="flex items-center gap-2">
              <Select value={difficulty} onValueChange={(value: any) => setDifficulty(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => setShowNewGameDialog(true)}>
                New Game
              </Button>
            </div>

            {isThinking && (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm">Computer is thinking...</span>
              </div>
            )}
          </div>

          <Chessboard
            position={game.fen()}
            orientation={playerColor}
            onPieceDrop={(from, to) => handleMove(from, to)}
            isDraggable={canPlayerMove()}
          />
        </div>
        <div>
          <Card>
            <CardContent className="pt-6">
              <ComputerGameInfo
                game={game}
                playerColor={playerColor}
                difficulty={difficulty}
                result={gameResult}
                onNewGame={() => setShowNewGameDialog(true)}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showNewGameDialog} onOpenChange={setShowNewGameDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start New Game</AlertDialogTitle>
            <AlertDialogDescription>Choose which color you want to play as.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => startNewGame("white")}>Play as White</AlertDialogAction>
            <AlertDialogAction onClick={() => startNewGame("black")}>Play as Black</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
