"use client"

import { Chess } from "chess.js"

// Simple chess AI implementation
export async function makeComputerMove(game, difficulty = "medium") {
  // Get all legal moves
  const moves = game.moves({ verbose: true })

  if (moves.length === 0) return null

  // For easy difficulty, just make a random move
  if (difficulty === "easy") {
    const randomIndex = Math.floor(Math.random() * moves.length)
    return moves[randomIndex]
  }

  // For medium and hard, evaluate positions
  const evaluatedMoves = moves.map((move) => {
    // Make the move on a new instance of the game
    const gameCopy = new Chess(game.fen())

    // Use the move object directly or convert string to proper format
    try {
      gameCopy.move(move)
    } catch (error) {
      console.error("Error making move in evaluation:", error)
    }

    // Evaluate the resulting position
    const evaluation = evaluatePosition(gameCopy, difficulty === "hard" ? 2 : 1)

    return {
      move,
      evaluation: game.turn() === "w" ? evaluation : -evaluation,
    }
  })

  // Sort moves by evaluation
  evaluatedMoves.sort((a, b) => b.evaluation - a.evaluation)

  // For medium difficulty, add some randomness
  if (difficulty === "medium") {
    // Take one of the top 3 moves randomly
    const topMoves = evaluatedMoves.slice(0, Math.min(3, evaluatedMoves.length))
    const randomIndex = Math.floor(Math.random() * topMoves.length)
    return topMoves[randomIndex].move
  }

  // For hard difficulty, take the best move
  return evaluatedMoves[0].move
}

// Simple position evaluation function
function evaluatePosition(game, depth) {
  // If game is over, return a high value
  if (game.isGameOver()) {
    return game.isCheckmate() ? (game.turn() === "w" ? -10000 : 10000) : 0
  }

  // If we've reached the maximum depth, evaluate the position
  if (depth === 0) {
    return calculateMaterialScore(game)
  }

  // Get all legal moves
  const moves = game.moves({ verbose: true })

  if (moves.length === 0) {
    return 0
  }

  let bestEvaluation = game.turn() === "w" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY

  // Evaluate each move
  for (const move of moves) {
    // Make the move on a new instance of the game
    const gameCopy = new Chess(game.fen())

    try {
      gameCopy.move(move)

      // Recursively evaluate the position
      const evaluation = evaluatePosition(gameCopy, depth - 1)

      // Update best evaluation
      if (game.turn() === "w") {
        bestEvaluation = Math.max(bestEvaluation, evaluation)
      } else {
        bestEvaluation = Math.min(bestEvaluation, evaluation)
      }
    } catch (error) {
      console.error("Error in recursive evaluation:", error)
    }
  }

  return bestEvaluation
}

// Calculate material score
function calculateMaterialScore(game) {
  let score = 0

  // Piece values
  const pieceValues = {
    p: 1, // pawn
    n: 3, // knight
    b: 3, // bishop
    r: 5, // rook
    q: 9, // queen
    k: 0, // king (not counted for material)
  }

  // Get the board
  const board = game.board()

  // Calculate material score
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j]
      if (piece) {
        const value = pieceValues[piece.type.toLowerCase()]
        score += piece.color === "w" ? value : -value
      }
    }
  }

  // Add positional bonuses
  score += calculatePositionalBonus(game)

  return score
}

// Add some positional bonuses
function calculatePositionalBonus(game) {
  let bonus = 0

  // Check for center control
  const board = game.board()
  const centerSquares = [
    { row: 3, col: 3 },
    { row: 3, col: 4 },
    { row: 4, col: 3 },
    { row: 4, col: 4 },
  ]

  for (const square of centerSquares) {
    const piece = board[square.row][square.col]
    if (piece) {
      // Bonus for controlling center
      bonus += piece.color === "w" ? 0.2 : -0.2
    }
  }

  // Bonus for development in opening
  if (game.history().length < 20) {
    // Check knights and bishops development
    const developedPieces = {
      w: 0,
      b: 0,
    }

    // Knights should not be on their original squares
    if (!board[0][1] || board[0][1].type !== "n") developedPieces.w++
    if (!board[0][6] || board[0][6].type !== "n") developedPieces.w++
    if (!board[7][1] || board[7][1].type !== "n") developedPieces.b++
    if (!board[7][6] || board[7][6].type !== "n") developedPieces.b++

    // Bishops should not be on their original squares
    if (!board[0][2] || board[0][2].type !== "b") developedPieces.w++
    if (!board[0][5] || board[0][5].type !== "b") developedPieces.w++
    if (!board[7][2] || board[7][2].type !== "b") developedPieces.b++
    if (!board[7][5] || board[7][5].type !== "b") developedPieces.b++

    bonus += (developedPieces.w - developedPieces.b) * 0.1
  }

  return bonus
}
