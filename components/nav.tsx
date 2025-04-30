"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ChessIcon } from "@/components/chess-icon"
import { Menu, Wallet } from "lucide-react"
import { useWallet } from "@txnlab/use-wallet-react"
import { useWalletModal } from "@/hooks/use-wallet-modal"
import { ThemeToggle } from "./theme-toggle"

export function Nav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { activeAccount } = useWallet()
  const { openModal } = useWalletModal()

  const routes = [
    { href: "/", label: "Home" },
    { href: "/play/create", label: "Play with Friends" },
    { href: "/play/computer", label: "Play with Computer" },
    { href: "/puzzles", label: "Puzzles" },
  ]

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === path
    }
    return pathname.startsWith(path)
  }

  const truncateAddress = (address: string) => {
    if (!address) return ""
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo and brand name */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <ChessIcon className="h-6 w-6" />
            <span className="font-bold">AlgoChess</span>
          </Link>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6 mx-auto">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive(route.href) ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {route.label}
            </Link>
          ))}
        </nav>

        {/* Connect wallet button and theme toggle - positioned at the right */}
        <div className="ml-auto flex items-center gap-4">
          <ThemeToggle />

          <Button variant="outline" size="sm" className="gap-2" onClick={openModal}>
            <Wallet className="h-4 w-4" />
            {activeAccount ? truncateAddress(activeAccount.address) : "Connect Wallet"}
          </Button>

          {/* Mobile menu button - only visible on mobile */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-[1.2rem] w-[1.2rem]" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>AlgoChess</SheetTitle>
                  <SheetDescription>Chess for everyone</SheetDescription>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-6">
                  {routes.map((route) => (
                    <Link
                      key={route.href}
                      href={route.href}
                      className={`text-sm font-medium transition-colors hover:text-primary ${
                        isActive(route.href) ? "text-foreground" : "text-muted-foreground"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {route.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
