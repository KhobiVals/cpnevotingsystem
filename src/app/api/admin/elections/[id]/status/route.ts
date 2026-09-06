import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const { status } = await req.json()

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    const supabase = await createAdminClient()

    // Fetch current election
    const { data: election, error: fetchErr } = await supabase
      .from('elections')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchErr || !election) {
      return NextResponse.json({ error: 'Election not found' }, { status: 404 })
    }

    const updatePayload: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    }

    const { data: updated, error: updateErr } = await supabase
      .from('elections')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (updateErr) throw updateErr

    await logAudit({
      action: 'transition_election_status',
      entityType: 'election',
      entityId: id,
      electionId: id,
      details: { previousStatus: election.status, newStatus: status },
    })

    return NextResponse.json(updated)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
