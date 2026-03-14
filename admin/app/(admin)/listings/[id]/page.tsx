import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'

export default async function ListingActionPage({
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
      .from('listings')
      .update({ status: 'active', reviewed_at: new Date().toISOString() })
      .eq('id', id)
  } else if (action === 'reject') {
    await supabaseAdmin
      .from('listings')
      .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
      .eq('id', id)
  }

  redirect('/listings')
}
