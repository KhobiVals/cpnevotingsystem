import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'

export async function GET() {
  try {
    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from('elections')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, academic_year, description, start_time, end_time, credential_mode } = body

    if (!title || !academic_year || !start_time || !end_time) {
      return NextResponse.json({ error: 'Missing required election fields.' }, { status: 400 })
    }

    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from('elections')
      .insert({
        title,
        academic_year,
        description: description || null,
        start_time: new Date(start_time).toISOString(),
        end_time: new Date(end_time).toISOString(),
        credential_mode: credential_mode || 'secure',
        status: 'draft',
      })
      .select()
      .single()

    if (error) throw error

    await logAudit({
      action: 'create_election',
      entityType: 'election',
      entityId: data.id,
      electionId: data.id,
      details: { title, academic_year },
    })

    return NextResponse.json(data, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
