import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/AdminLayout'
import { supabase } from '@/lib/supabase'

export default function AdminBookings() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [partner, setPartner] = useState(null)
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const checkAuthAndLoadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/admin/login')
      return
    }

    const { data: partnerData } = await supabase
      .from('hotel_partners')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!partnerData) {
      router.push('/admin/login')
      return
    }

    setPartner(partnerData)
    // Bookings will be loaded when we have actual booking data
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Bookings - Late Rooms Partner Portal</title>
      </Head>

      <AdminLayout partner={partner}>
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-white">Bookings</h1>
            <p className="text-gray-400 mt-1">View confirmed bookings and payouts</p>
          </div>

          {/* Coming soon state */}
          <div className="bg-midnight-50 border border-gold/20 rounded-xl p-12 text-center">
            <span className="text-5xl mb-4 block">📋</span>
            <p className="text-white font-semibold mb-2">No bookings yet</p>
            <p className="text-gray-400 mb-6">When customers complete bookings, they'll appear here</p>
            <div className="bg-gold/5 border border-gold/10 rounded-lg p-4 inline-block">
              <p className="text-sm text-gray-400">
                💡 Payments integration coming in Phase 3
              </p>
            </div>
          </div>

          {/* Info section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-midnight-50 border border-gold/10 rounded-xl p-6">
              <span className="text-2xl mb-3 block">💳</span>
              <h3 className="text-white font-semibold mb-2">Payment Processing</h3>
              <p className="text-sm text-gray-400">Stripe integration handles all customer payments securely</p>
            </div>
            <div className="bg-midnight-50 border border-gold/10 rounded-xl p-6">
              <span className="text-2xl mb-3 block">💰</span>
              <h3 className="text-white font-semibold mb-2">Weekly Payouts</h3>
              <p className="text-sm text-gray-400">Receive your earnings every Monday via bank transfer</p>
            </div>
            <div className="bg-midnight-50 border border-gold/10 rounded-xl p-6">
              <span className="text-2xl mb-3 block">📊</span>
              <h3 className="text-white font-semibold mb-2">Commission</h3>
              <p className="text-sm text-gray-400">15% on auctions, 12% on secret hotels - no monthly fees</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  )
}
