import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import AdminLayout from '@/components/AdminLayout'
import { supabase } from '@/lib/supabase'

export default function AdminSecretHotels() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [partner, setPartner] = useState(null)
  const [hotels, setHotels] = useState([])

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
    await loadHotels(partnerData.id)
    setLoading(false)
  }

  const loadHotels = async (partnerId) => {
    const { data } = await supabase
      .from('secret_hotel_listings')
      .select('*, regions(name)')
      .eq('partner_id', partnerId)
      .order('created_at', { ascending: false })

    setHotels(data || [])
  }

  const cancelListing = async (hotelId) => {
    if (!confirm('Are you sure you want to cancel this listing?')) return

    const { error } = await supabase
      .from('secret_hotel_listings')
      .update({ status: 'cancelled' })
      .eq('id', hotelId)

    if (!error) {
      loadHotels(partner.id)
    }
  }

  const getStatusBadge = (hotel) => {
    if (hotel.status === 'cancelled') {
      return <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-1 rounded-full">Cancelled</span>
    }
    if (hotel.status === 'sold') {
      return <span className="text-xs bg-purple-light/20 text-purple-light px-2 py-1 rounded-full">Sold</span>
    }
    return <span className="text-xs bg-purple-light/20 text-purple-light px-2 py-1 rounded-full">Live</span>
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
        <title>Secret Hotels - Late Rooms Partner Portal</title>
      </Head>

      <AdminLayout partner={partner}>
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-white">🔮 Secret Hotels</h1>
              <p className="text-gray-400 mt-1">Anonymous listings that protect your brand</p>
            </div>
            <Link
              href="/admin/secret-hotels/new"
              className="gradient-purple text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              + Add Secret Hotel
            </Link>
          </div>

          {/* Info banner */}
          <div className="bg-purple-secret/10 border border-purple-secret/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-300">
              <strong className="text-purple-light">Brand Protection:</strong> Your hotel name is hidden until after booking. 
              Customers only see star rating, location radius, and amenities.
            </p>
          </div>

          {/* Hotels table */}
          {hotels.length > 0 ? (
            <div className="bg-midnight-50 border border-purple-secret/20 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-secret/10">
                    <th className="text-left text-sm font-medium text-gray-400 px-6 py-4">Listing</th>
                    <th className="text-left text-sm font-medium text-gray-400 px-6 py-4">Actual Hotel</th>
                    <th className="text-left text-sm font-medium text-gray-400 px-6 py-4">Region</th>
                    <th className="text-left text-sm font-medium text-gray-400 px-6 py-4">Price</th>
                    <th className="text-left text-sm font-medium text-gray-400 px-6 py-4">Date</th>
                    <th className="text-left text-sm font-medium text-gray-400 px-6 py-4">Status</th>
                    <th className="text-left text-sm font-medium text-gray-400 px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hotels.map(hotel => (
                    <tr key={hotel.id} className="border-b border-purple-secret/5 hover:bg-purple-secret/5">
                      <td className="px-6 py-4">
                        <p className="text-purple-light font-medium">
                          Secret {hotel.star_rating}-Star · {hotel.room_type}
                        </p>
                        <p className="text-sm text-gray-400">{hotel.radius_description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-300 text-sm">{hotel.actual_hotel_name}</p>
                        <p className="text-xs text-gray-500">(Hidden from customers)</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-300 text-sm">{hotel.regions?.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-400 line-through text-sm">£{hotel.original_value}</p>
                        <p className="text-purple-light font-semibold">£{hotel.secret_price}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-300">
                          {hotel.available_date === new Date().toISOString().split('T')[0] ? 'Tonight' : 'Tomorrow'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(hotel)}
                      </td>
                      <td className="px-6 py-4">
                        {hotel.status === 'active' && (
                          <button
                            onClick={() => cancelListing(hotel.id)}
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
            <div className="bg-midnight-50 border border-purple-secret/20 rounded-xl p-12 text-center">
              <span className="text-5xl mb-4 block">🔮</span>
              <p className="text-white font-semibold mb-2">No secret hotel listings yet</p>
              <p className="text-gray-400 mb-6">List rooms anonymously to protect your brand while filling inventory</p>
              <Link
                href="/admin/secret-hotels/new"
                className="inline-block gradient-purple text-white font-semibold px-6 py-3 rounded-lg"
              >
                Add Your First Secret Hotel
              </Link>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  )
}
