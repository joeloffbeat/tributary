import type { ContractRegistry } from '../index'

// Story Aeneid (Chain ID: 1315) contract configurations
// TODO: Update addresses after contract deployments

const contracts: ContractRegistry = {
  IPayReceiver: {
    address: '0xA5Cf9339908C3970c2e9Ac4aC0105367f53B80cB',
    name: 'IPayReceiver',
    description: 'iPay cross-chain receiver for IP licensing payments on Story Aeneid',
  },
}

export default contracts
