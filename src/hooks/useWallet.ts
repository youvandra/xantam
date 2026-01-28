import { useState, useEffect, useCallback } from 'react';

// Type definition for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

export const BASE_MAINNET_ID = '0x2105'; // 8453
export const BASE_TESTNET_ID = '0x14a34'; // 84532 (Base Sepolia)

export const NETWORKS = {
  [BASE_MAINNET_ID]: {
    chainId: BASE_MAINNET_ID,
    chainName: 'Base Mainnet',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.base.org'],
    blockExplorerUrls: ['https://basescan.org'],
  },
  [BASE_TESTNET_ID]: {
    chainId: BASE_TESTNET_ID,
    chainName: 'Base Sepolia',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://sepolia.base.org'],
    blockExplorerUrls: ['https://sepolia.basescan.org'],
  },
};

export function useWallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
          setChainId(currentChainId);
        }
      } catch (err: any) {
        console.error('Error checking connection:', err);
      }
    }
  }, []);

  useEffect(() => {
    checkConnection();

    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
        }
      });

      window.ethereum.on('chainChanged', (newChainId: string) => {
        setChainId(newChainId);
        // Recommended to reload page on chain change, but state update might be enough for simple apps
        // window.location.reload(); 
      });
    }

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, [checkConnection]);

  const connect = async () => {
    setIsConnecting(true);
    setError(null);
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask is not installed!');
      setIsConnecting(false);
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(currentChainId);
    } catch (err: any) {
      setError(err.message || 'Failed to connect');
    } finally {
      setIsConnecting(false);
    }
  };

  const switchNetwork = async (targetChainId: string) => {
    setError(null);
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask is not installed!');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          const networkConfig = NETWORKS[targetChainId as keyof typeof NETWORKS];
          if (!networkConfig) {
             throw new Error('Network configuration not found');
          }
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networkConfig],
          });
        } catch (addError: any) {
          setError(addError.message || 'Failed to add network');
        }
      } else {
        setError(switchError.message || 'Failed to switch network');
      }
    }
  };

  const disconnect = useCallback(() => {
    setAccount(null);
    setChainId(null);
    // Note: We can't actually disconnect from MetaMask programmatically, 
    // but we can clear the local state to simulate disconnection in the UI
  }, []);

  return {
    account,
    chainId,
    isConnecting,
    error,
    connect,
    disconnect,
    switchNetwork,
    BASE_MAINNET_ID,
    BASE_TESTNET_ID
  };
}
