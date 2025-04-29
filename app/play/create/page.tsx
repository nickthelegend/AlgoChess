"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createGame } from "@/lib/actions"
import { Copy, Share2, Wallet } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useGameState } from "@/lib/game-state"
import { useWallet } from "@txnlab/use-wallet-react"
import { useWalletModal } from "@/hooks/use-wallet-modal"

export default function CreateGamePage() {
  const router = useRouter()
  const [gameId, setGameId] = useState<string | null>(null)
  const [gameUrl, setGameUrl] = useState<string | null>(null)
  const [playerName, setPlayerName] = useState("")
  const [color, setColor] = useState("random")
  const [isCreating, setIsCreating] = useState(false)
  const { setPlayerName: setGamePlayerName } = useGameState()
  const { activeAccount } = useWallet()
  const { openModal } = useWalletModal()

  // Redirect to home if wallet is not connected
  useEffect(() => {
    if (!activeAccount) {
      router.push("/")
    }
  }, [activeAccount, router])

  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to create a game",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      const id = await createGame(playerName, color)
      // Set the player name in the client-side state
      setGamePlayerName(playerName)
      setGameId(id)
      const url = `${window.location.origin}/play/join/${id}`
      setGameUrl(url)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create game. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const copyToClipboard = () => {
    if (gameUrl) {
      navigator.clipboard.writeText(gameUrl)
      toast({
        title: "Link copied",
        description: "Game link copied to clipboard",
      })
    }
  }

  const joinGame = () => {
    if (gameId) {
      router.push(`/play/game/${gameId}`)
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
            <p className="text-muted-foreground mb-6">You need to connect your Algorand wallet to create a game.</p>
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
          <CardTitle>Create a Game</CardTitle>
          <CardDescription>Set up a new chess game and invite a friend to play</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!gameId ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Choose Your Color</Label>
                <RadioGroup value={color} onValueChange={setColor} className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="random" id="random" />
                    <Label htmlFor="random">Random</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="white" id="white" />
                    <Label htmlFor="white">White</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="black" id="black" />
                    <Label htmlFor="black">Black</Label>
                  </div>
                </RadioGroup>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm font-medium mb-1">Share this link with your friend:</p>
                <div className="flex items-center gap-2">
                  <Input value={gameUrl || ""} readOnly />
                  <Button size="icon" variant="outline" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Button variant="outline" className="w-full" onClick={copyToClipboard}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Link
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          {!gameId ? (
            <Button className="w-full" onClick={handleCreateGame} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Game"}
            </Button>
          ) : (
            <Button className="w-full" onClick={joinGame}>
              Enter Game Room
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
