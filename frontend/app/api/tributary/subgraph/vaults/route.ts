import { NextRequest, NextResponse } from 'next/server'
import { querySubgraph } from '@/lib/services/subgraph'

const VAULTS_QUERY = `
  query GetVaults($first: Int!, $skip: Int!) {
    vaults(first: $first, skip: $skip, orderBy: createdAt, orderDirection: desc) {
      id
      token {
        id
        name
        symbol
        totalSupply
        holderCount
      }
      creator
      storyIPId
      dividendBps
      tradingFeeBps
      totalDeposited
      totalDistributed
      pendingDistribution
      distributionCount
      createdAt
      isActive
      pool {
        id
        reserveToken
        reserveQuote
        volumeQuote
        txCount
      }
    }
  }
`

interface VaultsResponse {
  vaults: Array<{
    id: string
    token: {
      id: string
      name: string
      symbol: string
      totalSupply: string
      holderCount: string
    }
    creator: string
    storyIPId: string
    dividendBps: string
    tradingFeeBps: string
    totalDeposited: string
    totalDistributed: string
    pendingDistribution: string
    distributionCount: string
    createdAt: string
    isActive: boolean
    pool?: {
      id: string
      reserveToken: string
      reserveQuote: string
      volumeQuote: string
      txCount: string
    }
  }>
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const first = parseInt(searchParams.get('first') || '20')
    const skip = parseInt(searchParams.get('skip') || '0')

    const data = await querySubgraph<VaultsResponse>(VAULTS_QUERY, {
      first,
      skip,
    })

    return NextResponse.json({
      success: true,
      data: data.vaults,
      pagination: { first, skip },
    })
  } catch (error) {
    console.error('Error fetching vaults:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vaults' },
      { status: 500 }
    )
  }
}
