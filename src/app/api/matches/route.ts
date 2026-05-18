import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export async function DELETE(req: NextRequest) {
  try {
    const { match_name } = await req.json()
    if (!match_name || typeof match_name !== 'string') {
      return NextResponse.json({ error: 'match_name requerido' }, { status: 400 })
    }

    const supabase = createServerSupabase()
    const { error, count } = await supabase
      .from('match_stats')
      .delete({ count: 'exact' })
      .eq('match_name', match_name)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ deleted: count })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
