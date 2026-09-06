import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'

export async function POST(req: Request) {
  try {
    const { agentId, action, category, reason } = await req.json()

    if (!agentId || !action) {
      return NextResponse.json({ error: 'Agent ID and action are required' }, { status: 400 })
    }

    const supabase = await createAdminClient()

    const { data: agent } = await supabase
      .from('candidate_agents')
      .select('*, candidates(full_name)')
      .eq('id', agentId)
      .single()

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    if (action === 'accept') {
      await supabase
        .from('candidate_agents')
        .update({
          review_status: 'accepted',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', agentId)

      await logAudit({
        action: 'accept_results_agent',
        entityType: 'candidate_agent',
        entityId: agentId,
        electionId: agent.election_id,
        details: { candidate: agent.candidates?.full_name },
      })
    } else if (action === 'object') {
      if (!reason) {
        return NextResponse.json({ error: 'Objection reason is required' }, { status: 400 })
      }

      await supabase
        .from('candidate_agents')
        .update({
          review_status: 'objected',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', agentId)

      const { data: obj } = await supabase
        .from('objections')
        .insert({
          election_id: agent.election_id,
          candidate_id: agent.candidate_id,
          agent_id: agentId,
          category: category || 'general',
          reason,
          status: 'open',
        })
        .select()
        .single()

      await logAudit({
        action: 'file_objection_agent',
        entityType: 'objection',
        entityId: obj?.id,
        electionId: agent.election_id,
        details: { category, reason },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
