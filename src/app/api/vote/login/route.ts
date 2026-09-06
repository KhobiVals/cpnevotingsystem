import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createVoterSession } from '@/lib/session'
import { logAudit } from '@/lib/audit'

export async function POST(req: Request) {
  try {
    const { studentId, credential } = await req.json()

    if (!studentId || !credential) {
      return NextResponse.json({ error: 'Student ID and Passcode are required.' }, { status: 400 })
    }

    const supabase = await createAdminClient()

    // Find voter record
    const { data: voter, error } = await supabase
      .from('voters')
      .select('*, elections(title, status, credential_mode)')
      .eq('student_id', studentId.trim())
      .single()

    if (error || !voter) {
      return NextResponse.json({ error: 'Voter index or ID not found in register.' }, { status: 404 })
    }

    if (voter.status !== 'active') {
      return NextResponse.json({ error: 'Voter account is suspended or inactive.' }, { status: 403 })
    }

    const election = voter.elections
    if (!election || election.status !== 'open') {
      return NextResponse.json({ error: 'Voting is not currently open for this election.' }, { status: 403 })
    }

    // Verify credential (PIN or Password)
    const mode = election.credential_mode
    const valid =
      mode === 'legacy'
        ? voter.pin_code === credential.trim()
        : voter.one_time_password === credential.trim() || voter.pin_code === credential.trim()

    if (!valid) {
      return NextResponse.json({ error: 'Invalid passcode or PIN.' }, { status: 401 })
    }

    if (voter.has_voted) {
      return NextResponse.json(
        { error: 'You have already cast your vote in this election.' },
        { status: 403 }
      )
    }

    // Create session cookie
    await createVoterSession({
      voterId: voter.id,
      electionId: voter.election_id,
      studentId: voter.student_id,
      voterName: voter.full_name,
      hasVoted: voter.has_voted,
    })

    await logAudit({
      action: 'voter_login',
      entityType: 'voter',
      entityId: voter.id,
      electionId: voter.election_id,
      details: { studentId: voter.student_id },
    })

    return NextResponse.json({
      success: true,
      electionId: voter.election_id,
      electionTitle: election.title,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
