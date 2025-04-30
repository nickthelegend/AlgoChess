"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { joinGame } from "@/lib/actions"
import { toast } from "@/hooks/use-toast"
import { useGameState } from "@/lib/game-state"
import { useWallet } from "@txnlab/use-wallet-react"
import { useWalletModal } from "@/hooks/use-wallet-modal"
import { Wallet } from "lucide-react"

export default function JoinGamePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [playerName, setPlayerName] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const { setPlayerName: setGamePlayerName, playerName: existingPlayerName } = useGameState()
  const { activeAccount } = useWallet()
  const { openModal } = useWalletModal()

  // Use existing player name if available
  useEffect(() => {
    if (existingPlayerName) {
      setPlayerName(existingPlayerName)
    }
  }, [existingPlayerName])

  // Redirect to home if wallet is not connected
  useEffect(() => {
    if (!activeAccount) {
      router.push("/")
    }
  }, [activeAccount, router])

  const handleJoinGame = async () => {
    if (!playerName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to join the game",
        variant: "destructive",
      })
      return
    }

    setIsJoining(true)
    try {
      const success = await joinGame(params.id, playerName)
      if (success) {
        // Set the player name in the client-side state
        setGamePlayerName(playerName)
        router.push(`/play/game/${params.id}`)
      } else {
        throw new Error("Failed to join game")
      }
    } catch (error) {
      console.error("Error joining game:", error)
      toast({
        title: "Error",
        description: "Failed to join game. The game may not exist or is already full.",
        variant: "destructive",
      })
    } finally {
      setIsJoining(false)
    }
  }

  // If wallet is not connected, show connect wallet prompt
  if (!activeAccount) {
    return (
      <div className="container flex items-center justify-center min-h-screen py-12 px-4">
        <div className="flex flex-col items-center justify-center p-12 max-w-md text-center">
          <div className="bg-muted p-8 rounded-lg mb-6 w-full">
            <Wallet className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6">You need to connect your Algorand wallet to join a game.</p>
            <Button size="lg" onClick={openModal} className="w-full">
              Connect Wallet
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join Game</CardTitle>
          <CardDescription>Enter your name to join the chess game</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleJoinGame()
                }
              }}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleJoinGame} disabled={isJoining}>
            {isJoining ? "Joining..." : "Join Game"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
