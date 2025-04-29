"use client"

import { create } from "zustand"

type WalletModalStore = {
  isOpen: boolean
  openModal: () => void
  closeModal: () => void
}

export const useWalletModal = create<WalletModalStore>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}))
