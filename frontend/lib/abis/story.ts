// Story Protocol Contract ABIs
// Minimal ABIs for direct contract interactions

// License Registry ABI - for fetching attached licenses
export const LICENSE_REGISTRY_ABI = [
  {
    inputs: [{ name: 'ipId', type: 'address' }],
    name: 'getAttachedLicenseTermsCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'ipId', type: 'address' },
      { name: 'index', type: 'uint256' },
    ],
    name: 'getAttachedLicenseTerms',
    outputs: [
      { name: 'licenseTemplate', type: 'address' },
      { name: 'licenseTermsId', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// PIL Template ABI - for fetching license terms details
export const PIL_TEMPLATE_ABI = [
  {
    inputs: [{ name: 'licenseTermsId', type: 'uint256' }],
    name: 'getLicenseTerms',
    outputs: [
      {
        components: [
          { name: 'transferable', type: 'bool' },
          { name: 'royaltyPolicy', type: 'address' },
          { name: 'defaultMintingFee', type: 'uint256' },
          { name: 'expiration', type: 'uint256' },
          { name: 'commercialUse', type: 'bool' },
          { name: 'commercialAttribution', type: 'bool' },
          { name: 'commercializerChecker', type: 'address' },
          { name: 'commercializerCheckerData', type: 'bytes' },
          { name: 'commercialRevShare', type: 'uint32' },
          { name: 'commercialRevCeiling', type: 'uint256' },
          { name: 'derivativesAllowed', type: 'bool' },
          { name: 'derivativesAttribution', type: 'bool' },
          { name: 'derivativesApproval', type: 'bool' },
          { name: 'derivativesReciprocal', type: 'bool' },
          { name: 'derivativeRevCeiling', type: 'uint256' },
          { name: 'currency', type: 'address' },
          { name: 'uri', type: 'string' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// License Token ABI - for fetching owned license tokens
export const LICENSE_TOKEN_ABI = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'index', type: 'uint256' },
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getLicenseTermsId',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getLicensorIpId',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// Dispute Module ABI - for dispute operations
export const DISPUTE_MODULE_ABI = [
  {
    inputs: [],
    name: 'baseArbitrationPolicy',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'targetIpId', type: 'address' },
      { name: 'disputeEvidenceHash', type: 'bytes32' },
      { name: 'targetTag', type: 'bytes32' },
      { name: 'data', type: 'bytes' },
    ],
    name: 'raiseDispute',
    outputs: [{ name: 'disputeId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

// Royalty Module ABI - for paying royalties
export const ROYALTY_MODULE_ABI = [
  {
    inputs: [
      { name: 'receiverIpId', type: 'address' },
      { name: 'payerIpId', type: 'address' },
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'payRoyaltyOnBehalf',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

// Royalty Workflows ABI - for claiming revenue
export const ROYALTY_WORKFLOWS_ABI = [
  {
    inputs: [
      { name: 'ancestorIpId', type: 'address' },
      { name: 'claimer', type: 'address' },
      {
        name: 'currencyTokens',
        type: 'address[]',
      },
      { name: 'childIpIds', type: 'address[]' },
    ],
    name: 'claimAllRevenue',
    outputs: [
      { name: 'amountsClaimed', type: 'uint256[]' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

// IP Asset Registry ABI - for registering IPs
export const IP_ASSET_REGISTRY_ABI = [
  {
    inputs: [
      { name: 'chainId', type: 'uint256' },
      { name: 'tokenContract', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
    name: 'register',
    outputs: [{ name: 'ipId', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'chainId', type: 'uint256' },
      { name: 'tokenContract', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
    name: 'ipId',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'ipId', type: 'address' }],
    name: 'isRegistered',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// Registration Workflows (SPG) ABI - for minting and registering IPs
export const REGISTRATION_WORKFLOWS_ABI = [
  {
    inputs: [
      { name: 'spgNftContract', type: 'address' },
      { name: 'recipient', type: 'address' },
      {
        name: 'ipMetadata',
        type: 'tuple',
        components: [
          { name: 'ipMetadataURI', type: 'string' },
          { name: 'ipMetadataHash', type: 'bytes32' },
          { name: 'nftMetadataURI', type: 'string' },
          { name: 'nftMetadataHash', type: 'bytes32' },
        ],
      },
      {
        name: 'licenseTermsData',
        type: 'tuple[]',
        components: [
          {
            name: 'terms',
            type: 'tuple',
            components: [
              { name: 'transferable', type: 'bool' },
              { name: 'royaltyPolicy', type: 'address' },
              { name: 'defaultMintingFee', type: 'uint256' },
              { name: 'expiration', type: 'uint256' },
              { name: 'commercialUse', type: 'bool' },
              { name: 'commercialAttribution', type: 'bool' },
              { name: 'commercializerChecker', type: 'address' },
              { name: 'commercializerCheckerData', type: 'bytes' },
              { name: 'commercialRevShare', type: 'uint32' },
              { name: 'commercialRevCeiling', type: 'uint256' },
              { name: 'derivativesAllowed', type: 'bool' },
              { name: 'derivativesAttribution', type: 'bool' },
              { name: 'derivativesApproval', type: 'bool' },
              { name: 'derivativesReciprocal', type: 'bool' },
              { name: 'derivativeRevCeiling', type: 'uint256' },
              { name: 'currency', type: 'address' },
              { name: 'uri', type: 'string' },
            ],
          },
          {
            name: 'licensingConfig',
            type: 'tuple',
            components: [
              { name: 'isSet', type: 'bool' },
              { name: 'mintingFee', type: 'uint256' },
              { name: 'licensingHook', type: 'address' },
              { name: 'hookData', type: 'bytes' },
              { name: 'commercialRevShare', type: 'uint32' },
              { name: 'disabled', type: 'bool' },
              { name: 'expectMinimumGroupRewardShare', type: 'uint32' },
              { name: 'expectGroupRewardPool', type: 'address' },
            ],
          },
        ],
      },
      { name: 'allowDuplicates', type: 'bool' },
    ],
    name: 'mintAndRegisterIpAndAttachPILTerms',
    outputs: [
      { name: 'ipId', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'licenseTermsIds', type: 'uint256[]' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

// ERC20 Allowance ABI - for checking token approvals
export const ERC20_ALLOWANCE_ABI = [
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// SPG NFT Contract ABI - for NFT collection info
export const SPG_NFT_ABI = [
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const
