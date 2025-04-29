"use server"

// Sample puzzles (in a real app, you'd fetch these from a database)
const puzzles = [
  {
    id: "puzzle1",
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
    moves: ["d2d4", "e5d4", "f3d4"],
    playerColor: "white",
    difficulty: "easy",
    rating: 800,
    theme: "fork",
    objective: "win material",
  },
  {
    id: "puzzle2",
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    moves: ["f3g5", "d7d5", "e4d5", "c6a5"],
    playerColor: "white",
    difficulty: "medium",
    rating: 1200,
    theme: "tactics",
    objective: "find the best move",
  },
  {
    id: "puzzle3",
    fen: "r1bqkbnr/ppp2ppp/2np4/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4",
    moves: ["c4f7", "e8f7", "f3e5", "d6e5"],
    playerColor: "white",
    difficulty: "medium",
    rating: 1400,
    theme: "sacrifice",
    objective: "checkmate in 3",
  },
  {
    id: "puzzle4",
    fen: "r3k2r/pp3ppp/2p5/4Pb2/2B5/2P5/PP3PPP/R3K2R w KQkq - 0 13",
    moves: ["c4f7", "e8f7", "e5f7"],
    playerColor: "white",
    difficulty: "easy",
    rating: 1000,
    theme: "mate",
    objective: "find the checkmate",
  },
  {
    id: "puzzle5",
    fen: "r1bqk2r/ppp2ppp/2n5/3np3/2BP4/5N2/PPP2PPP/RNBQ1RK1 w kq - 0 7",
    moves: ["c4e5", "c6e5", "d4e5"],
    playerColor: "white",
    difficulty: "medium",
    rating: 1300,
    theme: "tactics",
    objective: "win material",
  },
  {
    id: "puzzle6",
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 4",
    moves: ["d4e5", "f6e4", "d1d8", "e8d8"],
    playerColor: "white",
    difficulty: "hard",
    rating: 1600,
    theme: "queen sacrifice",
    objective: "gain advantage",
  },
  {
    id: "puzzle7",
    fen: "r1bqk2r/ppp2ppp/2n5/2bpp3/2PP4/2P1PN2/PP3PPP/RNBQKB1R b KQkq - 0 5",
    moves: ["c5d4", "c3d4", "d5d4"],
    playerColor: "black",
    difficulty: "medium",
    rating: 1200,
    theme: "tactics",
    objective: "gain advantage",
  },
  {
    id: "puzzle8",
    fen: "r1bqkbnr/ppp2ppp/2n5/3pp3/3PP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 4",
    moves: ["d4e5", "c6e5", "f3e5"],
    playerColor: "white",
    difficulty: "easy",
    rating: 900,
    theme: "fork",
    objective: "win material",
  },
]

export async function fetchRandomPuzzle() {
  // In a real app, you'd fetch from a database
  const randomIndex = Math.floor(Math.random() * puzzles.length)
  return puzzles[randomIndex]
}

export async function fetchPuzzleById(id: string) {
  return puzzles.find((puzzle) => puzzle.id === id) || null
}
