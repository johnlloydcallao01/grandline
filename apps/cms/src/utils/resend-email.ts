interface ResendEmailTag {
  name: string
  value: string
}

interface SendResendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string | string[]
  tags?: ResendEmailTag[]
  idempotencyKey?: string
}

interface SendResendEmailResult {
  sent: boolean
  skipped: boolean
  id?: string
  error?: string
}

export async function sendResendEmail({
  to,
  subject,
  html,
  replyTo,
  tags,
  idempotencyKey,
}: SendResendEmailOptions): Promise<SendResendEmailResult> {
  const resendApiKey = process.env.RESEND_API_KEY
  const enableEmailNotifications = process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true'
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'no-reply@tap2goph.com'
  const fromName = process.env.EMAIL_FROM_NAME || 'Tap2Go'
  const fallbackReplyTo = process.env.EMAIL_REPLY_TO || fromEmail

  if (!resendApiKey || !enableEmailNotifications) {
    return {
      sent: false,
      skipped: true,
      error: 'Missing RESEND_API_KEY or ENABLE_EMAIL_NOTIFICATIONS is not true',
    }
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${resendApiKey}`,
      'User-Agent': 'grandline-cms/1.0',
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
    body: JSON.stringify({
      from: `${fromName} <${fromEmail}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      replyTo: replyTo || fallbackReplyTo,
      tags,
    }),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const error =
      (typeof data?.message === 'string' && data.message) ||
      (typeof data?.error === 'string' && data.error) ||
      `Resend request failed with status ${response.status}`

    return {
      sent: false,
      skipped: false,
      error,
    }
  }

  return {
    sent: true,
    skipped: false,
    id: typeof data?.id === 'string' ? data.id : undefined,
  }
}
