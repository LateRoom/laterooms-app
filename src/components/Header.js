import Link from 'next/link'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/router'

export default function Header({ session }) {
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header className="bg-midnight-50 border-b border-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <span className="text-3xl">🌙</span>
            <div>
              <h1 className="font-display text-xl font-bold text-gold">Late Rooms</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Last-minute luxury</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm text-gray-300 hover:text-gold transition-colors">
              Browse Rooms
            </Link>
            <Link href="/secret-hotels" className="text-sm text-purple-light hover:text-purple-secret transition-colors">
              🔮 Secret Hotels
            </Link>
            {session ? (
              <>
                <Link href="/my-bids" className="text-sm text-gray-300 hover:text-gold transition-colors">
                  My Bids
                </Link>
                <Link href="/my-bookings" className="text-sm text-gray-300 hover:text-gold transition-colors">
                  My Bookings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm bg-midnight-100 px-4 py-2 rounded-lg border border-gold/30 text-gold hover:bg-gold/10 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-gray-300 hover:text-gold transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="text-sm gradient-gold px-4 py-2 rounded-lg text-midnight font-semibold hover:opacity-90 transition-opacity"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gold"
            onClick={() => setShowMenu(!showMenu)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showMenu ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {showMenu && (
          <div className="md:hidden py-4 border-t border-gold/10">
            <nav className="flex flex-col gap-4">
              <Link href="/" className="text-sm text-gray-300 hover:text-gold transition-colors">
                Browse Rooms
              </Link>
              <Link href="/secret-hotels" className="text-sm text-purple-light hover:text-purple-secret transition-colors">
                🔮 Secret Hotels
              </Link>
              {session ? (
                <>
                  <Link href="/my-bids" className="text-sm text-gray-300 hover:text-gold transition-colors">
                    My Bids
                  </Link>
                  <Link href="/my-bookings" className="text-sm text-gray-300 hover:text-gold transition-colors">
                    My Bookings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-sm text-left text-gold"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm text-gray-300 hover:text-gold transition-colors">
                    Sign In
                  </Link>
                  <Link href="/signup" className="text-sm text-gold">
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
