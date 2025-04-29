"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { joinGame } from "@/lib/actions"
import { toast } from "@/hooks/use-toast"
import { useGameState } from "@/lib/game-state"

export default function JoinGamePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [playerName, setPlayerName] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const { setPlayerName: setGamePlayerName } = useGameState()

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
      await joinGame(params.id, playerName)
      // Set the player name in the client-side state
      setGamePlayerName(playerName)
      router.push(`/play/game/${params.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join game. The game may not exist or is already full.",
        variant: "destructive",
      })
    } finally {
      setIsJoining(false)
    }
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
