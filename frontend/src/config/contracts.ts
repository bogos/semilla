import { Address } from 'viem'

// Contract addresses
const poolRegistry = import.meta.env.VITE_POOL_REGISTRY_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3'
const lendingFactory = import.meta.env.VITE_LENDING_FACTORY_ADDRESS || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'

export const CONTRACTS = {
  POOL_REGISTRY: poolRegistry as Address,
  LENDING_FACTORY: lendingFactory as Address,
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
