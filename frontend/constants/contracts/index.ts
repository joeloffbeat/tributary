import { contracts as fujiContracts, IPAY_REGISTRY_ADDRESS, IPayRegistryABI } from "./43113/contracts";

// Avalanche Fuji Testnet
export const AVALANCHE_FUJI_CHAIN_ID = 43113;

// Export contracts by chain
export const contractsByChain = {
  [AVALANCHE_FUJI_CHAIN_ID]: fujiContracts,
} as const;

// Helper to get contract config
export function getContract(chainId: number, contractName: keyof typeof fujiContracts) {
  const chainContracts = contractsByChain[chainId as keyof typeof contractsByChain];
  if (!chainContracts) {
    throw new Error(`No contracts configured for chain ${chainId}`);
  }
  return chainContracts[contractName];
}

// Direct exports for convenience
export { IPAY_REGISTRY_ADDRESS, IPayRegistryABI, fujiContracts };
