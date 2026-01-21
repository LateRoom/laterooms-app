import Link from 'next/link'

export default function SecretHotelCard({ hotel }) {
  const discount = Math.round(((hotel.original_value - hotel.secret_price) / hotel.original_value) * 100)
  const stars = '★'.repeat(hotel.star_rating) + '☆'.repeat(5 - hotel.star_rating)

  return (
    <div className="bg-gradient-to-br from-purple-secret/10 to-purple-light/5 border border-purple-secret/25 rounded-2xl overflow-hidden hover:border-purple-secret/40 transition-all duration-300 animate-slide-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-secret/20 to-purple-light/10 p-5 flex justify-between items-start">
        <div className="relative">
          <span className="text-4xl opacity-80">🔮</span>
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold text-purple-light">?</span>
        </div>
        <span className="gradient-purple text-white text-xs font-bold px-3 py-1 rounded-full">
          {discount}% OFF
        </span>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Hotel info */}
        <div>
          <h3 className="font-display text-xl font-semibold text-purple-light mb-2">
            Secret {hotel.star_rating}-Star Hotel
          </h3>
          <p className="text-purple-light text-sm mb-3">{stars}</p>
          <div className="bg-purple-secret/15 p-3 rounded-lg">
            <p className="text-sm text-gray-300">
              📍 Within {hotel.radius_description}
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-2">{hotel.region_name}</p>
        </div>

        {/* Amenities */}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {hotel.amenities.slice(0, 3).map((amenity, i) => (
              <span
                key={i}
                className="text-xs bg-purple-secret/15 text-gray-300 px-2 py-1 rounded-lg"
              >
                {amenity}
              </span>
            ))}
          </div>
        )}

        {/* Room type */}
        <div className="bg-purple-secret/10 border border-purple-secret/20 p-2 rounded-lg text-center">
          <p className="text-sm text-purple-light font-medium">{hotel.room_type}</p>
        </div>

        {/* Review score */}
        {hotel.review_score && (
          <div className="flex items-center gap-2">
            <span className="gradient-purple text-white text-sm font-bold px-2 py-1 rounded-lg">
              {hotel.review_score}
            </span>
            <span className="text-sm text-gray-300">Excellent</span>
            <span className="text-xs text-gray-500">({hotel.review_count?.toLocaleString()} reviews)</span>
          </div>
        )}

        {/* Price section */}
        <div className="bg-purple-secret/10 p-4 rounded-xl text-center">
          <p className="text-xs text-gray-500">Worth up to <span className="line-through">£{hotel.original_value}</span></p>
          <p className="font-display text-3xl font-bold text-purple-light mt-1">£{hotel.secret_price}</p>
        </div>

        {/* Meta info */}
        <div className="flex gap-4 text-sm text-gray-400">
          <span>📅 {hotel.available_date === new Date().toISOString().split('T')[0] ? 'Tonight' : 'Tomorrow'}</span>
          <span>🚪 {hotel.check_in_time}</span>
        </div>
      </div>

      {/* Action button */}
      <Link
        href={`/secret/${hotel.id}`}
        className="block w-full py-4 gradient-purple text-white font-semibold text-center hover:opacity-90 transition-opacity"
      >
        Book Now · £{hotel.secret_price}
      </Link>
    </div>
  )
}
