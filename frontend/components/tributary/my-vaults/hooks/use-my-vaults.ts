'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAccount } from '@/lib/web3'
import {
  getVaultsByCreator,
  getVaultInfo,
  getTokenInfo,
  getVaultRecord,
} from '@/lib/services/tributary'
import type { VaultInfo, TokenInfo, VaultRecord } from '@/lib/services/tributary-types'
import type { Address } from 'viem'

// Combined vault data for display
export interface VaultDisplayData {
  address: Address
  vaultInfo: VaultInfo
  tokenInfo: TokenInfo
  record: VaultRecord
}

export interface MyVaultStats {
  totalVaults: number
  totalValue: bigint
  totalEarnings: bigint
  pendingDistributions: bigint
}

export interface UseMyVaultsReturn {
  vaults: VaultDisplayData[]
  stats: MyVaultStats
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  sortBy: 'created' | 'value' | 'earnings'
  setSortBy: (sort: 'created' | 'value' | 'earnings') => void
  filterActive: boolean
  setFilterActive: (active: boolean) => void
}

const INITIAL_STATS: MyVaultStats = {
  totalVaults: 0,
  totalValue: BigInt(0),
  totalEarnings: BigInt(0),
  pendingDistributions: BigInt(0),
}

export function useMyVaults(): UseMyVaultsReturn {
  const { address } = useAccount()
  const [vaults, setVaults] = useState<VaultDisplayData[]>([])
  const [stats, setStats] = useState<MyVaultStats>(INITIAL_STATS)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'created' | 'value' | 'earnings'>('created')
  const [filterActive, setFilterActive] = useState(false)

  const fetchVaults = useCallback(async () => {
    if (!address) {
      setVaults([])
      setStats(INITIAL_STATS)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Get vault addresses for creator
      const vaultAddresses = await getVaultsByCreator(address)

      // Fetch all data for each vault
      const vaultDataPromises = vaultAddresses.map(async (vaultAddr) => {
        const [vaultInfo, record] = await Promise.all([
          getVaultInfo(vaultAddr),
          getVaultRecord(vaultAddr),
        ])
        const tokenInfo = await getTokenInfo(vaultInfo.royaltyToken)
        return { address: vaultAddr, vaultInfo, tokenInfo, record }
      })

      const vaultData = await Promise.all(vaultDataPromises)

      // Calculate stats
      const calculatedStats: MyVaultStats = {
        totalVaults: vaultData.length,
        totalValue: vaultData.reduce((sum, v) => sum + v.vaultInfo.totalDeposited, BigInt(0)),
        totalEarnings: vaultData.reduce((sum, v) => sum + v.vaultInfo.totalDistributed, BigInt(0)),
        pendingDistributions: vaultData.reduce(
          (sum, v) => sum + v.vaultInfo.pendingDistribution,
          BigInt(0)
        ),
      }

      setVaults(vaultData)
      setStats(calculatedStats)
    } catch (err) {
      console.error('Failed to fetch vaults:', err)
      setError(err instanceof Error ? err.message : 'Failed to load vaults')
    } finally {
      setIsLoading(false)
    }
  }, [address])

  useEffect(() => {
    fetchVaults()
  }, [fetchVaults])

  // Sort and filter vaults
  const processedVaults = useMemo(() => {
    return vaults
      .filter((v) => !filterActive || v.vaultInfo.isActive)
      .sort((a, b) => {
        switch (sortBy) {
          case 'value':
            return Number(b.vaultInfo.totalDeposited - a.vaultInfo.totalDeposited)
          case 'earnings':
            return Number(b.vaultInfo.totalDistributed - a.vaultInfo.totalDistributed)
          case 'created':
          default:
            return Number(b.record.createdAt - a.record.createdAt)
        }
      })
  }, [vaults, sortBy, filterActive])

  return {
    vaults: processedVaults,
    stats,
    isLoading,
    error,
    refetch: fetchVaults,
    sortBy,
    setSortBy,
    filterActive,
    setFilterActive,
  }
}
