import { useQuery } from '@tanstack/react-query'
import { getStoryProtocolIPs } from '@/lib/services/story-protocol'
import { querySubgraph } from '@/lib/services/subgraph'

// Query to check which IPs already have vaults
const VAULTS_BY_CREATOR_QUERY = `
  query VaultsByCreator($creator: String!) {
    vaults(where: { creator: $creator }) {
      id
      storyIPId
    }
  }
`

interface VaultsByCreatorResponse {
  vaults: Array<{
    id: string
    storyIPId: string
  }>
}

export interface UserIP {
  id: string
  name: string
  type: string
  hasVault: boolean
  vaultAddress?: string
}

export function useUserIPs(address: string) {
  return useQuery({
    queryKey: ['userIPs', address],
    queryFn: async (): Promise<UserIP[]> => {
      // Get IPs from Story Protocol
      const ips = await getStoryProtocolIPs(address)

      // Get existing vaults for this creator
      const { vaults } = await querySubgraph<VaultsByCreatorResponse>(VAULTS_BY_CREATOR_QUERY, {
        creator: address.toLowerCase(),
      })

      // Map vaults to IPs
      const vaultMap = new Map(vaults.map((v) => [v.storyIPId, v.id]))

      return ips.map((ip) => ({
        id: ip.id,
        name: ip.title || ip.name || `IP #${ip.id.slice(0, 8)}`,
        type: ip.ipType || 'IP Asset',
        hasVault: vaultMap.has(ip.id),
        vaultAddress: vaultMap.get(ip.id),
      }))
    },
    enabled: !!address,
  })
}
