import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from('positions')
      .select('*')
      .eq('election_id', id)
      .order('sort_order', { ascending: true })

    if (error) throw error
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const { title, description, max_votes_allowed, sort_order } = await req.json()

    if (!title) {
      return NextResponse.json({ error: 'Position title is required' }, { status: 400 })
    }

    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from('positions')
      .insert({
        election_id: id,
        title,
        description: description || null,
        max_votes_allowed: max_votes_allowed || 1,
        sort_order: sort_order || 0,
      })
      .select()
      .single()

    if (error) throw error

    await logAudit({
      action: 'create_position',
      entityType: 'position',
      entityId: data.id,
      electionId: id,
      details: { title },
    })

    return NextResponse.json(data, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
