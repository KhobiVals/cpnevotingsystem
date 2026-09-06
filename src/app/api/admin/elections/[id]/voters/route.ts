import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { parseVotersFile } from '@/lib/voters-import'
import { logAudit } from '@/lib/audit'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from('voters')
      .select('*')
      .eq('election_id', id)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const { voters, errors } = parseVotersFile(buffer)

    if (voters.length === 0) {
      return NextResponse.json({ error: 'No valid voters parsed from file', details: errors }, { status: 400 })
    }

    const supabase = await createAdminClient()

    // Insert voters into DB
    const voterRecords = voters.map((v) => ({
      election_id: id,
      student_id: v.student_id,
      full_name: v.full_name,
      phone: v.phone,
      email: v.email || null,
      programme: v.programme || null,
      study_center: v.study_center || null,
      year_group: v.year_group || null,
      status: 'active',
    }))

    const { data, error } = await supabase
      .from('voters')
      .upsert(voterRecords, { onConflict: 'election_id,student_id' })
      .select()

    if (error) throw error

    // Update total voters count on election
    const { count } = await supabase
      .from('voters')
      .select('*', { count: 'exact', head: true })
      .eq('election_id', id)

    await supabase
      .from('elections')
      .update({ total_voters_registered: count || 0 })
      .eq('id', id)

    await logAudit({
      action: 'import_voters',
      entityType: 'voter_register',
      electionId: id,
      details: { importedCount: data?.length || 0, parseErrors: errors },
    })

    return NextResponse.json({
      importedCount: data?.length || 0,
      errors,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
