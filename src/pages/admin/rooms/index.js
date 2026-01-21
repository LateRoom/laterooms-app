import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import AdminLayout from '@/components/AdminLayout'
import { supabase } from '@/lib/supabase'

export default function AdminRooms() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [partner, setPartner] = useState(null)
  const [rooms, setRooms] = useState([])

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
    await loadRooms(partnerData.id)
    setLoading(false)
  }

  const loadRooms = async (partnerId) => {
    const { data } = await supabase
      .from('room_listings')
      .select('*, hotels!inner(name, partner_id, areas(name, regions(name)))')
      .eq('hotels.partner_id', partnerId)
      .order('created_at', { ascending: false })

    setRooms(data || [])
  }

  const cancelListing = async (roomId) => {
    if (!confirm('Are you sure you want to cancel this listing?')) return

    const { error } = await supabase
      .from('room_listings')
      .update({ status: 'cancelled' })
      .eq('id', roomId)

    if (!error) {
      loadRooms(partner.id)
    }
  }

  const getStatusBadge = (room) => {
    const now = new Date()
    const ends = new Date(room.auction_ends_at)
    
    if (room.status === 'cancelled') {
      return <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-1 rounded-full">Cancelled</span>
    }
    if (room.status === 'sold') {
      return <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Sold</span>
    }
    if (ends < now) {
      return <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-1 rounded-full">Ended</span>
    }
    return <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Live</span>
  }

  const formatTimeLeft = (endTime) => {
    const now = new Date()
    const ends = new Date(endTime)
    const diff = ends - now

    if (diff <= 0) return 'Ended'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) return `${hours}h ${minutes}m left`
    return `${minutes}m left`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🌙</div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Room Auctions - Late Rooms Partner Portal</title>
      </Head>

      <AdminLayout partner={partner}>
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-white">Room Auctions</h1>
              <p className="text-gray-400 mt-1">Manage your listed rooms</p>
            </div>
            <Link
              href="/admin/rooms/new"
              className="gradient-gold text-midnight font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              + Add Room
            </Link>
          </div>

          {/* Rooms table */}
          {rooms.length > 0 ? (
            <div className="bg-midnight-50 border border-gold/20 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gold/10">
                    <th className="text-left text-sm font-medium text-gray-400 px-6 py-4">Hotel / Room</th>
                    <th className="text-left text-sm font-medium text-gray-400 px-6 py-4">Location</th>
                    <th className="text-left text-sm font-medium text-gray-400 px-6 py-4">Price</th>
                    <th className="text-left text-sm font-medium text-gray-400 px-6 py-4">Current Bid</th>
                    <th className="text-left text-sm font-medium text-gray-400 px-6 py-4">Time</th>
                    <th className="text-left text-sm font-medium text-gray-400 px-6 py-4">Status</th>
                    <th className="text-left text-sm font-medium text-gray-400 px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map(room => (
                    <tr key={room.id} className="border-b border-gold/5 hover:bg-gold/5">
                      <td className="px-6 py-4">
                        <p className="text-white font-medium">{room.hotels?.name}</p>
                        <p className="text-sm text-gray-400">{room.room_type}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-300 text-sm">
                          {room.hotels?.areas?.name}, {room.hotels?.areas?.regions?.name}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-400 line-through text-sm">£{room.original_price}</p>
                        <p className="text-gray-500 text-xs">Min: £{room.minimum_bid}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gold font-semibold">£{room.current_bid || room.starting_bid}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-300">{formatTimeLeft(room.auction_ends_at)}</p>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(room)}
                      </td>
                      <td className="px-6 py-4">
                        {room.status === 'active' && new Date(room.auction_ends_at) > new Date() && (
                          <button
                            onClick={() => cancelListing(room.id)}
                            className="text-sm text-red-400 hover:text-red-300"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-midnight-50 border border-gold/20 rounded-xl p-12 text-center">
              <span className="text-5xl mb-4 block">🏨</span>
              <p className="text-white font-semibold mb-2">No room listings yet</p>
              <p className="text-gray-400 mb-6">Start listing rooms to fill empty inventory</p>
              <Link
                href="/admin/rooms/new"
                className="inline-block gradient-gold text-midnight font-semibold px-6 py-3 rounded-lg"
              >
                Add Your First Room
              </Link>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  )
}
