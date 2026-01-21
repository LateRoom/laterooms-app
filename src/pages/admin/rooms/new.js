import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import AdminLayout from '@/components/AdminLayout'
import { supabase } from '@/lib/supabase'

export default function NewRoom() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [partner, setPartner] = useState(null)
  const [hotels, setHotels] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    hotel_id: '',
    room_type: '',
    original_price: '',
    minimum_bid: '',
    starting_bid: '',
    available_date: 'today',
    check_in_time: '3pm onwards',
    max_guests: '2',
    auction_hours: '4'
  })

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

    // Load partner's hotels
    const { data: hotelsData } = await supabase
      .from('hotels')
      .select('*, areas(name, regions(name))')
      .eq('partner_id', partnerData.id)
      .eq('is_active', true)

    setHotels(hotelsData || [])
    setLoading(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    // Validate
    if (parseFloat(formData.starting_bid) < parseFloat(formData.minimum_bid)) {
      setError('Starting bid must be at least the minimum bid')
      setSaving(false)
      return
    }

    // Calculate auction end time
    const now = new Date()
    const auctionEndsAt = new Date(now.getTime() + parseInt(formData.auction_hours) * 60 * 60 * 1000)

    // Calculate available date
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    const availableDate = formData.available_date === 'today' ? today : tomorrow

    const { data, error: insertError } = await supabase
      .from('room_listings')
      .insert({
        hotel_id: formData.hotel_id,
        room_type: formData.room_type,
        original_price: parseFloat(formData.original_price),
        minimum_bid: parseFloat(formData.minimum_bid),
        starting_bid: parseFloat(formData.starting_bid),
        available_date: availableDate,
        check_in_time: formData.check_in_time,
        max_guests: parseInt(formData.max_guests),
        auction_ends_at: auctionEndsAt.toISOString(),
        status: 'active'
      })
      .select()

    if (insertError) {
      setError(insertError.message)
      setSaving(false)
      return
    }

    setSuccess(true)
    setTimeout(() => {
      router.push('/admin/rooms')
    }, 1500)
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
        <title>Add Room - Late Rooms Partner Portal</title>
      </Head>

      <AdminLayout partner={partner}>
        <div className="p-8 max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <Link href="/admin/rooms" className="text-gold hover:underline text-sm mb-2 inline-block">
              ← Back to rooms
            </Link>
            <h1 className="font-display text-3xl font-bold text-white">Add Room Auction</h1>
            <p className="text-gray-400 mt-2">List a room for last-minute bidding</p>
          </div>

          {success ? (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-8 text-center">
              <span className="text-4xl mb-4 block">✅</span>
              <p className="text-green-400 text-lg font-semibold">Room listed successfully!</p>
              <p className="text-gray-400 mt-2">Redirecting to your rooms...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {hotels.length === 0 ? (
                <div className="bg-gold/5 border border-gold/20 rounded-xl p-8 text-center">
                  <span className="text-4xl mb-4 block">🏨</span>
                  <p className="text-white font-semibold mb-2">No hotels found</p>
                  <p className="text-gray-400 text-sm">You need to add a hotel before listing rooms. Contact support to set up your properties.</p>
                </div>
              ) : (
                <>
                  {/* Hotel selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Select Hotel *
                    </label>
                    <select
                      name="hotel_id"
                      value={formData.hotel_id}
                      onChange={handleChange}
                      required
                      className="w-full bg-midnight-100 border border-gold/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold"
                    >
                      <option value="">Choose a hotel...</option>
                      {hotels.map(hotel => (
                        <option key={hotel.id} value={hotel.id}>
                          {hotel.name} - {hotel.areas?.name}, {hotel.areas?.regions?.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Room type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Room Type *
                    </label>
                    <input
                      type="text"
                      name="room_type"
                      value={formData.room_type}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Deluxe King Suite, Standard Double"
                      className="w-full bg-midnight-100 border border-gold/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                    />
                  </div>

                  {/* Prices */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Original Price (£) *
                      </label>
                      <input
                        type="number"
                        name="original_price"
                        value={formData.original_price}
                        onChange={handleChange}
                        required
                        min="1"
                        step="0.01"
                        placeholder="250"
                        className="w-full bg-midnight-100 border border-gold/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                      />
                      <p className="text-xs text-gray-500 mt-1">Rack rate</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Minimum Bid (£) *
                      </label>
                      <input
                        type="number"
                        name="minimum_bid"
                        value={formData.minimum_bid}
                        onChange={handleChange}
                        required
                        min="1"
                        step="0.01"
                        placeholder="80"
                        className="w-full bg-midnight-100 border border-gold/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                      />
                      <p className="text-xs text-gray-500 mt-1">Won't sell below</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Starting Bid (£) *
                      </label>
                      <input
                        type="number"
                        name="starting_bid"
                        value={formData.starting_bid}
                        onChange={handleChange}
                        required
                        min="1"
                        step="0.01"
                        placeholder="95"
                        className="w-full bg-midnight-100 border border-gold/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                      />
                      <p className="text-xs text-gray-500 mt-1">First bid shown</p>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Available Date *
                      </label>
                      <select
                        name="available_date"
                        value={formData.available_date}
                        onChange={handleChange}
                        className="w-full bg-midnight-100 border border-gold/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold"
                      >
                        <option value="today">Tonight</option>
                        <option value="tomorrow">Tomorrow</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Check-in Time
                      </label>
                      <select
                        name="check_in_time"
                        value={formData.check_in_time}
                        onChange={handleChange}
                        className="w-full bg-midnight-100 border border-gold/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold"
                      >
                        <option value="2pm onwards">2pm onwards</option>
                        <option value="3pm onwards">3pm onwards</option>
                        <option value="4pm onwards">4pm onwards</option>
                        <option value="Flexible">Flexible</option>
                      </select>
                    </div>
                  </div>

                  {/* More options */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Max Guests
                      </label>
                      <select
                        name="max_guests"
                        value={formData.max_guests}
                        onChange={handleChange}
                        className="w-full bg-midnight-100 border border-gold/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold"
                      >
                        <option value="1">1 Guest</option>
                        <option value="2">2 Guests</option>
                        <option value="3">3 Guests</option>
                        <option value="4">4 Guests</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Auction Duration
                      </label>
                      <select
                        name="auction_hours"
                        value={formData.auction_hours}
                        onChange={handleChange}
                        className="w-full bg-midnight-100 border border-gold/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold"
                      >
                        <option value="1">1 hour</option>
                        <option value="2">2 hours</option>
                        <option value="4">4 hours</option>
                        <option value="6">6 hours</option>
                        <option value="12">12 hours</option>
                        <option value="24">24 hours</option>
                      </select>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full gradient-gold text-midnight font-semibold py-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {saving ? 'Creating listing...' : 'Create Room Listing'}
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </AdminLayout>
    </>
  )
}
