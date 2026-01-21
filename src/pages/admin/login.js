import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Sign in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Check if user is a hotel partner
    const { data: partner, error: partnerError } = await supabase
      .from('hotel_partners')
      .select('*')
      .eq('user_id', authData.user.id)
      .single()

    if (partnerError || !partner) {
      setError('This account is not registered as a hotel partner. Please contact support.')
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    router.push('/admin')
  }

  return (
    <>
      <Head>
        <title>Partner Login - Late Rooms</title>
      </Head>

      <main className="min-h-screen bg-midnight flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <span className="text-5xl">🌙</span>
            <h1 className="font-display text-3xl font-bold text-gold mt-4 mb-2">Partner Portal</h1>
            <p className="text-gray-400">Sign in to manage your hotel listings</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-midnight-100 border border-gold/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
                placeholder="partner@hotel.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-midnight-100 border border-gold/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-gold text-midnight font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/" className="text-sm text-gray-400 hover:text-gold">
              ← Back to main site
            </Link>
          </div>

          <div className="mt-8 p-4 bg-gold/5 border border-gold/10 rounded-lg">
            <p className="text-sm text-gray-400 text-center">
              Want to become a partner? Contact us at{' '}
              <span className="text-gold">partners@laterooms.com</span>
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
