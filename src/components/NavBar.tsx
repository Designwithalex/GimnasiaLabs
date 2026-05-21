'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/planificacion', label: 'Planificación' },
  { href: '/data', label: 'Data' },
  { href: '/upload', label: 'Upload' },
]

export default function NavBar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  function isActive(href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href)
  }

  return (
    <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center h-14">
        <Link href="/" className="text-emerald-400 font-bold text-lg tracking-tight">
          GimnasiaLabs
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6 ml-6">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm transition-colors ${
                isActive(l.href)
                  ? 'text-gray-100 font-medium'
                  : 'text-gray-400 hover:text-gray-100'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden ml-auto p-2 text-gray-400 hover:text-gray-100 transition-colors"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menú"
        >
          {open ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4l12 12M16 4L4 16" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 5h14M3 10h14M3 15h14" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-800 bg-gray-950 px-4 py-3 space-y-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`block py-2.5 px-3 rounded-lg text-sm transition-colors ${
                isActive(l.href)
                  ? 'bg-gray-800 text-gray-100 font-medium'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-100'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
