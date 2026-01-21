import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function RoomCard({ room }) {
  const [timeLeft, setTimeLeft] = useState('')
  const [urgency, setUrgency] = useState('normal')

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const ends = new Date(room.auction_ends_at)
      const diff = ends - now

      if (diff <= 0) {
        setTimeLeft('Ended')
        setUrgency('ended')
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`)
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`)
      } else {
        setTimeLeft(`${seconds}s`)
      }

      // Set urgency level
      if (diff < 30 * 60 * 1000) {
        setUrgency('urgent') // Less than 30 mins
      } else if (diff < 60 * 60 * 1000) {
        setUrgency('soon') // Less than 1 hour
      } else {
        setUrgency('normal')
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [room.auction_ends_at])

  const currentBid = room.current_bid || room.starting_bid
  const discount = Math.round(((room.original_price - currentBid) / room.original_price) * 100)
  const stars = '★'.repeat(room.star_rating) + '☆'.repeat(5 - room.star_rating)

  const urgencyColors = {
    urgent: 'text-red-400 animate-pulse-slow',
    soon: 'text-amber-400',
    normal: 'text-green-400',
    ended: 'text-gray-500'
  }

  return (
    <div className="bg-midnight-50/50 border border-gold/15 rounded-2xl overflow-hidden hover:border-gold/30 transition-all duration-300 animate-slide-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-gold/10 to-gold/5 p-5 flex justify-between items-start">
        <span className="text-4xl">🏨</span>
        <span className="gradient-gold text-midnight text-xs font-bold px-3 py-1 rounded-full">
          {discount}% OFF
        </span>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Hotel info */}
        <div>
          <h3 className="font-display text-xl font-semibold text-white mb-1">
            {room.hotel_name}
          </h3>
          <p className="text-sm text-gray-400">
            📍 {room.area_name}, {room.region_name}
          </p>
          <p className="text-gold text-sm mt-1">{stars}</p>
        </div>

        {/* Amenities */}
        {room.amenities && room.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {room.amenities.slice(0, 3).map((amenity, i) => (
              <span
                key={i}
                className="text-xs bg-gold/10 text-gray-300 px-2 py-1 rounded-lg"
              >
                {amenity}
              </span>
            ))}
          </div>
        )}

        {/* Price section */}
        <div className="bg-black/30 p-4 rounded-xl flex justify-between items-center">
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Was</p>
            <p className="text-lg text-gray-500 line-through">£{room.original_price}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Current Bid</p>
            <p className="font-display text-2xl font-bold text-gold">£{currentBid}</p>
          </div>
        </div>

        {/* Meta info */}
        <div className="flex gap-4 text-sm text-gray-400">
          <span>📅 {room.available_date === new Date().toISOString().split('T')[0] ? 'Tonight' : 'Tomorrow'}</span>
          <span>🚪 {room.check_in_time}</span>
        </div>

        {/* Auction info */}
        <div className="flex justify-between items-center pt-3 border-t border-gold/10">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300">👤 {room.bid_count || 0}</span>
            <span className="text-xs text-gray-500">bidding</span>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Ends in</p>
            <p className={`text-lg font-semibold ${urgencyColors[urgency]}`}>
              {timeLeft}
            </p>
          </div>
        </div>
      </div>

      {/* Action button */}
      <Link
        href={`/room/${room.id}`}
        className="block w-full py-4 gradient-gold text-midnight font-semibold text-center hover:opacity-90 transition-opacity"
      >
        Place Bid
      </Link>
    </div>
  )
}
