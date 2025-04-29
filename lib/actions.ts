"use server"

import { Chess } from "chess.js"
import { revalidatePath } from "next/cache"

// In-memory storage for games (in a real app, use a database)
const games = new Map()
const chatMessages = new Map()

export async function createGame(playerName: string, colorPreference: string) {
  // Generate a random game ID
  const gameId = Math.random().toString(36).substring(2, 10)

  // Create a new chess game
  const chess = new Chess()

  // Determine player color
  let playerColor = colorPreference
  if (colorPreference === "random") {
    playerColor = Math.random() > 0.5 ? "white" : "black"
  }

  // Create game state
  const gameState = {
    fen: chess.fen(),
    turn: chess.turn(),
    moveNumber: chess.moveNumber(),
    players: {
      white: playerColor === "white" ? { name: playerName } : null,
      black: playerColor === "black" ? { name: playerName } : null,
    },
    result: null,
    resultAcknowledged: false,
    resignedBy: null,
    lastMoveTime: Date.now(),
  }

  // Store game state
  games.set(gameId, gameState)

  // Initialize chat for this game
  chatMessages.set(gameId, [
    {
      sender: "System",
      content: "Game created. Waiting for opponent to join.",
      timestamp: Date.now(),
    },
  ])

  return gameId
}

export async function joinGame(gameId: string, playerName: string) {
  const gameState = games.get(gameId)

  if (!gameState) {
    throw new Error("Game not found")
  }

  // Check if game is already full
  if (gameState.players.white && gameState.players.black) {
    throw new Error("Game is already full")
  }

  // Assign player to available color
  if (!gameState.players.white) {
    gameState.players.white = { name: playerName }
  } else if (!gameState.players.black) {
    gameState.players.black = { name: playerName }
  }

  // Add system message
  chatMessages.get(gameId).push({
    sender: "System",
    content: `${playerName} has joined the game.`,
    timestamp: Date.now(),
  })

  // Update game state
  games.set(gameId, gameState)

  revalidatePath(`/play/game/${gameId}`)

  return true
}

export async function fetchGameState(gameId: string) {
  return games.get(gameId) || null
}

export async function makeMove(gameId: string, from: string, to: string, promotion?: string) {
  const gameState = games.get(gameId)

  if (!gameState) {
    throw new Error("Game not found")
  }

  if (gameState.result) {
    throw new Error("Game is already over")
  }

  // Load current position
  const chess = new Chess(gameState.fen)

  // Make the move
  const move = chess.move({
    from,
    to,
    promotion: promotion || undefined,
  })

  if (!move) {
    throw new Error("Invalid move")
  }

  // Update game state
  gameState.fen = chess.fen()
  gameState.turn = chess.turn()
  gameState.moveNumber = chess.moveNumber()
  gameState.lastMoveTime = Date.now()

  // Check for game over conditions
  if (chess.isCheckmate()) {
    gameState.result = "checkmate"

    // Add system message
    chatMessages.get(gameId).push({
      sender: "System",
      content: `Checkmate! ${chess.turn() === "w" ? "Black" : "White"} wins!`,
      timestamp: Date.now(),
    })
  } else if (chess.isDraw()) {
    gameState.result = "draw"

    // Add system message
    chatMessages.get(gameId).push({
      sender: "System",
      content: "Game ended in a draw!",
      timestamp: Date.now(),
    })
  }

  // Update game state
  games.set(gameId, gameState)

  revalidatePath(`/play/game/${gameId}`)

  return true
}

export async function resignGame(gameId: string, color: "w" | "b") {
  const gameState = games.get(gameId)

  if (!gameState) {
    throw new Error("Game not found")
  }

  if (gameState.result) {
    throw new Error("Game is already over")
  }

  // Update game state
  gameState.result = "resignation"
  gameState.resignedBy = color

  // Add system message
  chatMessages.get(gameId).push({
    sender: "System",
    content: `${color === "w" ? "White" : "Black"} resigned. ${color === "w" ? "Black" : "White"} wins!`,
    timestamp: Date.now(),
  })

  // Update game state
  games.set(gameId, gameState)

  revalidatePath(`/play/game/${gameId}`)

  return true
}

export async function sendChatMessage(gameId: string, sender: string, content: string) {
  if (!chatMessages.has(gameId)) {
    chatMessages.set(gameId, [])
  }

  chatMessages.get(gameId).push({
    sender,
    content,
    timestamp: Date.now(),
  })

  revalidatePath(`/play/game/${gameId}`)

  return true
}

export async function fetchChatMessages(gameId: string) {
  return chatMessages.get(gameId) || []
}
