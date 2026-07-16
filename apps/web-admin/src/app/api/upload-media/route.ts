import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const apiKey = process.env.PAYLOAD_API_KEY

    if (!apiUrl || !apiKey) {
      return new Response(JSON.stringify({ error: 'Missing API configuration' }), { status: 500 })
    }

    const formData = await req.formData()

    const cmsRes = await fetch(`${apiUrl}/media`, {
      method: 'POST',
      headers: {
        Authorization: `users API-Key ${apiKey}`,
      },
      body: formData,
    })

    const body = await cmsRes.json()

    if (!cmsRes.ok) {
      return new Response(JSON.stringify({ error: body?.errors?.[0]?.message || `CMS returned ${cmsRes.status}` }), {
        status: 502,
      })
    }

    return new Response(JSON.stringify(body), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || 'Internal error' }), { status: 500 })
  }
}
