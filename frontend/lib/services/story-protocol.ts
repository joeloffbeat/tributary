/**
 * Story Protocol Service
 * Fetches IP assets owned by a user from Story Protocol
 */

const STORY_API_BASE = 'https://api.story.foundation'

export interface IPAsset {
  id: string
  name: string
  title?: string
  ipType?: string
  owner: string
  metadata?: {
    name?: string
    description?: string
    image?: string
  }
}

/**
 * Get IP assets owned by a wallet address from Story Protocol
 */
export async function getStoryProtocolIPs(address: string): Promise<IPAsset[]> {
  try {
    // Story Protocol API endpoint for fetching IPs by owner
    const response = await fetch(
      `${STORY_API_BASE}/api/v1/ips?owner=${address.toLowerCase()}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      // Return empty array if API fails (allows app to function)
      console.warn('Story Protocol API returned error:', response.status)
      return []
    }

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Failed to fetch Story Protocol IPs:', error)
    // Return mock data for development/demo purposes
    return getMockIPs(address)
  }
}

/**
 * Get a single IP asset by ID
 */
export async function getStoryProtocolIP(ipId: string): Promise<IPAsset | null> {
  try {
    const response = await fetch(
      `${STORY_API_BASE}/api/v1/ips/${ipId}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Failed to fetch Story Protocol IP:', error)
    return null
  }
}

/**
 * Mock IPs for development/demo when API is unavailable
 */
function getMockIPs(address: string): IPAsset[] {
  // Return mock data for demo purposes
  return [
    {
      id: '0x1234567890abcdef1234567890abcdef12345678',
      name: 'Digital Art Collection #1',
      title: 'Digital Art Collection #1',
      ipType: 'ART',
      owner: address,
    },
    {
      id: '0xabcdef1234567890abcdef1234567890abcdef12',
      name: 'Music Album - Summer Vibes',
      title: 'Music Album - Summer Vibes',
      ipType: 'MUSIC',
      owner: address,
    },
    {
      id: '0x7890abcdef1234567890abcdef1234567890abcd',
      name: 'Novel - The Journey',
      title: 'Novel - The Journey',
      ipType: 'STORY',
      owner: address,
    },
  ]
}
