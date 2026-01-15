import type { Metadata } from 'next'
import { Roboto, Birthstone } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { Navbar } from '@/components/layout/navbar'
import { Web3Provider } from '@/providers/web3-provider'
import { ConfigurationProvider } from '@/components/config/configuration-provider'

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '500'],
  variable: '--font-roboto',
})

const birthstone = Birthstone({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-birthstone',
})

export const metadata: Metadata = {
  title: 'Tributary | IP Royalty Tokenization',
  description: 'Tokenize royalty streams from your intellectual property on Story Protocol. Invest in IP-backed revenue sharing vaults.',
  openGraph: {
    title: 'Tributary | IP Royalty Tokenization',
    description: 'Tokenize royalty streams from your intellectual property on Story Protocol. Invest in IP-backed revenue sharing vaults.',
    images: ['/logo.png'],
  },
  twitter: {
    card: 'summary',
    title: 'Tributary | IP Royalty Tokenization',
    description: 'Tokenize royalty streams from your intellectual property on Story Protocol. Invest in IP-backed revenue sharing vaults.',
    images: ['/logo.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${roboto.variable} ${birthstone.variable}`} suppressHydrationWarning>
      <body className="bg-background text-foreground min-h-screen font-roboto">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          disableTransitionOnChange
        >
          <ConfigurationProvider>
            <Web3Provider>
              <Navbar />
              <main className="pt-20">
                {children}
              </main>
              <Toaster />
            </Web3Provider>
          </ConfigurationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}