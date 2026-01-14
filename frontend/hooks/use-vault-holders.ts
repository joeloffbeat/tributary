import { useQuery } from '@tanstack/react-query'
import { querySubgraph } from '@/lib/services/subgraph'

const VAULT_HOLDERS_QUERY = `
  query VaultHolders($tokenId: String!) {
    tokenHolders(
      where: { token: $tokenId, balance_gt: "0" }
      orderBy: balance
      orderDirection: desc
      first: 100
    ) {
      holder
      balance
      totalClaimed
    }
  }
`

interface VaultHoldersResponse {
  tokenHolders: Array<{
    holder: string
    balance: string
    totalClaimed: string
  }>
}

export interface VaultHolder {
  address: string
  balance: number
  percentage: number
}

const TOTAL_SUPPLY = 10000 // Fixed supply

export function useVaultHolders(tokenId: string) {
  return useQuery({
    queryKey: ['vaultHolders', tokenId],
    queryFn: async (): Promise<VaultHolder[]> => {
      const data = await querySubgraph<VaultHoldersResponse>(VAULT_HOLDERS_QUERY, {
        tokenId: tokenId.toLowerCase(),
      })

      return data.tokenHolders.map((h) => ({
        address: h.holder,
        balance: parseFloat(h.balance),
        percentage: (parseFloat(h.balance) / TOTAL_SUPPLY) * 100,
      }))
    },
    enabled: !!tokenId,
  })
}
