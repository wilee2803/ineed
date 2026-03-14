import { supabaseAdmin } from '@/lib/supabase-admin'
import { getTranslations, getLocale } from 'next-intl/server'
import Badge from '@/components/ui/Badge'
import { ShieldCheck, ShieldX, Clock, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

async function getProfiles(status: string) {
  const q = supabaseAdmin
    .from('profiles')
    .select('*')
    .order('kyc_submitted_at', { ascending: true, nullsFirst: false })

  if (status !== 'all') q.eq('kyc_status', status)

  const { data } = await q.limit(50)
  return data ?? []
}

export default async function KycPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status = 'pending' } = await searchParams
  const profiles = await getProfiles(status)
  const t = await getTranslations('admin.kyc')
  const tCommon = await getTranslations('common')
  const tRoles = await getTranslations('common.roles')
  const locale = await getLocale()

  const tabs = [
    { key: 'pending',   label: t('tab_pending'),  icon: Clock },
    { key: 'in_review', label: t('tab_review'),   icon: ShieldCheck },
    { key: 'verified',  label: t('tab_verified'), icon: CheckCircle2 },
    { key: 'rejected',  label: t('tab_rejected'), icon: ShieldX },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('subtitle')}</p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {tabs.map(({ key, label, icon: Icon }) => (
          <Link
            key={key}
            href={`/${locale}/kyc?status=${key}`}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              status === key
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={14} />{label}
          </Link>
        ))}
      </div>

      {profiles.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <ShieldCheck size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 font-medium">{t('empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {profiles.map((p: any) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 flex-shrink-0">
                  {p.full_name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-gray-900">{p.full_name || tCommon('no_name')}</span>
                    <Badge variant={p.role === 'lister' ? 'green' : p.role === 'admin' ? 'indigo' : 'purple'}>
                      {tRoles(p.role)}
                    </Badge>
                    <Badge variant={
                      p.kyc_status === 'verified'  ? 'green' :
                      p.kyc_status === 'rejected'  ? 'red' :
                      p.kyc_status === 'in_review' ? 'indigo' : 'yellow'
                    }>
                      {p.kyc_status}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-400">
                    {t('registered')}: {new Date(p.created_at).toLocaleDateString(locale)}
                    {p.kyc_submitted_at && ` · ${t('kyc_submitted')}: ${new Date(p.kyc_submitted_at).toLocaleDateString(locale)}`}
                  </div>
                </div>
                <div className="flex gap-2">
                  {p.kyc_status === 'pending' || p.kyc_status === 'in_review' ? (
                    <>
                      <Link
                        href={`/${locale}/kyc/${p.id}?action=approve`}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
                      >
                        <CheckCircle2 size={13} /> {t('approve')}
                      </Link>
                      <Link
                        href={`/${locale}/kyc/${p.id}?action=reject`}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600"
                      >
                        <ShieldX size={13} /> {t('reject')}
                      </Link>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400 italic">
                      {p.kyc_status === 'verified' ? t('done_approved') : t('done_rejected')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
