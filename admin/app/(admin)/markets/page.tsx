import { supabaseAdmin } from '@/lib/supabase-admin'
import Badge from '@/components/ui/Badge'
import { Map } from 'lucide-react'

async function getMarkets() {
  const { data } = await supabaseAdmin.from('markets').select('*').order('is_active', { ascending: false })
  return data ?? []
}

const flags: Record<string, string> = { AT: '🇦🇹', DE: '🇩🇪', CH: '🇨🇭', FR: '🇫🇷', NL: '🇳🇱' }

export default async function MarketsPage() {
  const markets = await getMarkets()

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Märkte & Städte</h1>
          <p className="text-gray-500 text-sm mt-1">Multi-City Rollout verwalten</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
          + Neuer Markt
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-400 font-semibold uppercase">
              <th className="text-left px-6 py-3">Stadt</th>
              <th className="text-left px-6 py-3">Land</th>
              <th className="text-left px-6 py-3">Währung</th>
              <th className="text-left px-6 py-3">Kaution</th>
              <th className="text-left px-6 py-3">Status</th>
              <th className="text-left px-6 py-3">Launch</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {markets.map((m: any) => (
              <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{flags[m.country_code] ?? '🌍'}</span>
                    <span className="font-semibold text-gray-900">{m.name}</span>
                    <span className="text-xs text-gray-400">/{m.slug}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500">{m.country_code}</td>
                <td className="px-6 py-4 text-gray-500">{m.currency}</td>
                <td className="px-6 py-4 text-gray-500">{m.currency} {m.default_deposit}</td>
                <td className="px-6 py-4">
                  <Badge variant={m.is_active ? 'green' : 'grey'}>
                    {m.is_active ? '● Aktiv' : '○ Inaktiv'}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-xs text-gray-400">
                  {m.launched_at ? new Date(m.launched_at).toLocaleDateString('de-AT') : '—'}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-xs text-indigo-500 hover:text-indigo-700 font-semibold">
                    {m.is_active ? 'Deaktivieren' : 'Aktivieren'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
