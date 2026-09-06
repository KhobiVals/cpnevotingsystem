import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'

export async function POST(req: Request) {
  try {
    const { electionId, declarationStatement, officerName } = await req.json()

    if (!electionId || !declarationStatement) {
      return NextResponse.json({ error: 'Election ID and Declaration Statement are required' }, { status: 400 })
    }

    const supabase = await createAdminClient()

    // Verify user profile role
    const {
      data: { user },
    } = await supabase.auth.getUser()

    let officerId = user?.id || null

    // Update election record
    const { data: updated, error } = await supabase
      .from('elections')
      .update({
        status: 'declared',
        declaration_statement: declarationStatement,
        declared_at: new Date().toISOString(),
        declared_by: officerId,
      })
      .eq('id', electionId)
      .select()
      .single()

    if (error) throw error

    await logAudit({
      action: 'officially_declare_election',
      entityType: 'election',
      entityId: electionId,
      electionId: electionId,
      details: { officerName, statement: declarationStatement },
    })

    return NextResponse.json(updated)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
