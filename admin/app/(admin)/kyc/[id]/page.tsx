import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'

export default async function KycActionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ action?: string }>
}) {
  const { id } = await params
  const { action } = await searchParams

  if (action === 'approve') {
    await supabaseAdmin
      .from('profiles')
      .update({ kyc_status: 'verified', kyc_reviewed_at: new Date().toISOString() })
      .eq('id', id)
  } else if (action === 'reject') {
    await supabaseAdmin
      .from('profiles')
      .update({ kyc_status: 'rejected', kyc_reviewed_at: new Date().toISOString() })
      .eq('id', id)
  }

  redirect('/kyc')
}
