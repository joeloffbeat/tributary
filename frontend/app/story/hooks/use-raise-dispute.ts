import { useState, useCallback } from 'react'
import { useAccount, useWalletClient, usePublicClient } from '@/lib/web3'
import { stringToHex, keccak256, toBytes } from 'viem'
import { STORY_CONTRACTS } from '@/constants/protocols/story'
import { DISPUTE_MODULE_ABI } from '@/lib/abis/story'
import type { RaiseDisputeParams, OperationResult } from '../types'

export function useRaiseDispute() {
  const { address } = useAccount()
  const { walletClient } = useWalletClient()
  const { publicClient } = usePublicClient()
  const [result, setResult] = useState<OperationResult>({ status: 'idle' })

  const raiseDispute = useCallback(
    async (params: RaiseDisputeParams) => {
      if (!walletClient || !publicClient || !address) {
        setResult({ status: 'error', error: 'Wallet not connected' })
        return
      }

      setResult({ status: 'pending' })

      try {
        const hash = await walletClient.writeContract({
          chain: walletClient.chain,
          address: STORY_CONTRACTS.DISPUTE_MODULE,
          abi: DISPUTE_MODULE_ABI,
          functionName: 'raiseDispute',
          args: [
            params.targetIpId,
            params.disputeEvidenceHash,
            params.targetTag,
            params.data,
          ],
          account: address,
        })

        await publicClient.waitForTransactionReceipt({ hash })
        setResult({ status: 'success', hash })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setResult({ status: 'error', error: message })
      }
    },
    [walletClient, publicClient, address]
  )

  const reset = useCallback(() => {
    setResult({ status: 'idle' })
  }, [])

  // Helper to convert dispute tag string to bytes32
  const tagToBytes32 = (tag: string): `0x${string}` => {
    return keccak256(toBytes(tag))
  }

  // Helper to convert IPFS CID to bytes32
  const cidToBytes32 = (cid: string): `0x${string}` => {
    return keccak256(toBytes(cid))
  }

  return {
    raiseDispute,
    result,
    reset,
    isLoading: result.status === 'pending',
    tagToBytes32,
    cidToBytes32,
  }
}
