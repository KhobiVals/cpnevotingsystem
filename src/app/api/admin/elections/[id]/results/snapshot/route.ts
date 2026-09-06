import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const supabase = await createAdminClient()

    // Fetch positions
    const { data: positions } = await supabase
      .from('positions')
      .select('id, title')
      .eq('election_id', id)

    if (!positions || positions.length === 0) {
      return NextResponse.json({ error: 'No positions found' }, { status: 400 })
    }

    // Fetch candidates
    const { data: candidates } = await supabase
      .from('candidates')
      .select('id, position_id, full_name, photo_url')
      .eq('election_id', id)

    // Fetch vote counts grouped by candidate
    const { data: votes } = await supabase
      .from('votes')
      .select('candidate_id, position_id')
      .eq('election_id', id)

    const totalVotesCount = votes?.length || 0

    // Group counts
    const countsMap: Record<string, number> = {}
    ;(votes || []).forEach((v) => {
      countsMap[v.candidate_id] = (countsMap[v.candidate_id] || 0) + 1
    })

    const snapshotRows: any[] = []

    positions.forEach((pos) => {
      const posCandidates = (candidates || []).filter((c) => c.position_id === pos.id)
      const totalPosVotes = posCandidates.reduce((acc, c) => acc + (countsMap[c.id] || 0), 0)

      // Find highest count to mark winner
      let maxCount = -1
      posCandidates.forEach((c) => {
        const count = countsMap[c.id] || 0
        if (count > maxCount) maxCount = count
      })

      posCandidates.forEach((c) => {
        const count = countsMap[c.id] || 0
        const pct = totalPosVotes > 0 ? (count / totalPosVotes) * 100 : 0
        snapshotRows.push({
          election_id: id,
          position_id: pos.id,
          candidate_id: c.id,
          candidate_name: c.full_name,
          candidate_photo_url: c.photo_url,
          vote_count: count,
          percentage: parseFloat(pct.toFixed(2)),
          is_winner: maxCount > 0 && count === maxCount,
        })
      })
    })

    if (snapshotRows.length > 0) {
      await supabase.from('result_snapshots').delete().eq('election_id', id)
      const { error } = await supabase.from('result_snapshots').insert(snapshotRows)
      if (error) throw error
    }

    // Update total_votes_cast on election
    await supabase
      .from('elections')
      .update({ total_votes_cast: totalVotesCount })
      .eq('id', id)

    await logAudit({
      action: 'take_result_snapshot',
      entityType: 'result_snapshot',
      electionId: id,
      details: { totalVotes: totalVotesCount, rows: snapshotRows.length },
    })

    return NextResponse.json({ success: true, count: snapshotRows.length })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
