import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import AdminLayout from '@/components/AdminLayout'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [partner, setPartner] = useState(null)
  const [stats, setStats] = useState({
    activeRooms: 0,
    secretHotels: 0,
    totalBids: 0,
    bookings: 0
  })
  const [recentListings, setRecentListings] = useState([])

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const checkAuthAndLoadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/admin/login')
      return
    }

    // Get partner profile
    const { data: partnerData, error: partnerError } = await supabase
      .from('hotel_partners')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (partnerError || !partnerData) {
      router.push('/admin/login')
      return
    }

    setPartner(partnerData)

    // Get stats
    await loadStats(partnerData.id)
    await loadRecentListings(partnerData.id)
    
    setLoading(false)
  }

  const loadStats = async (partnerId) => {
    // Count active room listings
    const { count: roomCount } = await supabase
      .from('room_listings')
      .select('*, hotels!inner(partner_id)', { count: 'exact', head: true })
      .eq('hotels.partner_id', partnerId)
      .eq('status', 'active')

    // Count secret hotels
    const { count: secretCount } = await supabase
      .from('secret_hotel_listings')
      .select('*', { count: 'exact', head: true })
      .eq('partner_id', partnerId)
      .eq('status', 'active')

    // Count bookings
    const { count: bookingCount } = await supabase
      .from('bookings')
      .select('*, room_listings!inner(hotel_id, hotels!inner(partner_id))', { count: 'exact', head: true })
      .eq('room_listings.hotels.partner_id', partnerId)

    setStats({
      activeRooms: roomCount || 0,
      secretHotels: secretCount || 0,
      totalBids: 0, // We'll calculate this differently
      bookings: bookingCount || 0
    })
  }

  const loadRecentListings = async (partnerId) => {
    const { data } = await supabase
      .from('room_listings')
      .select('*, hotels!inner(name, partner_id)')
      .eq('hotels.partner_id', partnerId)
      .order('created_at', { ascending: false })
      .limit(5)

    setRecentListings(data || [])
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🌙</div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Dashboard - Late Rooms Partner Portal</title>
      </Head>

      <AdminLayout partner={partner}>
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-white mb-2">
              Welcome back, {partner?.contact_name?.split(' ')[0] || 'Partner'}
            </h1>
            <p className="text-gray-400">Here's what's happening with your listings</p>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-midnight-50 border border-gold/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">🏨</span>
                <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">Live</span>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stats.activeRooms}</p>
              <p className="text-sm text-gray-400">Active Auctions</p>
            </div>

            <div className="bg-midnight-50 border border-purple-secret/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">🔮</span>
                <span className="text-xs text-purple-light bg-purple-light/10 px-2 py-1 rounded-full">Live</span>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stats.secretHotels}</p>
              <p className="text-sm text-gray-400">Secret Hotels</p>
            </div>

            <div className="bg-midnight-50 border border-gold/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stats.bookings}</p>
              <p className="text-sm text-gray-400">Total Bookings</p>
            </div>

            <div className="bg-midnight-50 border border-gold/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <p className="text-3xl font-bold text-white mb-1">£0</p>
              <p className="text-sm text-gray-400">Revenue (Coming Soon)</p>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link
              href="/admin/rooms/new"
              className="bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/20 rounded-xl p-6 hover:border-gold/40 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">➕</span>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-gold transition-colors">Add Room Auction</h3>
                  <p className="text-sm text-gray-400">List a new room for bidding</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/secret-hotels/new"
              className="bg-gradient-to-r from-purple-secret/10 to-purple-light/5 border border-purple-secret/20 rounded-xl p-6 hover:border-purple-secret/40 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">🔮</span>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-purple-light transition-colors">Add Secret Hotel</h3>
                  <p className="text-sm text-gray-400">List anonymously to protect your brand</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Recent listings */}
          <div className="bg-midnight-50 border border-gold/20 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-xl font-semibold text-white">Recent Listings</h2>
              <Link href="/admin/rooms" className="text-sm text-gold hover:underline">
                View all →
              </Link>
            </div>

            {recentListings.length > 0 ? (
              <div className="space-y-4">
                {recentListings.map(listing => (
                  <div
                    key={listing.id}
                    className="flex items-center justify-between p-4 bg-black/20 rounded-lg"
                  >
                    <div>
                      <p className="text-white font-medium">{listing.hotels?.name}</p>
                      <p className="text-sm text-gray-400">{listing.room_type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gold font-semibold">£{listing.current_bid || listing.starting_bid}</p>
                      <p className={`text-xs ${listing.status === 'active' ? 'text-green-400' : 'text-gray-500'}`}>
                        {listing.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No listings yet</p>
                <Link
                  href="/admin/rooms/new"
                  className="inline-block gradient-gold text-midnight font-semibold px-6 py-2 rounded-lg"
                >
                  Add your first room
                </Link>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </>
  )
}
