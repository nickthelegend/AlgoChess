"use client"

import { create } from "zustand"

interface GameState {
  gameState: any
  setGameState: (state: any) => void
  playerName: string | null
  setPlayerName: (name: string) => void
  playerColor: "white" | "black" | null
  setPlayerColor: (color: "white" | "black") => void
}

export const useGameState = create<GameState>((set) => {
  // Initialize playerName from localStorage if available
  let initialPlayerName = null
  if (typeof window !== "undefined") {
    initialPlayerName = localStorage.getItem("chessPlayerName")
  }

  return {
    gameState: null,
    setGameState: (state) => set({ gameState: state }),
    playerName: initialPlayerName,
    setPlayerName: (name) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("chessPlayerName", name)
      }
      set({ playerName: name })
    },
    playerColor: null,
    setPlayerColor: (color) => set({ playerColor: color }),
  }
})
