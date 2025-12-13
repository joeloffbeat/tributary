import type { Address, Abi } from 'viem'

// Contract configuration type
export interface ContractConfig {
  address: Address
  name: string
  description?: string
}

// Contract with ABI loaded
export interface Contract extends ContractConfig {
  abi: Abi
}

// Registry type for chain contracts
export type ContractRegistry = Record<string, ContractConfig>

// Dynamic imports for contract configs and ABIs by chain
const contractImports: Record<number, () => Promise<{ default: ContractRegistry }>> = {
  43113: () => import('./43113/contracts'),
  1315: () => import('./1315/contracts'),
}

const abiImports: Record<number, Record<string, () => Promise<{ default: Abi }>>> = {
  43113: {
    IPayRegistry: () => import('./43113/abis/IPayRegistry.json').then(m => ({ default: m.default as Abi })),
  },
  // Story Aeneid (1315)
  1315: {
    IPayReceiver: () => import('./1315/abis/IPayReceiver.json').then(m => ({ default: m.default as Abi })),
  },
}

// Cache for loaded contracts
const contractCache: Record<number, ContractRegistry> = {}
const abiCache: Record<number, Record<string, Abi>> = {}

// Get all contracts for a chain
export async function getContractsForChain(chainId: number): Promise<Contract[]> {
  if (!contractImports[chainId]) {
    return []
  }

  if (!contractCache[chainId]) {
    const module = await contractImports[chainId]()
    contractCache[chainId] = module.default
  }

  const registry = contractCache[chainId]
  const contracts: Contract[] = []

  for (const [name, config] of Object.entries(registry)) {
    const abi = await getContractAbi(chainId, name)
    if (abi) {
      contracts.push({
        ...config,
        abi,
      })
    }
  }

  return contracts
}

// Get ABI for a specific contract
export async function getContractAbi(chainId: number, contractName: string): Promise<Abi | null> {
  if (abiCache[chainId]?.[contractName]) {
    return abiCache[chainId][contractName]
  }

  if (!abiImports[chainId]?.[contractName]) {
    return null
  }

  const module = await abiImports[chainId][contractName]()

  if (!abiCache[chainId]) {
    abiCache[chainId] = {}
  }

  abiCache[chainId][contractName] = module.default
  return module.default
}

// Get a single contract by name
export async function getContractByName(chainId: number, contractName: string): Promise<Contract | null> {
  if (!contractImports[chainId]) {
    return null
  }

  if (!contractCache[chainId]) {
    const module = await contractImports[chainId]()
    contractCache[chainId] = module.default
  }

  const config = contractCache[chainId][contractName]
  if (!config) {
    return null
  }

  const abi = await getContractAbi(chainId, contractName)
  if (!abi) {
    return null
  }

  return {
    ...config,
    abi,
  }
}

// Check if chain has any contracts configured
export function isChainContractsSupported(chainId: number): boolean {
  return chainId in contractImports
}

// Legacy exports for backward compatibility
export const AVALANCHE_FUJI_CHAIN_ID = 43113
export const STORY_AENEID_CHAIN_ID = 1315
export const IPAY_REGISTRY_ADDRESS = '0x883172EDFF24FE83FDE776f7A9Aaa59CCe5ABA2B' as const
export const IPAY_RECEIVER_ADDRESS = '0xA5Cf9339908C3970c2e9Ac4aC0105367f53B80cB' as const
