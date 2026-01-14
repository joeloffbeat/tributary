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
// Add Tributary contracts here as they are deployed
const contractImports: Record<number, () => Promise<{ default: ContractRegistry }>> = {
  // Mantle Sepolia - Tributary contracts
  // 5003: () => import('./5003/contracts'),
}

const abiImports: Record<number, Record<string, () => Promise<{ default: Abi }>>> = {
  // Mantle Sepolia - Tributary ABIs
  // 5003: {
  //   RoyaltyVaultFactory: () => import('./5003/abis/RoyaltyVaultFactory.json').then(m => ({ default: m.default as Abi })),
  //   RoyaltyMarketplace: () => import('./5003/abis/RoyaltyMarketplace.json').then(m => ({ default: m.default as Abi })),
  // },
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

// Tributary contract addresses (Mantle Sepolia)
export const MANTLE_SEPOLIA_CHAIN_ID = 5003
export const TRIBUTARY_FACTORY_ADDRESS = '0xDDb711e1594A8d6a35473CDDaD611043c8711Ceb' as const
export const TRIBUTARY_MARKETPLACE_ADDRESS = '0x2Dfc3375e79DC0fc9851F451D8cc7F94B2C5854c' as const
export const TRIBUTARY_TREASURY_ADDRESS = '0x32FE11d9900D63350016374BE98ff37c3Af75847' as const
