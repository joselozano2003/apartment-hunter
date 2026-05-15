'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/calendar', label: 'Calendar', icon: '📅' },
  { href: '/viewings', label: 'Viewings', icon: '🏠' },
  { href: '/compare', label: 'Compare', icon: '⚖️' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex md:hidden z-50">
        {tabs.map(tab => {
          const active = pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
                active ? 'text-indigo-600' : 'text-gray-500'
              }`}
            >
              <span className="text-xl mb-0.5">{tab.icon}</span>
              {tab.label}
            </Link>
          )
        })}
      </nav>

      {/* Desktop top nav */}
      <nav className="hidden md:flex sticky top-0 bg-white border-b border-gray-200 z-50 px-6">
        <div className="flex items-center gap-1 h-14">
          <span className="font-bold text-indigo-700 mr-6 text-lg">Apartment Hunter</span>
          {tabs.map(tab => {
            const active = pathname.startsWith(tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.icon} {tab.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
