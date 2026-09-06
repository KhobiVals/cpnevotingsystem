import { createAdminClient } from './supabase/server'
import { formatPhoneNumber } from './utils'

export interface SendSmsParams {
  recipient: string
  message: string
  electionId?: string
  voterId?: string
  type: string
}

export async function sendSms(params: SendSmsParams): Promise<{ success: boolean; error?: string }> {
  const formattedPhone = formatPhoneNumber(params.recipient)
  const apiKey = process.env.BMS_AFRICA_SMS_API_KEY || process.env.VISTAL_SMS_API_KEY
  const senderId = process.env.SMS_SENDER_ID || process.env.VISTAL_SMS_SENDER_ID || 'DESAG'

  const supabase = await createAdminClient()

  // Insert pending log into database
  const { data: log, error: logErr } = await supabase
    .from('sms_logs')
    .insert({
      election_id: params.electionId || null,
      voter_id: params.voterId || null,
      recipient: formattedPhone,
      message: params.message,
      type: params.type,
      status: 'pending',
    })
    .select('id')
    .single()

  if (logErr) {
    console.error('Error logging SMS dispatch:', logErr)
  }

  if (!apiKey) {
    console.warn('SMS API Key is not set. Simulating SMS dispatch.')
    if (log?.id) {
      await supabase
        .from('sms_logs')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', log.id)
    }
    return { success: true }
  }

  try {
    // BMS Africa SMS API endpoint integration
    const apiEndpoint = process.env.BMS_AFRICA_SMS_URL || 'https://app.bms.africa/api/v1/sms/send'

    const res = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: senderId,
        recipient: formattedPhone,
        to: formattedPhone,
        message: params.message,
        text: params.message,
      }),
    })

    const responseData = await res.json().catch(() => ({}))

    if (!res.ok) {
      const errorMsg = responseData.message || responseData.error || `HTTP ${res.status}`
      if (log?.id) {
        await supabase
          .from('sms_logs')
          .update({ status: 'failed', error_message: errorMsg })
          .eq('id', log.id)
      }
      return { success: false, error: errorMsg }
    }

    if (log?.id) {
      await supabase
        .from('sms_logs')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', log.id)
    }

    return { success: true }
  } catch (err: any) {
    const errorMsg = err?.message || 'Network error sending SMS'
    if (log?.id) {
      await supabase
        .from('sms_logs')
        .update({ status: 'failed', error_message: errorMsg })
        .eq('id', log.id)
    }
    return { success: false, error: errorMsg }
  }
}
