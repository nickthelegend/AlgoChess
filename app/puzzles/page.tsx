"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Chessboard } from "@/components/chessboard"
import { PuzzleInfo } from "@/components/puzzle-info"
import { toast } from "@/hooks/use-toast"
import { Chess } from "chess.js"
import { fetchRandomPuzzle } from "@/lib/puzzles"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useWallet } from "@txnlab/use-wallet-react"
import { useWalletModal } from "@/hooks/use-wallet-modal"
import { Wallet } from "lucide-react"

export default function PuzzlesPage() {
  const router = useRouter()
  const [puzzle, setPuzzle] = useState<any>(null)
  const [game, setGame] = useState<Chess | null>(null)
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isComplete, setIsComplete] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const { activeAccount } = useWallet()
  const { openModal } = useWalletModal()

  // Redirect to home if wallet is not connected
  useEffect(() => {
    if (!activeAccount) {
      router.push("/")
    } else {
      loadNewPuzzle()
    }
  }, [activeAccount, router])

  const loadNewPuzzle = async () => {
    setIsLoading(true)
    setIsComplete(false)
    setShowHint(false)
    setCurrentMoveIndex(0)

    try {
      const newPuzzle = await fetchRandomPuzzle()
      setPuzzle(newPuzzle)

      // Initialize chess game with the puzzle position
      const newGame = new Chess()
      newGame.load(newPuzzle.fen)

      // Make the first move (the puzzle setup move)
      if (newPuzzle.moves.length > 0) {
        newGame.move(newPuzzle.moves[0])
        setCurrentMoveIndex(1)
      }

      setGame(newGame)
    } catch (error) {
      console.error("Error loading puzzle:", error)
      toast({
        title: "Error",
        description: "Failed to load puzzle. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMove = (from: string, to: string, promotion?: string) => {
    if (!game || !puzzle || isComplete) return

    try {
      // Try to make the player's move
      const moveString = promotion ? `${from}${to}${promotion}` : `${from}${to}`

      // Check if this is the correct move
      if (moveString === puzzle.moves[currentMoveIndex]) {
        // Make the player's move
        game.move({ from, to, promotion: promotion || undefined })

        // If this was the last move in the puzzle
        if (currentMoveIndex === puzzle.moves.length - 1) {
          setIsComplete(true)
          setShowSuccessDialog(true)
          return
        }

        // Make the opponent's response
        game.move(puzzle.moves[currentMoveIndex + 1])

        // Update state
        setGame(new Chess(game.fen()))
        setCurrentMoveIndex(currentMoveIndex + 2)
      } else {
        // Incorrect move
        toast({
          title: "Incorrect move",
          description: "Try again or use a hint",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Invalid move",
        description: "That move is not allowed",
        variant: "destructive",
      })
    }
  }

  const showHintMove = () => {
    if (!puzzle || !game) return

    setShowHint(true)

    const move = puzzle.moves[currentMoveIndex]
    const from = move.substring(0, 2)
    const to = move.substring(2, 4)

    toast({
      title: "Hint",
      description: `Try moving from ${from} to ${to}`,
    })
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
              You need to connect your Algorand wallet to access chess puzzles.
            </p>
            <Button size="lg" onClick={openModal} className="w-full">
              Connect Wallet
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading puzzle...</p>
        </div>
      </div>
    )
  }

  if (!game || !puzzle) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Error Loading Puzzle</h2>
          <p className="text-muted-foreground mb-6">Failed to load chess puzzle.</p>
          <Button onClick={loadNewPuzzle}>Try Again</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Chessboard
            position={game.fen()}
            orientation={puzzle.playerColor}
            onPieceDrop={(from, to) => handleMove(from, to)}
            isDraggable={!isComplete}
          />
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Chess Puzzle</CardTitle>
              <CardDescription>
                {puzzle.playerColor === "white" ? "White" : "Black"} to move and {puzzle.objective}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PuzzleInfo puzzle={puzzle} isComplete={isComplete} showHint={showHint} onShowHint={showHintMove} />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={loadNewPuzzle}>
                New Puzzle
              </Button>
              <Button variant="outline" onClick={showHintMove} disabled={isComplete || showHint}>
                Hint
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Puzzle Solved!</AlertDialogTitle>
            <AlertDialogDescription>Congratulations! You've successfully solved this puzzle.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={loadNewPuzzle}>Try Another Puzzle</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
