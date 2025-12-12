import IPayRegistryABI from "./abis/IPayRegistry.json";

export const IPAY_REGISTRY_ADDRESS = "0x883172EDFF24FE83FDE776f7A9Aaa59CCe5ABA2B" as const;

export const contracts = {
  IPayRegistry: {
    address: IPAY_REGISTRY_ADDRESS,
    abi: IPayRegistryABI,
  },
} as const;

export { IPayRegistryABI };
