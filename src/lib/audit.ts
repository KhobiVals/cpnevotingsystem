import { createAdminClient } from './supabase/server'

export interface LogAuditParams {
  action: string
  entityType: string
  entityId?: string | null
  electionId?: string | null
  userId?: string | null
  userEmail?: string | null
  userRole?: string | null
  details?: Record<string, unknown>
  ipAddress?: string | null
  userAgent?: string | null
}

export async function logAudit(params: LogAuditParams) {
  try {
    const supabase = await createAdminClient()
    await supabase.from('audit_logs').insert({
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId || null,
      election_id: params.electionId || null,
      user_id: params.userId || null,
      user_email: params.userEmail || null,
      user_role: params.userRole || null,
      details: params.details || {},
      ip_address: params.ipAddress || null,
      user_agent: params.userAgent || null,
    })
  } catch (err) {
    console.error('Failed to write audit log:', err)
  }
}
