import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Header from '@/components/Header'
import RoomCard from '@/components/RoomCard'
import { supabase } from '@/lib/supabase'

export default function Home({ session }) {
  const [rooms, setRooms] = useState([])
  const [regions, setRegions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [timeFilter, setTimeFilter] = useState('all')

  useEffect(() => {
    fetchRegions()
    fetchRooms()
  }, [])

  const fetchRegions = async () => {
    const { data, error } = await supabase
      .from('regions')
      .select('*')
      .order('display_order')
    
    if (data) setRegions(data)
  }

  const fetchRooms = async () => {
    setLoading(true)
    
    const { data, error } = await supabase
      .from('room_listings_full')
      .select('*')
      .eq('status', 'active')
      .gt('auction_ends_at', new Date().toISOString())
      .order('auction_ends_at', { ascending: true })
    
    if (error) {
      console.error('Error fetching rooms:', error)
    } else {
      setRooms(data || [])
    }
    setLoading(false)
  }

  // Filter rooms based on selections
  const filteredRooms = rooms.filter(room => {
    if (selectedRegion !== 'all' && room.region_name !== selectedRegion) return false
    
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    
    if (timeFilter === 'tonight' && room.available_date !== today) return false
    if (timeFilter === 'tomorrow' && room.available_date !== tomorrow) return false
    if (timeFilter === 'ending') {
      const endsAt = new Date(room.auction_ends_at)
      const oneHourFromNow = new Date(Date.now() + 3600000)
      if (endsAt > oneHourFromNow) return false
    }
    
    return true
  })

  return (
    <>
      <Head>
        <title>Late Rooms - Last-Minute Hotel Deals UK</title>
      </Head>

      <Header session={session} />

      <main className="min-h-screen bg-midnight">
        {/* Hero section */}
        <div className="bg-gradient-to-b from-gold/5 to-transparent py-12 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-gold mb-4">
              Last-Minute Luxury
            </h1>
            <p className="text-gray-400 text-lg mb-8">
              Bid on premium hotel rooms for tonight and tomorrow across the UK
            </p>
            
            {/* Stats */}
            <div className="flex justify-center gap-8 md:gap-16">
              <div>
                <p className="font-display text-3xl font-bold text-gold">{rooms.length}</p>
                <p className="text-sm text-gray-500">Rooms Live</p>
              </div>
              <div className="w-px bg-gold/20"></div>
              <div>
                <p className="font-display text-3xl font-bold text-gold">
                  {rooms.reduce((acc, r) => acc + (r.bid_count || 0), 0)}
                </p>
                <p className="text-sm text-gray-500">Active Bids</p>
              </div>
              <div className="w-px bg-gold/20"></div>
              <div>
                <Link href="/secret-hotels" className="block">
                  <p className="font-display text-3xl font-bold text-purple-light">🔮</p>
                  <p className="text-sm text-purple-light">Secret Hotels</p>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="font-display text-2xl text-white">Available Rooms</h2>
            
            <div className="flex flex-wrap gap-3">
              {/* Region filter */}
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-midnight-100 border border-gold/30 rounded-full px-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-gold"
              >
                <option value="all">🇬🇧 All UK</option>
                {regions.map(region => (
                  <option key={region.id} value={region.name}>{region.name}</option>
                ))}
              </select>

              {/* Time filters */}
              <div className="flex gap-2">
                {['all', 'tonight', 'tomorrow', 'ending'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setTimeFilter(filter)}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      timeFilter === filter
                        ? 'gradient-gold text-midnight font-semibold'
                        : 'border border-gold/30 text-gray-300 hover:bg-gold/10'
                    }`}
                  >
                    {filter === 'all' ? 'All Times' : 
                     filter === 'ending' ? '⏱ Ending Soon' : 
                     filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-gray-500 mb-6">
            {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''} available
          </p>

          {/* Room grid */}
          {loading ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-4">🌙</div>
              <p className="text-gray-400">Loading rooms...</p>
            </div>
          ) : filteredRooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map(room => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-4xl mb-4">🌙</div>
              <p className="text-gray-400 mb-4">No rooms match your filters</p>
              <button
                onClick={() => {
                  setSelectedRegion('all')
                  setTimeFilter('all')
                }}
                className="text-gold hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>

        {/* CTA section */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="bg-gradient-to-r from-purple-secret/20 to-purple-light/10 border border-purple-secret/30 rounded-2xl p-8 text-center">
            <h2 className="font-display text-2xl font-bold text-purple-light mb-3">
              🔮 Looking for Secret Hotels?
            </h2>
            <p className="text-gray-400 mb-6">
              Get luxury rooms at fixed prices without revealing the hotel name until after booking
            </p>
            <Link
              href="/secret-hotels"
              className="inline-block gradient-purple text-white font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              Browse Secret Hotels
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gold/10 py-8 px-4">
          <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
            <p>© 2026 Late Rooms · Last-minute luxury hotel deals across the UK</p>
          </div>
        </footer>
      </main>
    </>
  )
}
