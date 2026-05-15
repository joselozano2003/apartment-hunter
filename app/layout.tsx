import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import BottomNav from '@/components/nav/BottomNav'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: 'Apartment Hunter',
  description: 'Track your apartment viewings',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <BottomNav />
        <main className="pb-20 md:pb-0 md:pt-0 max-w-4xl mx-auto px-4">
          {children}
        </main>
      </body>
    </html>
  )
}
