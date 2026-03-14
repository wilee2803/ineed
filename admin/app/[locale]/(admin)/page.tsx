import { supabaseAdmin } from '@/lib/supabase-admin'
import { getTranslations, getLocale } from 'next-intl/server'
import { AlertTriangle, ShieldCheck, Home, TrendingUp, Users } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'

async function getStats() {
  const [
    { count: listings },
    { count: users },
    { count: pendingKyc },
    { count: pendingListings },
    { count: openDisputes },
    { data: recentClosings },
  ] = await Promise.all([
    supabaseAdmin.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('kyc_status', 'pending'),
    supabaseAdmin.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'pending_review'),
    supabaseAdmin.from('disputes').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabaseAdmin.from('closings').select('commission_amount, closing_type, created_at').eq('status', 'paid').order('created_at', { ascending: false }).limit(5),
  ])
  const mrr = recentClosings?.reduce((s, c) => s + Number(c.commission_amount), 0) ?? 0
  return { listings, users, pendingKyc, pendingListings, openDisputes, mrr, recentClosings }
}

export default async function DashboardPage() {
  const t = await getTranslations('admin.dashboard')
  const tCommon = await getTranslations('common')
  const locale = await getLocale()
  const stats = await getStats()

  const kpis = [
    { label: t('kpi_listings'), key: 'listings', icon: Home, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: t('kpi_users'), key: 'users', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: t('kpi_disputes'), key: 'openDisputes', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: t('kpi_kyc'), key: 'pendingKyc', icon: ShieldCheck, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  ]

  const alerts = [
    { href: `/${locale}/disputes`, icon: AlertTriangle, label: t('disputes_label'), sub: t('disputes_sub'), count: stats.openDisputes ?? 0, urgent: true },
    { href: `/${locale}/kyc`, icon: ShieldCheck, label: t('kyc_label'), sub: t('kyc_sub'), count: stats.pendingKyc ?? 0, urgent: false },
    { href: `/${locale}/listings`, icon: Home, label: t('listings_label'), sub: t('listings_sub'), count: stats.pendingListings ?? 0, urgent: false },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map(({ label, key, icon: Icon, color, bg }) => (
          <div key={key} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className={`inline-flex p-2 rounded-lg ${bg} mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <div className="text-3xl font-black text-gray-900">{(stats as any)[key] ?? 0}</div>
            <div className="text-xs text-gray-500 mt-1 font-medium">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-4">{t('open_tasks')}</h2>
          <div className="space-y-2">
            {alerts.map(({ href, icon: Icon, label, sub, count, urgent }) => (
              <Link key={href} href={href}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors hover:bg-gray-50 ${urgent && count > 0 ? 'border-red-200 bg-red-50/50' : 'border-gray-100'}`}>
                <Icon size={18} className={urgent && count > 0 ? 'text-red-500' : 'text-gray-400'} />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-800">{label}</div>
                  <div className="text-xs text-gray-500">{sub}</div>
                </div>
                <Badge variant={urgent && count > 0 ? 'red' : count > 0 ? 'yellow' : 'grey'}>{count}</Badge>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-4">{t('recent_closings')}</h2>
          {stats.recentClosings && stats.recentClosings.length > 0 ? (
            <div className="space-y-2">
              {stats.recentClosings.map((c: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <Badge variant={c.closing_type === 'sale' ? 'green' : 'indigo'}>
                      {c.closing_type === 'sale' ? tCommon('sale') : tCommon('rent')}
                    </Badge>
                    <span className="text-xs text-gray-500">{new Date(c.created_at).toLocaleDateString(locale)}</span>
                  </div>
                  <span className="text-sm font-bold text-indigo-600">€ {Number(c.commission_amount).toLocaleString(locale)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <TrendingUp size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">{t('no_closings')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
