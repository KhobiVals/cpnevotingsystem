import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from('candidate_agents')
      .select('*, candidates(full_name), profiles(full_name, email)')
      .eq('election_id', id)

    if (error) throw error
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const { candidate_id, user_id, review_status, notes } = await req.json()

    if (!candidate_id || !user_id) {
      return NextResponse.json({ error: 'Candidate and User are required' }, { status: 400 })
    }

    const supabase = await createAdminClient()

    // Assign agent role to user profile
    await supabase.from('profiles').update({ role: 'candidate_agent' }).eq('id', user_id)

    const { data, error } = await supabase
      .from('candidate_agents')
      .upsert({
        election_id: id,
        candidate_id,
        user_id,
        review_status: review_status || 'pending',
        notes: notes || null,
      })
      .select()
      .single()

    if (error) throw error

    await logAudit({
      action: 'assign_candidate_agent',
      entityType: 'candidate_agent',
      entityId: data.id,
      electionId: id,
      details: { candidate_id, user_id },
    })

    return NextResponse.json(data, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
