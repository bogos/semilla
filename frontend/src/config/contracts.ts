import { Address } from 'viem'

// Contract addresses - update with your deployed addresses
export const CONTRACTS = {
  POOL_REGISTRY: '0x' as Address, // Update with actual address
  LENDING_FACTORY: '0x' as Address, // Update with actual address
}

// Pool Registry ABI
export const POOL_REGISTRY_ABI = [
  {
    name: 'getPools',
    outputs: [{ type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    name: 'getPoolInfo',
    inputs: [{ name: 'pool', type: 'address' }],
    outputs: [
      { name: 'name', type: 'string' },
      { name: 'asset', type: 'address' },
      { name: 'apr', type: 'uint256' },
      { name: 'rifCoverage', type: 'uint256' },
      { name: 'active', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// Lending Pool ABI
export const LENDING_POOL_ABI = [
  {
    name: 'getPoolStats',
    outputs: [
      { name: 'totalLiquidity', type: 'uint256' },
      { name: 'totalBorrowed', type: 'uint256' },
      { name: 'lenderCount', type: 'uint256' },
      { name: 'borrowerCount', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    name: 'deposit',
    inputs: [{ name: 'amount', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
