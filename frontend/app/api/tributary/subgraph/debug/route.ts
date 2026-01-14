import { NextResponse } from 'next/server'

export async function GET() {
  const url = 'https://api.goldsky.com/api/public/project_cmemwacolly2301xs17yy3d6z/subgraphs/tributary-mantle/v1.0.1/gn'

  const query = `{
    vaults(first: 5) { id creator }
    protocolStats(id: "protocol") { totalVaults totalVolume }
  }`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })

    const data = await response.json()

    return NextResponse.json({
      success: true,
      url,
      response: data,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      url,
      error: String(error),
    })
  }
}
