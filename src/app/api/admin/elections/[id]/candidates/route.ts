import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from('candidates')
      .select('*, positions(title)')
      .eq('election_id', id)
      .order('created_at', { ascending: true })

    if (error) throw error
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const { position_id, full_name, photo_url, slogan, manifesto_summary, ballot_order } =
      await req.json()

    if (!position_id || !full_name) {
      return NextResponse.json({ error: 'Position and candidate name are required' }, { status: 400 })
    }

    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from('candidates')
      .insert({
        election_id: id,
        position_id,
        full_name,
        photo_url: photo_url || null,
        slogan: slogan || null,
        manifesto_summary: manifesto_summary || null,
        ballot_order: ballot_order || 0,
      })
      .select()
      .single()

    if (error) throw error

    await logAudit({
      action: 'create_candidate',
      entityType: 'candidate',
      entityId: data.id,
      electionId: id,
      details: { full_name, position_id },
    })

    return NextResponse.json(data, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
