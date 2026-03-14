'use client'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { supabase } from '@/lib/supabase'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const router = useRouter()
  const locale = useLocale()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push(`/${locale}/login`)
  }

  return (
    <button onClick={handleLogout}
      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/[0.06]">
      <LogOut size={13} />
    </button>
  )
}
