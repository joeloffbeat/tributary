import { NextRequest, NextResponse } from 'next/server'

// Story Protocol API v4 - Aeneid Testnet
// Mainnet: https://api.storyapis.com/api/v4
// Testnet: https://staging-api.storyprotocol.net/api/v4
const STORY_API_BASE = 'https://staging-api.storyprotocol.net/api/v4'
const STORY_API_KEY = process.env.STORY_API_KEY || 'KOTbaGUSWQ6cUJWhiJYiOjPgB0kTRu1eCFFvQL0IWls'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { endpoint, ...requestBody } = body

    if (!endpoint) {
      return NextResponse.json({ error: 'Missing endpoint parameter' }, { status: 400 })
    }

    // Keep the address as-is - Story API handles both formats
    const url = `${STORY_API_BASE}${endpoint}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Api-Key': STORY_API_KEY,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Story API error:', response.status, errorText)
      console.error('Request URL:', url)
      console.error('Request body:', JSON.stringify(requestBody, null, 2))
      return NextResponse.json(
        { error: `Story API error: ${response.status}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Story API proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch from Story API', details: error.message },
      { status: 500 }
    )
  }
}
