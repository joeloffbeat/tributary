import type { Metadata } from 'next'
import { Sora } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { Navbar } from '@/components/layout/navbar'
import { Web3Provider } from '@/providers/web3-provider'
import { ConfigurationProvider } from '@/components/config/configuration-provider'

const sora = Sora({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || 'Web3 App',
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'A comprehensive Web3 application powered by Reown AppKit',
  icons: {
    icon: process.env.NEXT_PUBLIC_APP_ICON || '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={sora.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ConfigurationProvider>
            <Web3Provider>
              <Navbar />
              {children}
              <Toaster />
            </Web3Provider>
          </ConfigurationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}