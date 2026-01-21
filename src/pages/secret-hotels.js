import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Header from '@/components/Header'
import SecretHotelCard from '@/components/SecretHotelCard'
import { supabase } from '@/lib/supabase'

export default function SecretHotels({ session }) {
  const [hotels, setHotels] = useState([])
  const [regions, setRegions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [timeFilter, setTimeFilter] = useState('all')

  useEffect(() => {
    fetchRegions()
    fetchHotels()
  }, [])

  const fetchRegions = async () => {
    const { data, error } = await supabase
      .from('regions')
      .select('*')
      .order('display_order')
    
    if (data) setRegions(data)
  }

  const fetchHotels = async () => {
    setLoading(true)
    
    const { data, error } = await supabase
      .from('secret_listings_full')
      .select('*')
      .eq('status', 'active')
      .order('secret_price', { ascending: true })
    
    if (error) {
      console.error('Error fetching secret hotels:', error)
    } else {
      setHotels(data || [])
    }
    setLoading(false)
  }

  // Filter hotels based on selections
  const filteredHotels = hotels.filter(hotel => {
    if (selectedRegion !== 'all' && hotel.region_name !== selectedRegion) return false
    
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    
    if (timeFilter === 'tonight' && hotel.available_date !== today) return false
    if (timeFilter === 'tomorrow' && hotel.available_date !== tomorrow) return false
    
    return true
  })

  return (
    <>
      <Head>
        <title>Secret Hotels - Late Rooms</title>
      </Head>

      <Header session={session} />

      <main className="min-h-screen bg-midnight">
        {/* Hero section */}
        <div className="bg-gradient-to-b from-purple-secret/10 to-transparent py-12 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="text-5xl mb-4">🔮</div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-purple-light mb-4">
              Secret Hotels
            </h1>
            <p className="text-gray-400 text-lg mb-4 max-w-2xl mx-auto">
              Premium hotels at incredible prices. Hotel name revealed after booking to protect brand value.
            </p>
            <p className="text-sm text-gray-500">
              You'll see the star rating, location radius, and amenities before you book.
            </p>
          </div>
        </div>

        {/* Info banner */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-purple-secret/10 border border-purple-secret/20 rounded-xl p-4 flex items-start gap-4">
            <span className="text-2xl">🔒</span>
            <div>
              <p className="text-sm text-gray-300">
                <strong className="text-purple-light">How it works:</strong> You book at a fixed discounted price. 
                The hotel name and exact address are sent to your email immediately after payment.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="font-display text-2xl text-white">Available Secret Hotels</h2>
            
            <div className="flex flex-wrap gap-3">
              {/* Region filter */}
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-midnight-100 border border-purple-secret/30 rounded-full px-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-purple-secret"
              >
                <option value="all">🇬🇧 All UK</option>
                {regions.map(region => (
                  <option key={region.id} value={region.name}>{region.name}</option>
                ))}
              </select>

              {/* Time filters */}
              <div className="flex gap-2">
                {['all', 'tonight', 'tomorrow'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setTimeFilter(filter)}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      timeFilter === filter
                        ? 'gradient-purple text-white font-semibold'
                        : 'border border-purple-secret/30 text-gray-300 hover:bg-purple-secret/10'
                    }`}
                  >
                    {filter === 'all' ? 'All Times' : 
                     filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-gray-500 mb-6">
            {filteredHotels.length} secret hotel{filteredHotels.length !== 1 ? 's' : ''} available
          </p>

          {/* Hotel grid */}
          {loading ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-4">🔮</div>
              <p className="text-gray-400">Loading secret hotels...</p>
            </div>
          ) : filteredHotels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHotels.map(hotel => (
                <SecretHotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-4xl mb-4">🔮</div>
              <p className="text-gray-400 mb-4">No secret hotels match your filters</p>
              <button
                onClick={() => {
                  setSelectedRegion('all')
                  setTimeFilter('all')
                }}
                className="text-purple-light hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>

        {/* CTA section */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/20 rounded-2xl p-8 text-center">
            <h2 className="font-display text-2xl font-bold text-gold mb-3">
              🏨 Prefer to Know the Hotel?
            </h2>
            <p className="text-gray-400 mb-6">
              Browse our regular auction listings where you can see hotel names and bid for rooms
            </p>
            <Link
              href="/"
              className="inline-block gradient-gold text-midnight font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              Browse Hotel Auctions
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-purple-secret/10 py-8 px-4">
          <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
            <p>© 2026 Late Rooms · Last-minute luxury hotel deals across the UK</p>
          </div>
        </footer>
      </main>
    </>
  )
}
