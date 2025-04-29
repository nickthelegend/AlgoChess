import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Nav } from "@/components/nav"
import { WalletProviderWrapper } from "@/providers/wallet-provider"
import { WalletModalContainer } from "@/components/wallet-modal-container"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "AlgoChess",
  description: "Play chess online with friends or against the computer",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <WalletProviderWrapper>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <Nav />
            <main>{children}</main>
            <WalletModalContainer />
          </ThemeProvider>
        </WalletProviderWrapper>
      </body>
    </html>
  )
}
