import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import AdminLayout from '@/components/AdminLayout'
import { supabase } from '@/lib/supabase'

export default function NewSecretHotel() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [partner, setPartner] = useState(null)
  const [regions, setRegions] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    radius_area: '',
    radius_description: '',
    region_id: '',
    star_rating: '4',
    amenities: '',
    room_type: '',
    review_score: '',
    review_count: '',
    original_value: '',
    secret_price: '',
    available_date: 'today',
    check_in_time: '3pm onwards',
    max_guests: '2',
    actual_hotel_name: '',
    actual_address: ''
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

    // Load regions
    const { data: regionsData } = await supabase
      .from('regions')
      .select('*')
      .order('display_order')

    setRegions(regionsData || [])
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

    // Calculate available date
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    const availableDate = formData.available_date === 'today' ? today : tomorrow

    // Parse amenities
    const amenitiesArray = formData.amenities
      .split(',')
      .map(a => a.trim())
      .filter(a => a.length > 0)

    const { data, error: insertError } = await supabase
      .from('secret_hotel_listings')
      .insert({
        partner_id: partner.id,
        radius_area: formData.radius_area,
        radius_description: formData.radius_description,
        region_id: formData.region_id,
        star_rating: parseInt(formData.star_rating),
        amenities: amenitiesArray,
        room_type: formData.room_type,
        review_score: formData.review_score ? parseFloat(formData.review_score) : null,
        review_count: formData.review_count ? parseInt(formData.review_count) : null,
        original_value: parseFloat(formData.original_value),
        secret_price: parseFloat(formData.secret_price),
        available_date: availableDate,
        check_in_time: formData.check_in_time,
        max_guests: parseInt(formData.max_guests),
        actual_hotel_name: formData.actual_hotel_name,
        actual_address: formData.actual_address,
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
      router.push('/admin/secret-hotels')
    }, 1500)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔮</div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Add Secret Hotel - Late Rooms Partner Portal</title>
      </Head>

      <AdminLayout partner={partner}>
        <div className="p-8 max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <Link href="/admin/secret-hotels" className="text-purple-light hover:underline text-sm mb-2 inline-block">
              ← Back to secret hotels
            </Link>
            <h1 className="font-display text-3xl font-bold text-white">🔮 Add Secret Hotel</h1>
            <p className="text-gray-400 mt-2">List anonymously to protect your brand while filling rooms</p>
          </div>

          {success ? (
            <div className="bg-purple-secret/10 border border-purple-secret/30 rounded-xl p-8 text-center">
              <span className="text-4xl mb-4 block">✅</span>
              <p className="text-purple-light text-lg font-semibold">Secret hotel listed successfully!</p>
              <p className="text-gray-400 mt-2">Redirecting...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* What customers see section */}
              <div className="bg-purple-secret/5 border border-purple-secret/20 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-purple-light mb-4">What Customers See</h2>
                <p className="text-sm text-gray-400 mb-6">This information is shown publicly - keep it anonymous</p>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Location Area *
                      </label>
                      <input
                        type="text"
                        name="radius_area"
                        value={formData.radius_area}
                        onChange={handleChange}
                        required
                        placeholder="e.g., Central London"
                        className="w-full bg-midnight-100 border border-purple-secret/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-light"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Radius Description *
                      </label>
                      <input
                        type="text"
                        name="radius_description"
                        value={formData.radius_description}
                        onChange={handleChange}
                        required
                        placeholder="e.g., 0.5 miles of Oxford Circus"
                        className="w-full bg-midnight-100 border border-purple-secret/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-light"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Region *
                      </label>
                      <select
                        name="region_id"
                        value={formData.region_id}
                        onChange={handleChange}
                        required
                        className="w-full bg-midnight-100 border border-purple-secret/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-light"
                      >
                        <option value="">Select region...</option>
                        {regions.map(region => (
                          <option key={region.id} value={region.id}>{region.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Star Rating *
                      </label>
                      <select
                        name="star_rating"
                        value={formData.star_rating}
                        onChange={handleChange}
                        className="w-full bg-midnight-100 border border-purple-secret/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-light"
                      >
                        <option value="3">3 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="5">5 Stars</option>
                      </select>
                    </div>
                  </div>

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
                      placeholder="e.g., Deluxe King Room, Superior Double"
                      className="w-full bg-midnight-100 border border-purple-secret/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-light"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Amenities
                    </label>
                    <input
                      type="text"
                      name="amenities"
                      value={formData.amenities}
                      onChange={handleChange}
                      placeholder="Spa, Pool, Restaurant (comma separated)"
                      className="w-full bg-midnight-100 border border-purple-secret/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-light"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Review Score (1-10)
                      </label>
                      <input
                        type="number"
                        name="review_score"
                        value={formData.review_score}
                        onChange={handleChange}
                        min="1"
                        max="10"
                        step="0.1"
                        placeholder="9.2"
                        className="w-full bg-midnight-100 border border-purple-secret/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-light"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Review Count
                      </label>
                      <input
                        type="number"
                        name="review_count"
                        value={formData.review_count}
                        onChange={handleChange}
                        placeholder="1500"
                        className="w-full bg-midnight-100 border border-purple-secret/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-light"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing section */}
              <div className="bg-midnight-50 border border-gold/20 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gold mb-4">Pricing</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Original Value (£) *
                    </label>
                    <input
                      type="number"
                      name="original_value"
                      value={formData.original_value}
                      onChange={handleChange}
                      required
                      min="1"
                      step="0.01"
                      placeholder="350"
                      className="w-full bg-midnight-100 border border-gold/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                    />
                    <p className="text-xs text-gray-500 mt-1">Shown as "Worth up to"</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Secret Price (£) *
                    </label>
                    <input
                      type="number"
                      name="secret_price"
                      value={formData.secret_price}
                      onChange={handleChange}
                      required
                      min="1"
                      step="0.01"
                      placeholder="149"
                      className="w-full bg-midnight-100 border border-gold/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                    />
                    <p className="text-xs text-gray-500 mt-1">Fixed booking price</p>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="grid grid-cols-3 gap-4">
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
                  </select>
                </div>
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
              </div>

              {/* Hidden info section */}
              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-red-400 mb-2">🔒 Hidden Until Booking</h2>
                <p className="text-sm text-gray-400 mb-4">This is only revealed after customer completes payment</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Actual Hotel Name *
                    </label>
                    <input
                      type="text"
                      name="actual_hotel_name"
                      value={formData.actual_hotel_name}
                      onChange={handleChange}
                      required
                      placeholder="The Langham London"
                      className="w-full bg-midnight-100 border border-red-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Actual Address *
                    </label>
                    <input
                      type="text"
                      name="actual_address"
                      value={formData.actual_address}
                      onChange={handleChange}
                      required
                      placeholder="1C Portland Place, London W1B 1JA"
                      className="w-full bg-midnight-100 border border-red-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-400"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full gradient-purple text-white font-semibold py-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? 'Creating listing...' : 'Create Secret Hotel Listing'}
                </button>
              </div>
            </form>
          )}
        </div>
      </AdminLayout>
    </>
  )
}
