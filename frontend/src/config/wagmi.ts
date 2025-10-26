import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { scrollSepolia } from 'viem/chains'
import { localhost } from 'wagmi/chains'
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient()

export const config = getDefaultConfig({
  appName: 'Semilla',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'test-project-id',
  chains: [localhost, scrollSepolia],
  ssr: false,
})
