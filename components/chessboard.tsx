"use client"

import { useEffect, useState, useRef, memo } from "react"
import { Chessboard as ReactChessboard } from "react-chessboard"
import { useTheme } from "next-themes"

interface ChessboardProps {
  position: string
  orientation?: "white" | "black"
  onPieceDrop?: (sourceSquare: string, targetSquare: string, piece?: string) => boolean | Promise<boolean>
  isDraggable?: boolean
}

// Memoize the chessboard component to prevent unnecessary re-renders
export const Chessboard = memo(function Chessboard({
  position,
  orientation = "white",
  onPieceDrop,
  isDraggable = true,
}: ChessboardProps) {
  const [boardSize, setBoardSize] = useState(480)
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"
  const positionRef = useRef(position)

  // Update position ref when position changes
  useEffect(() => {
    positionRef.current = position
  }, [position])

  // Responsive board size
  useEffect(() => {
    const updateBoardSize = () => {
      const width = window.innerWidth
      if (width < 500) {
        setBoardSize(width - 40)
      } else if (width < 768) {
        setBoardSize(width - 80)
      } else if (width < 1024) {
        setBoardSize(Math.min(600, width - 100))
      } else {
        setBoardSize(Math.min(600, width * 0.65 - 100))
      }
    }

    updateBoardSize()
    window.addEventListener("resize", updateBoardSize)

    return () => {
      window.removeEventListener("resize", updateBoardSize)
    }
  }, [])

  const handlePieceDrop = async (sourceSquare: string, targetSquare: string, piece: string) => {
    if (!onPieceDrop) return false

    // Extract promotion piece if needed
    const isPawnPromotion =
      piece.charAt(1) === "P" &&
      ((piece.charAt(0) === "w" && targetSquare.charAt(1) === "8") ||
        (piece.charAt(0) === "b" && targetSquare.charAt(1) === "1"))

    try {
      if (isPawnPromotion) {
        // For simplicity, always promote to queen
        // In a real app, you'd show a promotion dialog
        const promotionPiece = piece.charAt(0) === "w" ? "q" : "q"
        return await onPieceDrop(sourceSquare, targetSquare, promotionPiece)
      } else {
        return await onPieceDrop(sourceSquare, targetSquare)
      }
    } catch (error) {
      console.error("Error handling piece drop:", error)
      return false
    }
  }

  return (
    <div className="mx-auto" style={{ maxWidth: boardSize }}>
      <ReactChessboard
        position={position}
        boardWidth={boardSize}
        boardOrientation={orientation}
        onPieceDrop={handlePieceDrop}
        areArrowsAllowed={true}
        animationDuration={100} // Fast animations for responsive feel
        transitionDuration={100} // Fast transitions
        customBoardStyle={{
          borderRadius: "4px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        }}
        customDarkSquareStyle={{
          backgroundColor: isDarkTheme ? "#1a1a1a" : "#779952",
        }}
        customLightSquareStyle={{
          backgroundColor: isDarkTheme ? "#f0f0f0" : "#edeed1",
        }}
        customPieces={{}}
        isDraggablePiece={() => isDraggable}
      />
    </div>
  )
})
