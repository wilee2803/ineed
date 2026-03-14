import { supabaseAdmin } from '@/lib/supabase-admin'
import Badge from '@/components/ui/Badge'
import { AlertTriangle, Clock } from 'lucide-react'
import Link from 'next/link'

async function getDisputes(status: string) {
  const q = supabaseAdmin
    .from('disputes')
    .select('*, reporter:profiles!reported_by(full_name), against:profiles!against_user_id(full_name)')
    .order('created_at', { ascending: true })

  if (status !== 'all') q.eq('status', status)
  const { data } = await q.limit(50)
  return data ?? []
}

function hoursOpen(created: string) {
  return Math.floor((Date.now() - new Date(created).getTime()) / 36e5)
}

export default async function DisputesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status = 'open' } = await searchParams
  const disputes = await getDisputes(status)

  const tabs = [
    { key: 'open',             label: 'Offen' },
    { key: 'under_review',     label: 'In Prüfung' },
    { key: 'resolved_lister',  label: 'Entschieden' },
    { key: 'closed',           label: 'Geschlossen' },
    { key: 'all',              label: 'Alle' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dispute Management</h1>
        <p className="text-gray-500 text-sm mt-1">Schadensmeldungen und Kautions-Entscheidungen</p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {tabs.map(t => (
          <Link key={t.key} href={`/disputes?status=${t.key}`}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              status === t.key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
          </Link>
        ))}
      </div>

      {disputes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <AlertTriangle size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 font-medium">Keine Disputes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {disputes.map((d: any) => {
            const hours = hoursOpen(d.created_at)
            const urgent = d.status === 'open' && hours > 24
            return (
              <Link key={d.id} href={`/disputes/${d.id}`}
                className={`block bg-white rounded-xl border shadow-sm p-5 hover:border-indigo-200 transition-colors ${
                  urgent ? 'border-red-200 border-l-4 border-l-red-500' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">{d.title}</span>
                      {urgent && <Badge variant="red">Dringend · {hours}h offen</Badge>}
                      <Badge variant={
                        d.status === 'open' ? 'red' :
                        d.status === 'under_review' ? 'yellow' :
                        d.status === 'closed' ? 'grey' : 'green'
                      }>
                        {d.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-1">{d.description}</p>
                    <div className="flex gap-4 text-xs text-gray-400 mt-2">
                      <span>Von: <strong className="text-gray-600">{d.reporter?.full_name}</strong></span>
                      <span>Gegen: <strong className="text-gray-600">{d.against?.full_name}</strong></span>
                      {d.damage_amount && (
                        <span>Betrag: <strong className="text-red-600">€ {Number(d.damage_amount).toLocaleString('de-AT')}</strong></span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                    <Clock size={12} />
                    {new Date(d.created_at).toLocaleDateString('de-AT')}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
