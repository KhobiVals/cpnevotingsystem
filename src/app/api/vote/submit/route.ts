import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getVoterSession, clearVoterSession } from '@/lib/session'
import { logAudit } from '@/lib/audit'

export async function POST(req: Request) {
  try {
    const session = await getVoterSession()

    if (!session || !session.voterId || !session.electionId) {
      return NextResponse.json({ error: 'Unauthorized or session expired.' }, { status: 401 })
    }

    const { selections } = await req.json()

    if (!selections || typeof selections !== 'object') {
      return NextResponse.json({ error: 'Invalid ballot selections.' }, { status: 400 })
    }

    const supabase = await createAdminClient()

    // Re-verify voter hasn't voted yet
    const { data: voter } = await supabase
      .from('voters')
      .select('has_voted, status')
      .eq('id', session.voterId)
      .single()

    if (!voter || voter.has_voted) {
      return NextResponse.json({ error: 'Vote already recorded for this voter.' }, { status: 400 })
    }

    // Call submit_vote Postgres function for each position choice
    const entries = Object.entries(selections) as [string, string][]

    for (const [positionId, candidateId] of entries) {
      const { error: voteErr } = await supabase.rpc('submit_vote', {
        p_election_id: session.electionId,
        p_position_id: positionId,
        p_candidate_id: candidateId,
        p_voter_id: session.voterId,
      })

      if (voteErr) {
        console.error('Error submitting vote RPC:', voteErr)
        throw voteErr
      }
    }

    // Mark voter as voted
    await supabase
      .from('voters')
      .update({
        has_voted: true,
        voted_at: new Date().toISOString(),
      })
      .eq('id', session.voterId)

    // Generate random reference code
    const refCode = `DESAG-VOTE-${Math.random().toString(36).substring(2, 9).toUpperCase()}`

    await logAudit({
      action: 'cast_ballot',
      entityType: 'vote',
      electionId: session.electionId,
      details: { refCode },
    })

    // Clear session
    await clearVoterSession()

    return NextResponse.json({
      success: true,
      referenceCode: refCode,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
