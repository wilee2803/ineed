import { supabaseAdmin } from '@/lib/supabase-admin'
import Badge from '@/components/ui/Badge'
import { TrendingUp, Euro } from 'lucide-react'

async function getRevenue() {
  const [{ data: closings }, { data: pending }] = await Promise.all([
    supabaseAdmin
      .from('closings')
      .select('*, lister:profiles!lister_id(full_name), seeker:profiles!seeker_id(full_name), listing:listings(title, address_city)')
      .order('created_at', { ascending: false })
      .limit(100),
    supabaseAdmin
      .from('closings')
      .select('*, lister:profiles!lister_id(full_name), seeker:profiles!seeker_id(full_name), listing:listings(title)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false }),
  ])

  const all = closings ?? []
  const paid = all.filter((c: any) => c.status === 'paid')

  const totalCommission = paid.reduce((s: number, c: any) => s + Number(c.commission_amount), 0)
  const rentCommission  = paid.filter((c: any) => c.closing_type === 'rent').reduce((s: number, c: any) => s + Number(c.commission_amount), 0)
  const saleCommission  = paid.filter((c: any) => c.closing_type === 'sale').reduce((s: number, c: any) => s + Number(c.commission_amount), 0)

  return { closings: all, pending: pending ?? [], totalCommission, rentCommission, saleCommission }
}

export default async function RevenuePage() {
  const { closings, pending, totalCommission, rentCommission, saleCommission } = await getRevenue()

  const kpis = [
    { label: 'Gesamtumsatz', value: `€ ${totalCommission.toLocaleString('de-AT')}`, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Miet-Provisionen (3×)', value: `€ ${rentCommission.toLocaleString('de-AT')}`, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Kauf-Provisionen (1%)', value: `€ ${saleCommission.toLocaleString('de-AT')}`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Ausstehend', value: `${pending.length} Abschlüsse`, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Umsatz & Provisionen</h1>
        <p className="text-gray-500 text-sm mt-1">Miete: 3× Monatsmiete · Kauf: 1% des Kaufpreises</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className={`text-2xl font-black ${k.color} mb-1`}>{k.value}</div>
            <div className="text-xs text-gray-500 font-medium">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Ausstehende Provisionen */}
      {pending.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="font-bold text-gray-800 mb-4">⏳ Ausstehende Provisionen</h2>
          <div className="space-y-2">
            {pending.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                <div>
                  <div className="text-sm font-semibold text-gray-800">{c.listing?.title}</div>
                  <div className="text-xs text-gray-500">
                    {c.lister?.full_name} → {c.seeker?.full_name} ·{' '}
                    <Badge variant={c.closing_type === 'rent' ? 'indigo' : 'green'}>
                      {c.closing_type === 'rent' ? 'Miete' : 'Kauf'}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-indigo-600">€ {Number(c.commission_amount).toLocaleString('de-AT')}</div>
                  <Badge variant="yellow">offen</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alle Abschlüsse */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-800 mb-4">Alle Abschlüsse</h2>
        {closings.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <TrendingUp size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Noch keine Abschlüsse</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400 font-semibold uppercase">
                <th className="text-left pb-2">Objekt</th>
                <th className="text-left pb-2">Typ</th>
                <th className="text-left pb-2">Preis</th>
                <th className="text-right pb-2">Provision</th>
                <th className="text-right pb-2">Status</th>
                <th className="text-right pb-2">Datum</th>
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
                      {c.closing_type === 'rent' ? 'Miete' : 'Kauf'}
                    </Badge>
                  </td>
                  <td className="py-3 text-gray-600">€ {Number(c.closing_price).toLocaleString('de-AT')}</td>
                  <td className="py-3 text-right font-bold text-indigo-600">
                    € {Number(c.commission_amount).toLocaleString('de-AT')}
                  </td>
                  <td className="py-3 text-right">
                    <Badge variant={c.status === 'paid' ? 'green' : c.status === 'disputed' ? 'red' : 'yellow'}>
                      {c.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-right text-xs text-gray-400">
                    {new Date(c.created_at).toLocaleDateString('de-AT')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
