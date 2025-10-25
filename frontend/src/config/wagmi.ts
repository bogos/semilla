import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { scrollSepolia } from 'viem/chains'

export const config = getDefaultConfig({
  appName: 'Semilla',
  projectId: 'YOUR_PROJECT_ID',
  chains: [scrollSepolia],
  ssr: false,
})
