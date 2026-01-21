import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

export default function AdminLayout({ children, partner }) {
  const router = useRouter()
  const currentPath = router.pathname

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/rooms', label: 'Room Auctions', icon: '🏨' },
    { href: '/admin/secret-hotels', label: 'Secret Hotels', icon: '🔮' },
    { href: '/admin/bookings', label: 'Bookings', icon: '📋' },
  ]

  return (
    <div className="min-h-screen bg-midnight flex">
      {/* Sidebar */}
      <aside className="w-64 bg-midnight-50 border-r border-gold/20 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gold/10">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="text-2xl">🌙</span>
            <div>
              <h1 className="font-display text-lg font-bold text-gold">Late Rooms</h1>
              <p className="text-xs text-gray-500">Partner Portal</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPath === item.href
                  ? 'bg-gold/10 text-gold'
                  : 'text-gray-400 hover:bg-gold/5 hover:text-gray-300'
              }`}
            >
              <span>{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Partner info */}
        <div className="p-4 border-t border-gold/10">
          {partner && (
            <div className="mb-3">
              <p className="text-sm text-white font-medium truncate">{partner.company_name}</p>
              <p className="text-xs text-gray-500 truncate">{partner.contact_email}</p>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="w-full text-left text-sm text-gray-400 hover:text-gold transition-colors"
          >
            ← Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
