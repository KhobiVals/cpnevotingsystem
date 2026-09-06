import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { generateVoterPassword, generatePin } from '@/lib/utils'
import { sendSms } from '@/lib/sms'
import { logAudit } from '@/lib/audit'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const supabase = await createAdminClient()

    // Fetch election
    const { data: election } = await supabase
      .from('elections')
      .select('title, credential_mode')
      .eq('id', id)
      .single()

    if (!election) {
      return NextResponse.json({ error: 'Election not found' }, { status: 404 })
    }

    // Fetch voters who haven't been issued credentials yet or all voters
    const { data: voters } = await supabase
      .from('voters')
      .select('*')
      .eq('election_id', id)

    if (!voters || voters.length === 0) {
      return NextResponse.json({ error: 'No voters registered for this election' }, { status: 400 })
    }

    let dispatchedCount = 0

    for (const voter of voters) {
      const pin = generatePin(6)
      const password = generateVoterPassword(8)

      // Store credentials on voter record
      await supabase
        .from('voters')
        .update({
          pin_code: pin,
          one_time_password: password,
          credentials_sent_at: new Date().toISOString(),
        })
        .eq('id', voter.id)

      // Compose SMS message
      const smsBody =
        election.credential_mode === 'legacy'
          ? `DESAG Voting Credentials for ${election.title}: Index No: ${voter.student_id}, PIN: ${pin}. Vote at: https://desag-voting.vercel.app/vote`
          : `DESAG Voting Credentials for ${election.title}: Student ID: ${voter.student_id}, Password: ${password}. Vote at: https://desag-voting.vercel.app/vote`

      await sendSms({
        recipient: voter.phone,
        message: smsBody,
        electionId: id,
        voterId: voter.id,
        type: 'credential_dispatch',
      })

      dispatchedCount++
    }

    await logAudit({
      action: 'dispatch_voter_credentials',
      entityType: 'voter_register',
      electionId: id,
      details: { count: dispatchedCount, mode: election.credential_mode },
    })

    return NextResponse.json({ success: true, count: dispatchedCount })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
