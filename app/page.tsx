import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChessIcon } from "@/components/chess-icon"

export default function HomePage() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12 px-4">
      <div className="flex flex-col items-center space-y-6 text-center mb-12">
        <ChessIcon className="h-24 w-24 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight">Chess Master</h1>
        <p className="text-muted-foreground max-w-md">
          Play chess online with friends, challenge the computer, or solve puzzles to improve your skills.
        </p>
      </div>

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
    </div>
  )
}
