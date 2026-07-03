import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { enrollmentId } = body

  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const apiKey = process.env.PAYLOAD_API_KEY

  if (!apiUrl || !apiKey) {
    return new Response(JSON.stringify({ error: 'Missing API configuration' }), { status: 500 })
  }

  const cmsRes = await fetch(`${apiUrl}/lms/enrollments/admin/reset`, {
    method: 'POST',
    headers: {
      Authorization: `users API-Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ enrollmentId }),
  })

  if (!cmsRes.ok || !cmsRes.body) {
    return new Response(
      JSON.stringify({ error: `CMS returned ${cmsRes.status}` }),
      { status: 502 },
    )
  }

  return new Response(cmsRes.body, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  })
}
