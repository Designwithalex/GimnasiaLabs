import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GimnasiaLabs — Rugby Analytics',
  description: 'Player performance analytics dashboard for Gimnasia rugby/hockey',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} min-h-screen bg-gray-950 text-gray-100`}>
        <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 h-14">
            <Link href="/" className="text-emerald-400 font-bold text-lg tracking-tight">
              GimnasiaLabs
            </Link>
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-100 transition-colors">
              Dashboard
            </Link>
            <Link href="/data" className="text-sm text-gray-400 hover:text-gray-100 transition-colors">
              Data
            </Link>
            <Link href="/upload" className="text-sm text-gray-400 hover:text-gray-100 transition-colors">
              Upload
            </Link>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  )
}
