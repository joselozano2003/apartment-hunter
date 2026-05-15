'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  {
    href: '/calendar',
    label: 'Calendar',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    href: '/viewings',
    label: 'Viewings',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: '/compare',
    label: 'Compare',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EBEBEB] flex md:hidden z-50 px-2 pb-safe">
        {tabs.map(tab => {
          const active = pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-semibold transition-colors ${
                active ? 'text-[#FF385C]' : 'text-[#717171]'
              }`}
            >
              {tab.icon(active)}
              {tab.label}
            </Link>
          )
        })}
      </nav>

      {/* Desktop top nav */}
      <nav className="hidden md:flex sticky top-0 bg-white border-b border-[#EBEBEB] z-50">
        <div className="max-w-4xl mx-auto px-6 w-full flex items-center gap-1 h-16">
          <span className="font-bold text-[#FF385C] mr-8 text-lg tracking-tight">
            apartment hunter
          </span>
          {tabs.map(tab => {
            const active = pathname.startsWith(tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-[#FF385C]/8 text-[#FF385C]'
                    : 'text-[#717171] hover:bg-[#F7F7F7] hover:text-[#222222]'
                }`}
              >
                {tab.icon(active)}
                {tab.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
