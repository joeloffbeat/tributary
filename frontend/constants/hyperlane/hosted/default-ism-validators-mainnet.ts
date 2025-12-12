// =============================================================================
// Hyperlane Hosted - Default ISM Validators (Mainnet)
// =============================================================================
// Source: https://docs.hyperlane.xyz/docs/reference/default-ism-validators
// Last updated: 2025-01-12
// Note: Only EVM chains included (Solana, Starknet, Cosmos, SVM chains excluded)
// =============================================================================

import type { Address } from 'viem'

/**
 * Default ISM validator addresses for official Hyperlane deployments (Mainnet)
 * Key: chainId, Value: Array of validator addresses
 *
 * These are the validators used in the default Interchain Security Module (ISM)
 * for each chain. Messages are considered valid when threshold signatures are met.
 */
export const HOSTED_DEFAULT_ISM_VALIDATORS_MAINNET: Record<number, Address[]> = {
  // =============================================================================
  // MAINNETS (EVM ONLY)
  // =============================================================================

  // Abstract (2741) - Threshold: 2 of 3
  2741: [
    '0x2ef8ece5b51562e65970c7d36007baa43a1de685', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Ancient8 (888888888) - Threshold: 2 of 3
  888888888: [
    '0xbb5842ae0e05215b53df4787a29144efb7e67551', // Abacus Works
    '0xa5a56e97fb46f0ac3a3d261e404acb998d9a6969', // Coin98
    '0x95c7bf235837cb5a609fe6c95870410b9f68bcff', // Ancient8
  ],

  // ApeChain (33139) - Threshold: 2 of 3
  33139: [
    '0x773d7fe6ffb1ba4de814c28044ff9a2d83a48221', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // AppChain (466) - Threshold: 2 of 3
  466: [
    '0x0531251bbadc1f9f19ccce3ca6b3f79f08eae1be', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Arbitrum (42161) - Threshold: 3 of 5
  42161: [
    '0x4d966438fe9e2b1e7124c87bbb90cb4f0f6c59a1', // Abacus Works
    '0x5450447aee7b544c462c9352bef7cad049b0c2dc', // Zee Prime
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
    '0x57ddf0cd46f31ead8084069ce481507f4305c716', // Luganodes
    '0xde6c50c3e49852dd9fe0388166ebc1ba39ad8505', // Enigma
  ],

  // Arbitrum Nova (42170) - Threshold: 2 of 3
  42170: [
    '0xd2a5e9123308d187383c87053811a2c21bd8af1f', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Arcadia (4278608) - Threshold: 2 of 3
  4278608: [
    '0xe16ee9618f138cc2dcf9f9a95462099a8bf33a38', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Artela (11820) - Threshold: 2 of 3
  11820: [
    '0x8fcc1ebd4c0b463618db13f83e4565af3e166b00', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Astar (592) - Threshold: 2 of 3
  592: [
    '0x4d1b2cade01ee3493f44304653d8e352c66ec3e7', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Aurora (1313161554) - Threshold: 2 of 3
  1313161554: [
    '0x37105aec3ff37c7bb0abdb0b1d75112e1e69fa86', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Avalanche (43114) - Threshold: 3 of 4
  43114: [
    '0x3fb8263859843bffb02950c492d492cae169f4cf', // Abacus Works
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
    '0x74de235ace64fa8a3d5e3d5e414360888e655c62', // Substance Labs
    '0x4488dbc191c39ae026b4a1fdb2aefe21960226d5', // Luganodes
  ],

  // B3 (8333) - Threshold: 2 of 3
  8333: [
    '0xd77b516730a836fc41934e7d5864e72c165b934e', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Base (8453) - Threshold: 3 of 5
  8453: [
    '0xb9453d675e0fa3c178a17b4ce1ad5b1a279b3af9', // Abacus Works
    '0x5450447aee7b544c462c9352bef7cad049b0c2dc', // Zee Prime
    '0xb8cf45d7bab79c965843206d5f4d83bb866d6e86', // Substance Labs
    '0xe957310e17730f29862e896709cce62d24e4b773', // Luganodes
    '0x34a14934d7c18a21440b59dfe9bf132ce601457d', // Enigma
  ],

  // Berachain (80094) - Threshold: 3 of 5
  80094: [
    '0x0190915c55d9c7555e6d2cb838f04d18b5e2260e', // Abacus Works
    '0xa7341aa60faad0ce728aa9aeb67bb880f55e4392', // Luganodes
    '0xae09cb3febc4cad59ef5a56c1df741df4eb1f4b6', // Renzo
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Bitlayer (200901) - Threshold: 4 of 6
  200901: [
    '0x1d9b0f4ea80dbfc71cb7d64d8005eccf7c41e75f', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
    '0xaa00a849fc770d742724cbd2862f91d51db7fb62', // Substance Labs
    '0x68e869315e51f6bd0ba4aac844cf216fd3dec762', // Luganodes
    '0x0677b2daf18b71a2c4220fb17dc81cd3aa7d355b', // Enigma
  ],

  // Blast (81457) - Threshold: 3 of 4
  81457: [
    '0xf20c0b09f597597c8d2430d3d72dfddaf09177d1', // Abacus Works
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
    '0x1652d8ba766821cf01aeea34306dfc1cab964a32', // Everclear
    '0x54bb0036f777202371429e062fe6aee0d59442f9', // Renzo
  ],

  // BOB (60808) - Threshold: 3 of 5
  60808: [
    '0x20f283be1eb0e81e22f51705dcb79883cfdd34aa', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
    '0x53d2738453c222e49c556d937bcef3f80f1c2eec', // Substance Labs
    '0xb574b2b5822a8cb9ca071e7d43865694f23b0bde', // Enigma
  ],

  // Boba Mainnet (288) - Threshold: 2 of 3
  288: [
    '0xebeb92c94ca8408e73aa16fd554cb3a7df075c59', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Botanix (3637) - Threshold: 2 of 2
  3637: [
    '0xc944176bc4d4e5c7b0598884478a27a2b1904664', // Abacus Works
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Binance Smart Chain (56) - Threshold: 4 of 6
  56: [
    '0x570af9b7b36568c8877eebba6c6727aa9dab7268', // Abacus Works
    '0x5450447aee7b544c462c9352bef7cad049b0c2dc', // Zee Prime
    '0x0d4c1394a255568ec0ecd11795b28d1bda183ca4', // Tessellated
    '0x24c1506142b2c859aee36474e59ace09784f71e8', // Substance Labs
    '0xc67789546a7a983bf06453425231ab71c119153f', // Luganodes
    '0x2d74f6edfd08261c927ddb6cb37af57ab89f0eff', // Enigma
  ],

  // B² Network (223) - Threshold: 2 of 3
  223: [
    '0xcadc90933c9fbe843358a4e70e46ad2db78e28aa', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // CarrChain (7667) - Threshold: 2 of 2
  7667: [
    '0x7ed0a7582af75dc38ad82e7125b51e3eaa6ec33b', // Abacus Works
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Celo (42220) - Threshold: 4 of 6
  42220: [
    '0x63478422679303c3e4fc611b771fa4a707ef7f4a', // Abacus Works
    '0xeb0c31e2f2671d724a2589d4a8eca91b97559148', // Imperator
    '0x033e391e9fc57a7b5dd6c91b69be9a1ed11c4986', // Enigma
    '0x4a2423ef982b186729e779b6e54b0e84efea7285', // Luganodes
    '0x0d4c1394a255568ec0ecd11795b28d1bda183ca4', // Tessellated
    '0x5450447aee7b544c462c9352bef7cad049b0c2dc', // Zee Prime
  ],

  // Chiliz (1000088888) - Threshold: 2 of 3
  // Note: Using domainId as key since it differs from chainId
  1000088888: [
    '0x7403e5d58b48b0f5f715d9c78fbc581f01a625cb', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Core (1116) - Threshold: 2 of 3
  1116: [
    '0xbd6e158a3f5830d99d7d2bce192695bc4a148de2', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Coti (2632500) - Threshold: 2 of 3
  2632500: [
    '0x3c89379537f8beafc54e7e8ab4f8a1cf7974b9f0', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Cyber (7560) - Threshold: 2 of 3
  7560: [
    '0x94d7119ceeb802173b6924e6cc8c4cd731089a27', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Degen (666666666) - Threshold: 2 of 3
  666666666: [
    '0x433e311f19524cd64fb2123ad0aa1579a4e1fc83', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Dogechain (2000) - Threshold: 2 of 3
  2000: [
    '0xe43f742c37858746e6d7e458bc591180d0cba440', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Electroneum (52014) - Threshold: 2 of 2
  52014: [
    '0x32917f0a38c60ff5b1c4968cb40bc88b14ef0d83', // Abacus Works
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Endurance (648) - Threshold: 2 of 3
  648: [
    '0x28c5b322da06f184ebf68693c5d19df4d4af13e5', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x7419021c0de2772b763e554480158a82a291c1f2', // Fusionist
  ],

  // Ethereum (1) - Threshold: 6 of 9
  1: [
    '0x03c842db86a6a3e524d4a6615390c1ea8e2b9541', // Abacus Works
    '0x94438a7de38d4548ae54df5c6010c4ebc5239eae', // DSRV
    '0x5450447aee7b544c462c9352bef7cad049b0c2dc', // Zee Prime
    '0xb3ac35d3988bca8c2ffd195b1c6bee18536b317b', // Staked
    '0xb683b742b378632a5f73a2a5a45801b3489bba44', // AVS: Luganodes
    '0x3786083ca59dc806d894104e65a13a70c2b39276', // Imperator
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
    '0x29d783efb698f9a2d3045ef4314af1f5674f52c5', // Substance Labs
    '0x36a669703ad0e11a0382b098574903d2084be22c', // Enigma
  ],

  // Everclear (25327) - Threshold: 2 of 3
  25327: [
    '0xeff20ae3d5ab90abb11e882cfce4b92ea6c74837', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0xD79DFbF56ee2268f061cc613027a44A880f61Ba2', // Everclear
  ],

  // Fantom Opera (250) - Threshold: 2 of 3
  250: [
    '0xa779572028e634e16f26af5dfd4fa685f619457d', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Flare (14) - Threshold: 2 of 3
  14: [
    '0xb65e52be342dba3ab2c088ceeb4290c744809134', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // EVM on Flow (1000000747) - Threshold: 3 of 4
  // Note: Using domainId as key
  1000000747: [
    '0xe132235c958ca1f3f24d772e5970dd58da4c0f6e', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
    '0x14ADB9e3598c395Fe3290f3ba706C3816Aa78F59', // Flow Foundation
  ],

  // Fluence (9999999) - Threshold: 2 of 3
  9999999: [
    '0xabc8dd7594783c90a3c0fb760943f78c37ea6d75', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Form (478) - Threshold: 2 of 3
  478: [
    '0x58554b2e76167993b5fc000d0070a2f883cd333a', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Fraxtal (252) - Threshold: 4 of 6
  252: [
    '0x4bce180dac6da60d0f3a2bdf036ffe9004f944c1', // Abacus Works
    '0x0d4c1394a255568ec0ecd11795b28d1bda183ca4', // Tessellated
    '0x1c3C3013B863Cf666499Da1A61949AE396E3Ab82', // Enigma
    '0x573e960e07ad74ea2c5f1e3c31b2055994b12797', // Imperator
    '0x25b3a88f7cfd3c9f7d7e32b295673a16a6ddbd91', // Luganodes
    '0x5450447aee7b544c462c9352bef7cad049b0c2dc', // Zee Prime
  ],

  // Fuse (122) - Threshold: 2 of 3
  122: [
    '0x770c8ec9aac8cec4b2ead583b49acfbc5a1cf8a9', // Abacus Works
    '0x1FE988A1A20cE4141B2081fF8446DA99e11D61d7', // Fuse
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
  ],

  // Galactica (613419) - Threshold: 2 of 2
  613419: [
    '0xfc48af3372d621f476c53d79d42a9e96ce11fd7d', // Abacus Works
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Gnosis (100) - Threshold: 2 of 2
  100: [
    '0xd4df66a859585678f2ea8357161d896be19cc1ca', // Abacus Works
    '0x5450447aee7b544c462c9352bef7cad049b0c2dc', // Zee Prime
  ],

  // Gravity Alpha Mainnet (1625) - Threshold: 2 of 3
  1625: [
    '0x23d549bf757a02a6f6068e9363196ecd958c974e', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Harmony One (1666600000) - Threshold: 2 of 3
  1666600000: [
    '0xd677803a67651974b1c264171b5d7ca8838db8d5', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Hashkey (177) - Threshold: 2 of 3
  177: [
    '0x55007cab8788cdba22844e7a2499cf43347f487a', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Hemi Network (43111) - Threshold: 2 of 3
  43111: [
    '0x312dc72c17d01f3fd0abd31dd9b569bc473266dd', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // HyperEVM (999) - Threshold: 3 of 4
  999: [
    '0x01be14a9eceeca36c9c1d46c056ca8c87f77c26f', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
    '0x04d949c615c9976f89595ddcb9008c92f8ba7278', // Luganodes
  ],

  // Immutable zkEVM (1000013371) - Threshold: 2 of 3
  // Note: Using domainId as key
  1000013371: [
    '0xbdda85b19a5efbe09e52a32db1a072f043dd66da', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Incentiv (24101) - Threshold: 2 of 2
  24101: [
    '0x72669f47b6f119289f1a42641b02a9656cc8fecd', // Abacus Works
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Ink (57073) - Threshold: 4 of 6
  57073: [
    '0xb533b8b104522958b984fb258e0684dec0f1a6a5', // Abacus Works
    '0xd207a6dfd887d91648b672727ff1aef6223cb15a', // Imperator
    '0xa40203b5301659f1e201848d92f5e81f64f206f5', // Enigma
    '0xff9c1e7b266a36eda0d9177d4236994d94819dc0', // Luganodes
    '0x0d4c1394a255568ec0ecd11795b28d1bda183ca4', // Tessellated
    '0x5450447aee7b544c462c9352bef7cad049b0c2dc', // Zee Prime
  ],

  // Kaia (8217) - Threshold: 2 of 3
  8217: [
    '0x9de0b3abb221d19719882fa4d61f769fdc2be9a4', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Katana (747474) - Threshold: 2 of 2
  747474: [
    '0xf23003ebdc6c53765d52b1fe7a65046eabb0e73b', // Abacus Works
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Linea (59144) - Threshold: 4 of 6
  59144: [
    '0xf2d5409a59e0f5ae7635aff73685624904a77d94', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
    '0x5450447aee7b544c462c9352bef7cad049b0c2dc', // Zee Prime
    '0x0c760f4bcb508db9144b0579e26f5ff8d94daf4d', // Luganodes
    '0x6fbceb2680c8181acf3d1b5f0189e3beaa985338', // Enigma
  ],

  // Lisk (1135) - Threshold: 5 of 7
  1135: [
    '0xc0b282aa5bac43fee83cf71dc3dd1797c1090ea5', // Abacus Works
    '0x0d4c1394a255568ec0ecd11795b28d1bda183ca4', // Tessellated
    '0x3DA4ee2801Ec6CC5faD73DBb94B10A203ADb3d9e', // Enigma
    '0x4df6e8878992c300e7bfe98cac6bf7d3408b9cbf', // Imperator
    '0xf0da628f3fb71652d48260bad4691054045832ce', // Luganodes
    '0xead4141b6ea149901ce4f4b556953f66d04b1d0c', // Lisk
    '0x5450447aee7b544c462c9352bef7cad049b0c2dc', // Zee Prime
  ],

  // Lit Chain (175200) - Threshold: 2 of 2
  175200: [
    '0xde5509be55483aa525e9b5cce6fe64d3e68d068d', // Abacus Works
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // LUKSO (42) - Threshold: 2 of 3
  42: [
    '0xa5e953701dcddc5b958b5defb677a829d908df6d', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x101cE77261245140A0871f9407d6233C8230Ec47', // Blockhunters
  ],

  // Lumia Prism (1000073017) - Threshold: 2 of 3
  // Note: Using domainId as key
  1000073017: [
    '0xb69731640ffd4338a2c9358a935b0274c6463f85', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Manta Pacific (169) - Threshold: 4 of 6
  169: [
    '0x8e668c97ad76d0e28375275c41ece4972ab8a5bc', // Abacus Works
    '0x521a3e6bf8d24809fde1c1fd3494a859a16f132c', // Cosmostation
    '0x14025fe092f5f8a401dd9819704d9072196d2125', // P2P
    '0x25b9a0961c51e74fd83295293bc029131bf1e05a', // Neutron
    '0xa0eE95e280D46C14921e524B075d0C341e7ad1C8', // Cosmos Spaces
    '0xcc9a0b6de7fe314bd99223687d784730a75bb957', // DSRV
  ],

  // Mantle (5000) - Threshold: 4 of 6
  5000: [
    '0xf930636c5a1a8bf9302405f72e3af3c96ebe4a52', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
    '0x5450447aee7b544c462c9352bef7cad049b0c2dc', // Zee Prime
    '0xcd3b3a2007aab3b00418fbac12bea19d04243497', // Luganodes
    '0x332b3710e56b843027d4c6da7bca219ece7099b0', // Enigma
  ],

  // Mantra (5888) - Threshold: 2 of 2
  5888: [
    '0x89b8064e29f125e896f6081ebb77090c46bca9cd', // Abacus Works
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Matchain (698) - Threshold: 2 of 3
  698: [
    '0x8a052f7934b0626105f34f980c875ec03aaf82e8', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Merlin (4200) - Threshold: 2 of 3
  4200: [
    '0xc1d6600cb9326ed2198cc8c4ba8d6668e8671247', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Metal L2 (1000001750) - Threshold: 4 of 6
  // Note: Using domainId as key
  1000001750: [
    '0xd9f7f1a05826197a93df51e86cefb41dfbfb896a', // Abacus Works
    '0x01e3909133d20c05bbc94247769235d30101f748', // Imperator
    '0xaba06266f47e3ef554d218b879bd86114a8dabd4', // Enigma
    '0x05d91f80377ff5e9c6174025ffaf094c57a4766a', // Luganodes
    '0x0d4c1394a255568ec0ecd11795b28d1bda183ca4', // Tessellated
    '0x5450447aee7b544c462c9352bef7cad049b0c2dc', // Zee Prime
  ],

  // Metis Andromeda (1088) - Threshold: 4 of 6
  1088: [
    '0xc4a3d25107060e800a43842964546db508092260', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
    '0x5450447aee7b544c462c9352bef7cad049b0c2dc', // Zee Prime
    '0xad1df94ae078631bfea1623520125e93a6085555', // Luganodes
    '0x4272e7b93e127da5bc7cee617febf47bcad20def', // Enigma
  ],

  // Mint (185) - Threshold: 2 of 3
  185: [
    '0xfed01ccdd7a65e8a6ad867b7fb03b9eb47777ac9', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x0230505530b80186f8cdccfaf9993eb97aebe98a', // Mint
  ],

  // Miraclechain (92278) - Threshold: 2 of 3
  92278: [
    '0x8fc655174e99194399822ce2d3a0f71d9fc2de7b', // Abacus Works
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
    '0x7e592830cc7b26b428eea0297889e195f8438016', // Miracle Chain
  ],

  // Mitosis (124816) - Threshold: 3 of 5
  124816: [
    '0x3b3eb808d90a4e19bb601790a6b6297812d6a61f', // Abacus Works
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
    '0x5450447aee7b544c462c9352bef7cad049b0c2dc', // Zee Prime
    '0x401f25ff73769ed85bdb449a4347a4fd2678acfe', // Enigma
    '0x340058f071e8376c2ecff219e1e6620deea8a3c7', // Substance Labs
  ],

  // Mode (34443) - Threshold: 4 of 6
  34443: [
    '0x7eb2e1920a4166c19d6884c1cec3d2cf356fc9b7', // Abacus Works
    '0x0d4c1394a255568ec0ecd11795b28d1bda183ca4', // Tessellated
    '0x65C140e3a05F33192384AffEF985696Fe3cDDE42', // Enigma
    '0x20eade18ea2af6dfd54d72b3b5366b40fcb47f4b', // Imperator
    '0x485a4f0009d9afbbf44521016f9b8cdd718e36ea', // Luganodes
    '0x5450447aee7b544c462c9352bef7cad049b0c2dc', // Zee Prime
  ],

  // Molten (360) - Threshold: 2 of 3
  360: [
    '0xad5aa33f0d67f6fa258abbe75458ea4908f1dc9f', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Monad (143) - Threshold: 2 of 2
  143: [
    '0xb4654795b2f1b17513ffde7d85c776e4cade366c', // Abacus Works
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Moonbeam (1284) - Threshold: 2 of 2
  1284: [
    '0x2225e2f4e9221049456da93b71d2de41f3b6b2a8', // Abacus Works
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Morph (2818) - Threshold: 2 of 3
  2818: [
    '0x4884535f393151ec419add872100d352f71af380', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Nibiru (6900) - Threshold: 2 of 3
  6900: [
    '0xba9779d84a8efba1c6bc66326d875c3611a24b24', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Ontology (58) - Threshold: 3 of 4
  58: [
    '0x2578b0a330c492e1a1682684e27e6a93649befd5', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
    '0x69bbf7d6d8ebf9d60da9607722e8f9c1b0ce7520', // Ontology
  ],

  // Oort (970) - Threshold: 2 of 3
  970: [
    '0x9b7ff56cd9aa69006f73f1c5b8c63390c706a5d7', // Abacus Works
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
    '0xfa94a494f01d1034b8cea025ca4c2a7e31ca39a1', // Oort
  ],

  // opBNB (204) - Threshold: 2 of 3
  204: [
    '0x1bdf52749ef2411ab9c28742dea92f209e96c9c4', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Optimism (10) - Threshold: 4 of 6
  10: [
    '0x20349eadc6c72e94ce38268b96692b1a5c20de4f', // Abacus Works
    '0x0d4c1394a255568ec0ecd11795b28d1bda183ca4', // Tessellated
    '0xd8c1cCbfF28413CE6c6ebe11A3e29B0D8384eDbB', // Enigma
    '0x1b9e5f36c4bfdb0e3f0df525ef5c888a4459ef99', // Imperator
    '0xf9dfaa5c20ae1d84da4b2696b8dc80c919e48b12', // Luganodes
    '0x5450447aee7b544c462c9352bef7cad049b0c2dc', // Zee Prime
  ],

  // Orderly L2 (291) - Threshold: 2 of 3
  291: [
    '0xec3dc91f9fa2ad35edf5842aa764d5573b778bb6', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Peaq (3338) - Threshold: 2 of 3
  3338: [
    '0x7f7fe70b676f65097e2a1e2683d0fc96ea8fea49', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Plasma (9745) - Threshold: 2 of 2
  9745: [
    '0x4ba900a8549fe503bca674114dc98a254637fc2c', // Abacus Works
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Plume (98866) - Threshold: 2 of 3
  98866: [
    '0x63c9b5ea28710d956a51f0f746ee8df81215663f', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Polygon (137) - Threshold: 2 of 3
  137: [
    '0x12ecb319c7f4e8ac5eb5226662aeb8528c5cefac', // Abacus Works
    '0x008f24cbb1cc30ad0f19f2516ca75730e37efb5f', // DSRV
    '0x5450447aee7b544c462c9352bef7cad049b0c2dc', // Zee Prime
  ],

  // Polygon zkEVM (1101) - Threshold: 2 of 2
  1101: [
    '0x86f2a44592bb98da766e880cfd70d3bbb295e61a', // Abacus Works
    '0x865818fe1db986036d5fd0466dcd462562436d1a', // DSRV
  ],

  // Polynomial (1000008008) - Threshold: 2 of 3
  // Note: Using domainId as key
  1000008008: [
    '0x23d348c2d365040e56f3fee07e6897122915f513', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Prom (227) - Threshold: 2 of 3
  227: [
    '0xb0c4042b7c9a95345be8913f4cdbf4043b923d98', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // PulseChain (369) - Threshold: 2 of 2
  369: [
    '0xa73fc7ebb2149d9c6992ae002cb1849696be895b', // Abacus Works
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // RARI Chain (1000012617) - Threshold: 2 of 3
  // Note: Using domainId as key
  1000012617: [
    '0xeac012df7530720dd7d6f9b727e4fe39807d1516', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Reactive Mainnet (1597) - Threshold: 2 of 3
  1597: [
    '0x45768525f6c5ca2e4e7cc50d405370eadee2d624', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Redstone (690) - Threshold: 2 of 3
  690: [
    '0x1400b9737007f7978d8b4bbafb4a69c83f0641a7', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Ronin (2020) - Threshold: 4 of 6
  2020: [
    '0xa3e11929317e4a871c3d47445ea7bb8c4976fd8a', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
    '0x5450447aee7b544c462c9352bef7cad049b0c2dc', // Zee Prime
    '0x808a3945d5f9c2f9ccf7a76bde4c4b54c9c7dba4', // Luganodes
    '0xe8a821e77bd1ee4658c29e8c3f43c0200b0f06a1', // Enigma
  ],

  // Scroll (534352) - Threshold: 2 of 2
  534352: [
    '0xad557170a9f2f21c35e03de07cb30dcbcc3dff63', // Abacus Works
    '0xb3ac35d3988bca8c2ffd195b1c6bee18536b317b', // Staked
  ],

  // Sei (1329) - Threshold: 2 of 3
  1329: [
    '0x9920d2dbf6c85ffc228fdc2e810bf895732c6aa5', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Shibarium (109) - Threshold: 2 of 3
  109: [
    '0xfa33391ee38597cbeef72ccde8c9e13e01e78521', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Soneium (1868) - Threshold: 4 of 6
  1868: [
    '0xd4b7af853ed6a2bfc329ecef545df90c959cbee8', // Abacus Works
    '0x9f4fa50ce49815b0932428a0eb1988382cef4a97', // Imperator
    '0x8d2f8ebd61d055d58768cf3b07cb2fb565d87716', // Enigma
    '0x6c5f6ab7a369222e6691218ad981fe08a5def094', // Luganodes
    '0x0d4c1394a255568ec0ecd11795b28d1bda183ca4', // Tessellated
    '0x5450447aee7b544c462c9352bef7cad049b0c2dc', // Zee Prime
  ],

  // Sonic (146) - Threshold: 4 of 6
  146: [
    '0xa313d72dbbd3fa51a2ed1611ea50c37946fa42f7', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
    '0x5450447aee7b544c462c9352bef7cad049b0c2dc', // Zee Prime
    '0x7f0e75c5151d0938eaa9ab8a30f9ddbd74c4ebef', // Luganodes
    '0x4e3d1c926843dcc8ff47061bbd7143a2755899f3', // Enigma
  ],

  // Sophon (50104) - Threshold: 2 of 3
  50104: [
    '0xb84c5d02120ed0b39d0f78bbc0e298d89ebcd10b', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Story Mainnet (1514) - Threshold: 2 of 3
  1514: [
    '0x501eda013378c60557d763df98d617b6ba55447a', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Subtensor (964) - Threshold: 3 of 4
  964: [
    '0xd5f8196d7060b85bea491f0b52a671e05f3d10a2', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
    '0x5450447aee7b544c462c9352bef7cad049b0c2dc', // Zee Prime
  ],

  // Superposition (1000055244) - Threshold: 2 of 3
  // Note: Using domainId as key
  1000055244: [
    '0x3f489acdd341c6b4dd86293fa2cc5ecc8ccf4f84', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Superseed (5330) - Threshold: 4 of 6
  5330: [
    '0xdc2b87cb555411bb138d3a4e5f7832c87fae2b88', // Abacus Works
    '0x68f3a3b244f6ddc135130200a6b8729e290b4240', // Imperator
    '0x6ff4554cffbc2e4e4230b78e526eab255101d05a', // Enigma
    '0x55880ac03fdf15fccff54ed6f8a83455033edd22', // Luganodes
    '0x0d4c1394a255568ec0ecd11795b28d1bda183ca4', // Tessellated
    '0x5450447aee7b544c462c9352bef7cad049b0c2dc', // Zee Prime
  ],

  // Swell (1923) - Threshold: 4 of 6
  1923: [
    '0x4f51e4f4c7fb45d82f91568480a1a2cfb69216ed', // Abacus Works
    '0x9eadf9217be22d9878e0e464727a2176d5c69ff8', // Luganodes
    '0xa5a23fa2a67782bbf1a540cb5ca6a47a0f3f66fb', // Imperator
    '0x3f707633ccab09d2978e29107c0bbef8a993e7a0', // Enigma
    '0x0d4c1394a255568ec0ecd11795b28d1bda183ca4', // Tessellated
    '0x5450447aee7b544c462c9352bef7cad049b0c2dc', // Zee Prime
  ],

  // TAC (239) - Threshold: 2 of 2
  239: [
    '0x606561d6a45188ba0a486e513e440bfc421dbc36', // Abacus Works
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Taiko (167000) - Threshold: 3 of 4
  167000: [
    '0xa930073c8f2d0b2f7423ea32293e0d1362e65d79', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
    '0x2F007c82672F2Bb97227D4e3F80Ac481bfB40A2a', // Luganodes
  ],

  // Tangle (5845) - Threshold: 2 of 3
  5845: [
    '0x1ee52cbbfacd7dcb0ba4e91efaa6fbc61602b15b', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0xe271ef9a6e312540f099a378865432fa73f26689', // Tangle
  ],

  // Torus (21000) - Threshold: 2 of 3
  21000: [
    '0x96982a325c28a842bc8cf61b63000737bb9f1f7d', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Unichain (130) - Threshold: 4 of 6
  130: [
    '0x9773a382342ebf604a2e5de0a1f462fb499e28b1', // Abacus Works
    '0xa2549be30fb852c210c2fe8e7639039dca779936', // Imperator
    '0xbcbed4d11e946844162cd92c6d09d1cf146b4006', // Enigma
    '0xa9d517776fe8beba7d67c21cac1e805bd609c08e', // Luganodes
    '0x0d4c1394a255568ec0ecd11795b28d1bda183ca4', // Tessellated
    '0x5450447aee7b544c462c9352bef7cad049b0c2dc', // Zee Prime
  ],

  // Vana (1480) - Threshold: 2 of 3
  1480: [
    '0xfdf3b0dfd4b822d10cacb15c8ae945ea269e7534', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Viction (88) - Threshold: 2 of 3
  88: [
    '0x6d113ae51bfea7b63a8828f97e9dce393b25c189', // BlockPI
    '0xa3f93fe365bf99f431d8fde740b140615e24f99b', // RockX
    '0x1f87c368f8e05a85ef9126d984a980a20930cb9c', // Abacus Works
  ],

  // World Chain (480) - Threshold: 4 of 6
  480: [
    '0x31048785845325b22817448b68d08f8a8fe36854', // Abacus Works
    '0x11e2a683e83617f186614071e422b857256a9aae', // Imperator
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x5450447aee7b544c462c9352bef7cad049b0c2dc', // Zee Prime
    '0xc1545f9fe903736b2e438b733740bd3516486da5', // Luganodes
    '0x698810f8ae471f7e34860b465aeeb03df407be47', // Enigma
  ],

  // Xai (660279) - Threshold: 2 of 3
  660279: [
    '0xe993f01fea86eb64cda45ae5af1d5be40ac0c7e9', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // XLayer (196) - Threshold: 2 of 3
  196: [
    '0xa2ae7c594703e988f23d97220717c513db638ea3', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // XRPL EVM (1440000) - Threshold: 2 of 2
  1440000: [
    '0x14d3e2f28d60d54a1659a205cb71e6e440f06510', // Abacus Works
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // 0G (16661) - Threshold: 4 of 6
  16661: [
    '0xc37e7dad064c11d7ecfc75813a4d8d649d797275', // Abacus Works
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
    '0x5450447aee7b544c462c9352bef7cad049b0c2dc', // Zee Prime
    '0x25c5fc524ac7ef5e7868644fbe68793e5eb179ea', // Luganodes
    '0x782ac2b5244b69779bd7214a2d60212fb35c3ae7', // Enigma
    '0xd3e6a4e61b5d902a63df6dac9db5585d9f319b09', // Substance Labs
  ],

  // Zero Network (543210) - Threshold: 2 of 3
  543210: [
    '0x1bd9e3f8a90ea1a13b0f2838a1858046368aad87', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // ZetaChain (7000) - Threshold: 2 of 3
  7000: [
    '0xa3bca0b80317dbf9c7dce16a16ac89f4ff2b23ef', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Zircuit (48900) - Threshold: 3 of 4
  48900: [
    '0x169ec400cc758fef3df6a0d6c51fbc6cdd1015bb', // Abacus Works
    '0x7aC6584c068eb2A72d4Db82A7B7cd5AB34044061', // Luganodes
    '0x1da9176C2CE5cC7115340496fa7D1800a98911CE', // Renzo
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // zkSync (324) - Threshold: 2 of 3
  324: [
    '0xadd1d39ce7a687e32255ac457cf99a6d8c5b5d1a', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],

  // Zora (7777777) - Threshold: 2 of 3
  7777777: [
    '0x35130945b625bb69b28aee902a3b9a76fa67125f', // Abacus Works
    '0xcf0211fafbb91fd9d06d7e306b30032dc3a1934f', // Merkly
    '0x4f977a59fdc2d9e39f6d780a84d5b4add1495a36', // Mitosis
  ],
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Check if a chain has hosted default ISM validators
 */
export const hasHostedDefaultIsmValidators = (chainId: number): boolean =>
  chainId in HOSTED_DEFAULT_ISM_VALIDATORS_MAINNET

/**
 * Get default ISM validators for a chain
 */
export const getHostedDefaultIsmValidators = (
  chainId: number
): Address[] | undefined => HOSTED_DEFAULT_ISM_VALIDATORS_MAINNET[chainId]

/**
 * Get all chain IDs with default ISM validators
 */
export const getHostedDefaultIsmValidatorsChainIds = (): number[] =>
  Object.keys(HOSTED_DEFAULT_ISM_VALIDATORS_MAINNET).map(Number)

/**
 * Count of supported chains with default ISM validators
 */
export const HOSTED_DEFAULT_ISM_VALIDATORS_MAINNET_COUNT = Object.keys(
  HOSTED_DEFAULT_ISM_VALIDATORS_MAINNET
).length
