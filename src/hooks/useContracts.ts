import { useMemo } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';

import EMASX_ABI from '../abis/EMASX.json';
import EMASXLending_ABI from '../abis/EMASXLending.json';
import EMASXSwap_ABI from '../abis/EMASXSwap.json';
import GoldClaimRegistry_ABI from '../abis/GoldClaimRegistry.json';
import MockGoldOracle_ABI from '../abis/MockGoldOracle.json';
import MockIDRX_ABI from '../abis/MockIDRX.json';
import Treasury_ABI from '../abis/Treasury.json';
import ContractAddresses from '../abis/contract-address.json';

export function useContracts() {
  const { account } = useWallet();

  const contracts = useMemo(() => {
    if (!window.ethereum) return null;
    
    // Use browser provider (MetaMask)
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // We need a signer for write operations, but provider is enough for read.
    // However, to create contract instances that can sign, we need to get the signer.
    // Since getSigner is async, we might return a function to get contracts or just null initially.
    // For simplicity in React, we'll return a helper to get signer-connected contracts.
    
    const getSigner = async () => {
      try {
        return await provider.getSigner();
      } catch (e) {
        console.error("Failed to get signer", e);
        return null;
      }
    };

    const getContract = async (name: keyof typeof ContractAddresses, abi: any) => {
      const signer = await getSigner();
      if (!signer) return null;
      return new ethers.Contract(ContractAddresses[name], abi.abi, signer);
    };

    return {
      getMockIDRX: () => getContract('MockIDRX', MockIDRX_ABI),
      getEMASX: () => getContract('EMASX', EMASX_ABI),
      getOracle: () => getContract('MockGoldOracle', MockGoldOracle_ABI),
      getSwap: () => getContract('EMASXSwap', EMASXSwap_ABI),
      getLending: () => getContract('EMASXLending', EMASXLending_ABI),
      getClaim: () => getContract('GoldClaimRegistry', GoldClaimRegistry_ABI),
      provider
    };
  }, [account]);

  return contracts;
}
