# AlgoChess

> **Play chess online with friends, challenge the computer, or solve puzzles — with an Algorand wallet login.**

## Overview

AlgoChess is a Next.js chess web app with Algorand wallet authentication (via `@txnlab/use-wallet-react`, supporting Pera, Defly, and other AVM-compatible wallets). Connect your wallet, then play real-time games against friends, take on a built-in computer opponent, or sharpen your tactics with chess puzzles.

## Features

- **Wallet login** — connect an Algorand wallet (Pera, Defly, AVM web providers) via `use-wallet-react`
- **Play with Friends** — create a game and share an invite, or join an existing game
- **Play vs Computer** — a built-in chess AI opponent (`lib/computer-ai.ts`)
- **Puzzles** — solve tactical chess puzzles to improve your skills
- **Full game engine** — move generation, validation, and game-state management (`lib/game-state.ts`, `lib/actions.ts`)
- **Polished UI** — shadcn/ui (Radix) components with a responsive Tailwind design

## Tech Stack

- **Next.js** (App Router), **React**, **TypeScript**
- **Algorand** wallets: `@txnlab/use-wallet-react` with Pera / Defly / AVM web-provider connectors
- **Tailwind CSS**, **shadcn/ui** (Radix UI), `react-hook-form`

## Getting Started

```bash
git clone https://github.com/nickthelegend/AlgoChess.git
cd AlgoChess
pnpm install          # or: npm install --legacy-peer-deps
pnpm dev              # http://localhost:3000
```

## Project Structure

```
app/          # Routes: play/create, play/join, play/game, play/computer, puzzles
components/   # Chess board, chess-icon, and shadcn/ui components
lib/          # actions, computer-ai, game-state, puzzles, utils
hooks/        # use-wallet-modal and other hooks
providers/    # Wallet + app providers
```

Built by [nickthelegend](https://github.com/nickthelegend) · [nickthelegend.tech](https://nickthelegend.tech)
