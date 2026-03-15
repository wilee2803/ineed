'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase'
import LocaleSwitcher from '@/components/ui/LocaleSwitcher'
import {
  LayoutDashboard, Home, ShieldCheck, AlertTriangle,
  TrendingUp, Users, Map, Settings, LogOut,
} from 'lucide-react'

export default function Sidebar() {
  const path = usePathname()
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations('admin.nav')
  const tCommon = useTranslations('common')

  const nav = [
    { href: `/${locale}/dashboard`,  label: t('dashboard'), icon: LayoutDashboard },
    { href: `/${locale}/listings`,  label: t('listings'),  icon: Home },
    { href: `/${locale}/kyc`,       label: t('kyc'),       icon: ShieldCheck },
    { href: `/${locale}/disputes`,  label: t('disputes'),  icon: AlertTriangle },
    { href: `/${locale}/revenue`,   label: t('revenue'),   icon: TrendingUp },
    { href: `/${locale}/users`,     label: t('users'),     icon: Users },
    { href: `/${locale}/markets`,   label: t('markets'),   icon: Map },
    { href: `/${locale}/settings`,  label: t('settings'),  icon: Settings },
  ]

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push(`/${locale}/login`)
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-[#0e0e1a] border-r border-white/[0.06] flex flex-col z-30">
      <div className="px-6 py-5 border-b border-white/[0.06]">
        <span className="text-2xl font-black tracking-tight text-white">
          i<span className="text-indigo-400">need</span>
        </span>
        <div className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase mt-0.5">
          Admin Panel
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = path === href || (href !== `/${locale}/dashboard` && path.startsWith(href))
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/[0.05] hover:text-white'
              }`}>
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-3 border-t border-white/[0.06]">
        <LocaleSwitcher />
      </div>

      <div className="px-3 pb-4">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors">
          <LogOut size={16} />
          {tCommon('logout')}
        </button>
      </div>
    </aside>
  )
}
