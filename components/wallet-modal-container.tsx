"use client"

import { useWallet } from "@txnlab/use-wallet-react"
import { useWalletModal } from "@/hooks/use-wallet-modal"
import ConnectWalletModal from "./connect-wallet-modal"

export function WalletModalContainer() {
  const { wallets } = useWallet()
  const { isOpen, closeModal } = useWalletModal()

  return <ConnectWalletModal wallets={wallets} isOpen={isOpen} onClose={closeModal} />
}
