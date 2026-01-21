import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Header from '@/components/Header'
import { supabase } from '@/lib/supabase'

export default function RoomDetail({ session }) {
  const router = useRouter()
  const { id } = router.query
  
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bidAmount, setBidAmount] = useState('')
  const [bidding, setBidding] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if (id) {
      fetchRoom()
    }
  }, [id])

  useEffect(() => {
    if (!room) return

    const updateTimer = () => {
      const now = new Date()
      const ends = new Date(room.auction_ends_at)
      const diff = ends - now

      if (diff <= 0) {
        setTimeLeft('Auction Ended')
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`)
      } else {
        setTimeLeft(`${seconds}s`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [room])

  const fetchRoom = async () => {
    setLoading(true)
    
    const { data, error } = await supabase
      .from('room_listings_full')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching room:', error)
    } else {
      setRoom(data)
      setBidAmount('')
    }
    setLoading(false)
  }

  const handleBid = async (e) => {
    e.preventDefault()
    
    if (!session) {
      router.push('/login')
      return
    }

    setError(null)
    setSuccess(null)
    setBidding(true)

    const amount = parseFloat(bidAmount)
    const currentBid = room.current_bid || room.starting_bid

    if (amount <= currentBid) {
      setError(`Bid must be higher than £${currentBid}`)
      setBidding(false)
      return
    }

    const { data, error } = await supabase
      .from('bids')
      .insert({
        listing_id: room.id,
        customer_id: session.user.id,
        amount: amount
      })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(`Bid of £${amount} placed successfully!`)
      setBidAmount('')
      fetchRoom() // Refresh room data
    }
    setBidding(false)
  }

  const quickBid = (increment) => {
    const currentBid = room.current_bid || room.starting_bid
    setBidAmount((currentBid + increment).toString())
  }

  if (loading) {
    return (
      <>
        <Header session={session} />
        <div className="min-h-screen bg-midnight flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">🌙</div>
            <p className="text-gray-400">Loading room details...</p>
          </div>
        </div>
      </>
    )
  }

  if (!room) {
    return (
      <>
        <Header session={session} />
        <div className="min-h-screen bg-midnight flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">😕</div>
            <p className="text-gray-400 mb-4">Room not found</p>
            <Link href="/" className="text-gold hover:underline">
              Back to listings
            </Link>
          </div>
        </div>
      </>
    )
  }

  const currentBid = room.current_bid || room.starting_bid
  const discount = Math.round(((room.original_price - currentBid) / room.original_price) * 100)
  const stars = '★'.repeat(room.star_rating) + '☆'.repeat(5 - room.star_rating)
  const auctionEnded = new Date(room.auction_ends_at) <= new Date()

  return (
    <>
      <Head>
        <title>{room.hotel_name} - Late Rooms</title>
      </Head>

      <Header session={session} />

      <main className="min-h-screen bg-midnight py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back link */}
          <Link href="/" className="inline-flex items-center text-gold hover:underline mb-6">
            ← Back to listings
          </Link>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left column - Room info */}
            <div className="space-y-6">
              <div className="bg-midnight-50 border border-gold/20 rounded-2xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-5xl">🏨</span>
                  <span className="gradient-gold text-midnight text-sm font-bold px-3 py-1 rounded-full">
                    {discount}% OFF
                  </span>
                </div>
                
                <h1 className="font-display text-3xl font-bold text-white mb-2">
                  {room.hotel_name}
                </h1>
                <p className="text-gray-400 mb-2">
                  📍 {room.area_name}, {room.region_name}
                </p>
                <p className="text-gold text-lg mb-4">{stars}</p>

                {room.amenities && room.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {room.amenities.map((amenity, i) => (
                      <span
                        key={i}
                        className="text-sm bg-gold/10 text-gray-300 px-3 py-1 rounded-lg"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
                  <div>📅 {room.available_date === new Date().toISOString().split('T')[0] ? 'Tonight' : 'Tomorrow'}</div>
                  <div>🚪 {room.check_in_time}</div>
                  <div>👥 Max {room.max_guests} guests</div>
                  <div>🛏️ {room.room_type}</div>
                </div>
              </div>
            </div>

            {/* Right column - Bidding */}
            <div className="space-y-6">
              {/* Auction status */}
              <div className="bg-midnight-50 border border-gold/20 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Original Price</p>
                    <p className="text-xl text-gray-500 line-through">£{room.original_price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Current Bid</p>
                    <p className="font-display text-4xl font-bold text-gold">£{currentBid}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center py-4 border-t border-b border-gold/10 mb-6">
                  <div className="flex items-center gap-2">
                    <span>👤</span>
                    <span className="text-gray-300">{room.bid_count || 0} bids</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Ends in</p>
                    <p className={`text-lg font-semibold ${auctionEnded ? 'text-gray-500' : 'text-green-400'}`}>
                      {timeLeft}
                    </p>
                  </div>
                </div>

                {auctionEnded ? (
                  <div className="text-center py-4">
                    <p className="text-gray-400">This auction has ended</p>
                  </div>
                ) : (
                  <form onSubmit={handleBid} className="space-y-4">
                    {error && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                        {error}
                      </div>
                    )}
                    {success && (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-green-400 text-sm">
                        {success}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Your Bid (£)</label>
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={`Min £${currentBid + 1}`}
                        min={currentBid + 1}
                        step="1"
                        required
                        className="w-full bg-black/30 border border-gold/30 rounded-lg px-4 py-3 text-white text-lg placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>

                    <div className="flex gap-2">
                      {[5, 10, 20, 50].map(increment => (
                        <button
                          key={increment}
                          type="button"
                          onClick={() => quickBid(increment)}
                          className="flex-1 py-2 border border-gold/30 rounded-lg text-gold text-sm hover:bg-gold/10 transition-colors"
                        >
                          +£{increment}
                        </button>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={bidding || !bidAmount}
                      className="w-full gradient-gold text-midnight font-semibold py-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {bidding ? 'Placing bid...' : bidAmount ? `Place Bid: £${bidAmount}` : 'Enter an amount'}
                    </button>

                    {!session && (
                      <p className="text-center text-sm text-gray-500">
                        You'll need to <Link href="/login" className="text-gold hover:underline">sign in</Link> to place a bid
                      </p>
                    )}
                  </form>
                )}
              </div>

              {/* Info note */}
              <div className="bg-gold/5 border border-gold/10 rounded-xl p-4">
                <p className="text-sm text-gray-400">
                  💡 If you win, you'll pay your bid amount. Check in {room.check_in_time?.toLowerCase()}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
