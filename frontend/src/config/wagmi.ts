import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { scrollSepolia } from 'viem/chains'
import { defineChain } from 'viem'
import { QueryClient } from '@tanstack/react-query'

// Define Anvil chain (chain 1337)
const anvil = defineChain({
  id: 1337,
  name: 'Anvil',
  network: 'anvil',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://localhost:8545'],
    },
  },
  testnet: true,
})

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 10, // 10 minutos
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
})

export const config = getDefaultConfig({
  appName: 'Semilla',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'test-project-id',
  chains: [scrollSepolia, anvil],
  ssr: false,
})
