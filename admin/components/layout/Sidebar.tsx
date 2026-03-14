'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Home, ShieldCheck, AlertTriangle,
  TrendingUp, Users, Map, Settings, LogOut,
} from 'lucide-react'

const nav = [
  { href: '/',          label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/listings',  label: 'Listings',       icon: Home },
  { href: '/kyc',       label: 'KYC Review',     icon: ShieldCheck },
  { href: '/disputes',  label: 'Disputes',       icon: AlertTriangle },
  { href: '/revenue',   label: 'Umsatz',         icon: TrendingUp },
  { href: '/users',     label: 'User Mgmt',      icon: Users },
  { href: '/markets',   label: 'Märkte',         icon: Map },
  { href: '/settings',  label: 'Einstellungen',  icon: Settings },
]

export default function Sidebar() {
  const path = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-[#0e0e1a] border-r border-white/[0.06] flex flex-col z-30">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/[0.06]">
        <span className="text-2xl font-black tracking-tight text-white">
          i<span className="text-indigo-400">need</span>
        </span>
        <div className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase mt-0.5">
          Admin Panel
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = path === href || (href !== '/' && path.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:bg-white/[0.05] hover:text-white'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/[0.06]">
        <Link
          href="/login"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
        >
          <LogOut size={16} />
          Abmelden
        </Link>
      </div>
    </aside>
  )
}
