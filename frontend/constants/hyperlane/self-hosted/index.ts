// =============================================================================
// Hyperlane Self-Hosted Deployments
// =============================================================================
// Custom Hyperlane deployments across 4 testnets:
// Story Aenid, Avalanche Fuji, Sepolia, Polygon Amoy
// =============================================================================

import type { Address } from 'viem'
import type { HyperlaneDeployment } from '../types'

/**
 * Self-hosted Hyperlane deployments
 * Cross-chain messaging infrastructure across 4 testnets
 */
export const SELF_HOSTED_DEPLOYMENTS: Record<number, HyperlaneDeployment> = {
  // Story Aenid Testnet (chainId: 1315)
  1315: {
    chainId: 1315,
    chainName: 'storyaenid',
    displayName: 'Story Aenid',
    domainId: 1315,
    mailbox: '0x6feB4f3eeD23D6cdDa54ec67d5d649BE015f782d',
    proxyAdmin: '0xd1C09961798017267187297Cc2E032a0F1E3605b',
    validatorAnnounce: '0xf2dECD3046A87181c758d415949c88D3EF25a8AB',
    interchainAccountRouter: '0x5f80701Fbbc4ddbBA0f4659cee670321e6631579',
    testRecipient: '0x5f1D334dF3F0d53961Ea04D271D28415725C7DbE',
    staticMerkleRootMultisigIsmFactory: '0xCEF696B36e24945f45166548B1632c7585e3F0DB',
    staticMessageIdMultisigIsmFactory: '0x11191A01670643f2BE3BD8965a16F59556258c2d',
    staticAggregationIsmFactory: '0xb26A88B1082c84b0Aa4ED8Bad84b95dbE39e32a8',
    domainRoutingIsmFactory: '0xD8Ee05bFBEc32A6a93Ffa3091e4a540c5fAf38Ab',
    staticAggregationHookFactory: '0x394Aaa86484074E77A1260759278E18d4819Ee78',
    explorerUrl: 'https://aenid.storyscan.xyz',
    isTestnet: true,
    nativeCurrency: {
      name: 'IP Token',
      symbol: 'IP',
      decimals: 18,
    },
  },

  // Avalanche Fuji Testnet (chainId: 43113)
  43113: {
    chainId: 43113,
    chainName: 'fuji',
    displayName: 'Avalanche Fuji',
    domainId: 43113,
    mailbox: '0x60c3ca08D3df3F5fA583c535D9E44F3629F52452',
    proxyAdmin: '0xD8f50a509EFe389574dD378b0EF03e33558222eA',
    validatorAnnounce: '0x5f1D334dF3F0d53961Ea04D271D28415725C7DbE',
    interchainAccountRouter: '0xf2dECD3046A87181c758d415949c88D3EF25a8AB',
    testRecipient: '0xD4Eb116d12BB6Ef7C90602f35Ac3D8AdBAfF9338',
    staticMerkleRootMultisigIsmFactory: '0x11191A01670643f2BE3BD8965a16F59556258c2d',
    staticMessageIdMultisigIsmFactory: '0xb26A88B1082c84b0Aa4ED8Bad84b95dbE39e32a8',
    staticAggregationIsmFactory: '0x394Aaa86484074E77A1260759278E18d4819Ee78',
    domainRoutingIsmFactory: '0xDbddf0CD81fc748916970E6871cB79f2F71C67D5',
    staticAggregationHookFactory: '0xD8Ee05bFBEc32A6a93Ffa3091e4a540c5fAf38Ab',
    explorerUrl: 'https://testnet.snowtrace.io',
    isTestnet: true,
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18,
    },
  },

  // Sepolia Testnet (chainId: 11155111)
  11155111: {
    chainId: 11155111,
    chainName: 'sepolia',
    displayName: 'Sepolia',
    domainId: 11155111,
    mailbox: '0x60c3ca08D3df3F5fA583c535D9E44F3629F52452',
    proxyAdmin: '0xD8f50a509EFe389574dD378b0EF03e33558222eA',
    validatorAnnounce: '0x5f1D334dF3F0d53961Ea04D271D28415725C7DbE',
    interchainAccountRouter: '0xf2dECD3046A87181c758d415949c88D3EF25a8AB',
    testRecipient: '0xD4Eb116d12BB6Ef7C90602f35Ac3D8AdBAfF9338',
    staticMerkleRootMultisigIsmFactory: '0x11191A01670643f2BE3BD8965a16F59556258c2d',
    staticMessageIdMultisigIsmFactory: '0xb26A88B1082c84b0Aa4ED8Bad84b95dbE39e32a8',
    staticAggregationIsmFactory: '0x394Aaa86484074E77A1260759278E18d4819Ee78',
    domainRoutingIsmFactory: '0xDbddf0CD81fc748916970E6871cB79f2F71C67D5',
    staticAggregationHookFactory: '0xD8Ee05bFBEc32A6a93Ffa3091e4a540c5fAf38Ab',
    explorerUrl: 'https://sepolia.etherscan.io',
    isTestnet: true,
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },

  // Polygon Amoy Testnet (chainId: 80002)
  80002: {
    chainId: 80002,
    chainName: 'polygonamoy',
    displayName: 'Polygon Amoy',
    domainId: 80002,
    mailbox: '0xD8f50a509EFe389574dD378b0EF03e33558222eA',
    proxyAdmin: '0xCd0fE3743e32592e0f12e9509a82cFc0a20a292A',
    validatorAnnounce: '0x5f80701Fbbc4ddbBA0f4659cee670321e6631579',
    interchainAccountRouter: '0xE807b352A966fEfBb47D86874E4986E7Fe234c5d',
    testRecipient: '0xf2dECD3046A87181c758d415949c88D3EF25a8AB',
    staticMerkleRootMultisigIsmFactory: '0x9DFBFbA639a5Fd11Cf9bc58169157C450Ce99661',
    staticMessageIdMultisigIsmFactory: '0xCEF696B36e24945f45166548B1632c7585e3F0DB',
    staticAggregationIsmFactory: '0x11191A01670643f2BE3BD8965a16F59556258c2d',
    domainRoutingIsmFactory: '0x394Aaa86484074E77A1260759278E18d4819Ee78',
    staticAggregationHookFactory: '0xb26A88B1082c84b0Aa4ED8Bad84b95dbE39e32a8',
    explorerUrl: 'https://amoy.polygonscan.com',
    isTestnet: true,
    nativeCurrency: {
      name: 'POL',
      symbol: 'POL',
      decimals: 18,
    },
  },
}

/**
 * Get a specific self-hosted deployment
 */
export function getSelfHostedDeployment(chainId: number): HyperlaneDeployment | undefined {
  return SELF_HOSTED_DEPLOYMENTS[chainId]
}

/**
 * Check if a chain has a self-hosted deployment
 */
export function hasSelfHostedDeployment(chainId: number): boolean {
  return chainId in SELF_HOSTED_DEPLOYMENTS
}

/**
 * Get all self-hosted deployments as array
 */
export function getAllSelfHostedDeployments(): HyperlaneDeployment[] {
  return Object.values(SELF_HOSTED_DEPLOYMENTS)
}

/**
 * Get all self-hosted chain IDs
 */
export function getSelfHostedChainIds(): number[] {
  return Object.keys(SELF_HOSTED_DEPLOYMENTS).map(Number)
}

/**
 * Get mailbox address for a self-hosted chain
 */
export function getSelfHostedMailboxAddress(chainId: number): Address | undefined {
  return SELF_HOSTED_DEPLOYMENTS[chainId]?.mailbox
}

/**
 * Get domain ID for a self-hosted chain
 */
export function getSelfHostedDomainId(chainId: number): number | undefined {
  return SELF_HOSTED_DEPLOYMENTS[chainId]?.domainId
}
