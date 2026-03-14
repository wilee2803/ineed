import { supabaseAdmin } from '@/lib/supabase-admin'
import { getTranslations, getLocale } from 'next-intl/server'
import Badge from '@/components/ui/Badge'
import { Users } from 'lucide-react'
import Link from 'next/link'

async function getUsers(role?: string) {
  const q = supabaseAdmin.from('profiles').select('*').order('created_at', { ascending: false }).limit(100)
  if (role && role !== 'all') q.eq('role', role)
  const { data } = await q
  return data ?? []
}

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role = 'all' } = await searchParams
  const users = await getUsers(role)
  const t = await getTranslations('admin.users')
  const tCommon = await getTranslations('common')
  const tRoles = await getTranslations('common.roles')
  const tKyc = await getTranslations('common.kyc')
  const locale = await getLocale()

  const tabs = [
    { key: 'all', label: t('tab_all') },
    { key: 'seeker', label: tRoles('seeker') },
    { key: 'lister', label: tRoles('lister') },
    { key: 'admin', label: tRoles('admin') },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-500 text-sm mt-1">{users.length} {t('subtitle_found')}</p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {tabs.map(tab => (
          <Link key={tab.key} href={`/${locale}/users?role=${tab.key}`}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              role === tab.key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {tab.label}
          </Link>
        ))}
      </div>

      {users.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <Users size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400">{t('empty')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-400 font-semibold uppercase">
                <th className="text-left px-4 py-3">{t('col_user')}</th>
                <th className="text-left px-4 py-3">{t('col_role')}</th>
                <th className="text-left px-4 py-3">{t('col_kyc')}</th>
                <th className="text-left px-4 py-3">{t('col_status')}</th>
                <th className="text-left px-4 py-3">{t('col_registered')}</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0">
                        {u.full_name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{u.full_name || tCommon('no_name')}</div>
                        {u.phone && <div className="text-xs text-gray-400">{u.phone}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={u.role === 'lister' ? 'green' : u.role === 'admin' ? 'indigo' : 'purple'}>
                      {tRoles(u.role)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={u.kyc_status === 'verified' ? 'green' : u.kyc_status === 'rejected' ? 'red' : u.kyc_status === 'in_review' ? 'blue' : 'yellow'}>
                      {tKyc(u.kyc_status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={u.is_active ? 'green' : 'red'}>
                      {u.is_active ? tCommon('user_active') : tCommon('user_blocked')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{new Date(u.created_at).toLocaleDateString(locale)}</td>
                  <td className="px-4 py-3 text-right"><span className="font-mono text-xs text-gray-300">{u.id.slice(0, 8)}…</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
