import { supabaseAdmin } from '@/lib/supabase-admin'
import { getTranslations, getLocale } from 'next-intl/server'
import Badge from '@/components/ui/Badge'
import { TrendingUp } from 'lucide-react'

async function getRevenue() {
  const [{ data: closings }, { data: pending }] = await Promise.all([
    supabaseAdmin
      .from('closings')
      .select('*, lister:profiles!lister_id(full_name), seeker:profiles!seeker_id(full_name), listing:listings(title, address_city)')
      .order('created_at', { ascending: false }).limit(100),
    supabaseAdmin
      .from('closings')
      .select('*, lister:profiles!lister_id(full_name), seeker:profiles!seeker_id(full_name), listing:listings(title)')
      .eq('status', 'pending').order('created_at', { ascending: false }),
  ])
  const all = closings ?? []
  const paid = all.filter((c: any) => c.status === 'paid')
  const totalCommission = paid.reduce((s: number, c: any) => s + Number(c.commission_amount), 0)
  const rentCommission = paid.filter((c: any) => c.closing_type === 'rent').reduce((s: number, c: any) => s + Number(c.commission_amount), 0)
  const saleCommission = paid.filter((c: any) => c.closing_type === 'sale').reduce((s: number, c: any) => s + Number(c.commission_amount), 0)
  return { closings: all, pending: pending ?? [], totalCommission, rentCommission, saleCommission }
}

export default async function RevenuePage() {
  const { closings, pending, totalCommission, rentCommission, saleCommission } = await getRevenue()
  const t = await getTranslations('admin.revenue')
  const tCommon = await getTranslations('common')
  const locale = await getLocale()

  const kpis = [
    { label: t('kpi_total'), value: `€ ${totalCommission.toLocaleString(locale)}`, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: t('kpi_rent'), value: `€ ${rentCommission.toLocaleString(locale)}`, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: t('kpi_sale'), value: `€ ${saleCommission.toLocaleString(locale)}`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: t('kpi_pending'), value: `${pending.length} ${t('kpi_pending_unit')}`, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className={`text-2xl font-black ${k.color} mb-1`}>{k.value}</div>
            <div className="text-xs text-gray-500 font-medium">{k.label}</div>
          </div>
        ))}
      </div>

      {pending.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="font-bold text-gray-800 mb-4">{t('pending_title')}</h2>
          <div className="space-y-2">
            {pending.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                <div>
                  <div className="text-sm font-semibold text-gray-800">{c.listing?.title}</div>
                  <div className="text-xs text-gray-500">
                    {c.lister?.full_name} → {c.seeker?.full_name} ·{' '}
                    <Badge variant={c.closing_type === 'rent' ? 'indigo' : 'green'}>
                      {c.closing_type === 'rent' ? tCommon('rent') : tCommon('sale')}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-indigo-600">€ {Number(c.commission_amount).toLocaleString(locale)}</div>
                  <Badge variant="yellow">{t('open')}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-800 mb-4">{t('all_closings')}</h2>
        {closings.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <TrendingUp size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">{t('no_closings')}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400 font-semibold uppercase">
                <th className="text-left pb-2">{t('col_object')}</th>
                <th className="text-left pb-2">{t('col_type')}</th>
                <th className="text-left pb-2">{t('col_price')}</th>
                <th className="text-right pb-2">{t('col_commission')}</th>
                <th className="text-right pb-2">{t('col_status')}</th>
                <th className="text-right pb-2">{t('col_date')}</th>
              </tr>
            </thead>
            <tbody>
              {closings.map((c: any) => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3">
                    <div className="font-medium text-gray-800">{c.listing?.title ?? '—'}</div>
                    <div className="text-xs text-gray-400">{c.listing?.address_city}</div>
                  </td>
                  <td className="py-3">
                    <Badge variant={c.closing_type === 'rent' ? 'indigo' : 'green'}>
                      {c.closing_type === 'rent' ? tCommon('rent') : tCommon('sale')}
                    </Badge>
                  </td>
                  <td className="py-3 text-gray-600">€ {Number(c.closing_price).toLocaleString(locale)}</td>
                  <td className="py-3 text-right font-bold text-indigo-600">€ {Number(c.commission_amount).toLocaleString(locale)}</td>
                  <td className="py-3 text-right">
                    <Badge variant={c.status === 'paid' ? 'green' : c.status === 'disputed' ? 'red' : 'yellow'}>
                      {c.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-right text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString(locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
