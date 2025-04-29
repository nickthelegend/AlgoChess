"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChessIcon } from "@/components/chess-icon"
import { useWallet } from "@txnlab/use-wallet-react"
import { useWalletModal } from "@/hooks/use-wallet-modal"
import { Wallet } from "lucide-react"

export default function HomePage() {
  const { activeAccount } = useWallet()
  const { openModal } = useWalletModal()

  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12 px-4">
      <div className="flex flex-col items-center space-y-6 text-center mb-12">
        <ChessIcon className="h-24 w-24 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight">AlgoChess</h1>
        <p className="text-muted-foreground max-w-md">
          Play chess online with friends, challenge the computer, or solve puzzles to improve your skills.
        </p>
      </div>

      {activeAccount ? (
        // Show game options when wallet is connected
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Play with Friends</CardTitle>
              <CardDescription>Create a game and invite your friends to play</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                <img src="/focused-chess-game.png" alt="Play with friends" className="rounded-md" />
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/play/create" className="w-full">
                <Button className="w-full">Create Game</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Play with Computer</CardTitle>
              <CardDescription>Challenge our AI to a game of chess</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                <img src="/focused-chess-match.png" alt="Play with computer" className="rounded-md" />
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/play/computer" className="w-full">
                <Button className="w-full">Start Game</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Puzzles</CardTitle>
              <CardDescription>Solve chess puzzles to improve your skills</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                <img src="/intricate-chess-challenge.png" alt="Chess puzzles" className="rounded-md" />
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/puzzles" className="w-full">
                <Button className="w-full">Solve Puzzles</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      ) : (
        // Show connect wallet prompt when wallet is not connected
        <div className="flex flex-col items-center justify-center p-12 max-w-md text-center">
          <div className="bg-muted p-8 rounded-lg mb-6 w-full">
            <Wallet className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6">
              Connect your Algorand wallet to access all features of AlgoChess including playing with friends, against
              the computer, or solving puzzles.
            </p>
            <Button size="lg" onClick={openModal} className="w-full">
              Connect Wallet
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
