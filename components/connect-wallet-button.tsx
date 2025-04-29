"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import { useWallet } from "@txnlab/use-wallet-react"
import ConnectWalletModal from "./connect-wallet-modal"

export function ConnectWalletButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { activeAccount, wallets } = useWallet()

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  const truncateAddress = (address: string) => {
    if (!address) return ""
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  return (
    <>
      <Button variant="default" size="lg" className="gap-2 px-6" onClick={openModal}>
        <Wallet className="h-5 w-5" />
        {activeAccount ? truncateAddress(activeAccount.address) : "Connect Wallet"}
      </Button>

      <ConnectWalletModal wallets={wallets} isOpen={isModalOpen} onClose={closeModal} />
    </>
  )
}
