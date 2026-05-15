import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import BottomNav from '@/components/nav/BottomNav'

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' })

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
    <html lang="en" className={jakarta.variable}>
      <body className={`${jakarta.className} bg-[#F7F7F7] min-h-screen`}>
        <BottomNav />
        <main className="pb-20 md:pb-0 md:pt-0 max-w-4xl mx-auto px-4">
          {children}
        </main>
      </body>
    </html>
  )
}
