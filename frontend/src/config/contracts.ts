import { Address } from 'viem'

// Contract addresses
const poolRegistry = import.meta.env.VITE_POOL_REGISTRY_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3'
const lendingFactory = import.meta.env.VITE_LENDING_FACTORY_ADDRESS || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
const identityVerifier = import.meta.env.VITE_IDENTITY_VERIFIER_ADDRESS || '0x9fE46736679d2D9a88020340A6BA7b3d4d6AB08a'

export const CONTRACTS = {
  POOL_REGISTRY: poolRegistry as Address,
  LENDING_FACTORY: lendingFactory as Address,
  IDENTITY_VERIFIER: identityVerifier as Address,
}

// Pool Registry ABI
export const POOL_REGISTRY_ABI = [
  {
    name: 'getActivePools',
    outputs: [{ type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    name: 'getPoolMetadata',
    inputs: [{ name: 'pool', type: 'address' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'pool', type: 'address' },
          { name: 'owner', type: 'address' },
          { name: 'name', type: 'string' },
          { name: 'asset', type: 'address' },
          { name: 'createdAt', type: 'uint32' },
          { name: 'active', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    name: 'getPoolCount',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// Lending Factory ABI
export const LENDING_FACTORY_ABI = [
  {
    name: 'createPool',
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'asset', type: 'address' },
      { name: 'apr', type: 'uint256' },
      { name: 'rifCoverageBp', type: 'uint16' },
    ],
    outputs: [{ name: 'poolAddress', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    name: 'getAllPools',
    outputs: [{ type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    name: 'whitelistAsset',
    inputs: [{ name: 'asset', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

// Lending Pool ABI
export const LENDING_POOL_ABI = [
  {
    name: 'deposit',
    stateMutability: 'payable',
    type: 'function',
    inputs: [],
    outputs: [],
  },
  {
    name: 'withdraw',
    inputs: [{ name: 'amount', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    name: 'createLoan',
    inputs: [{ name: 'amount', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    name: 'repayLoan',
    stateMutability: 'payable',
    type: 'function',
    inputs: [],
    outputs: [],
  },
  {
    name: 'getPoolStats',
    outputs: [
      { name: '_totalDeposits', type: 'uint256' },
      { name: '_totalBorrowed', type: 'uint256' },
      { name: '_availableLiquidity', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    name: 'getBalance',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    name: 'getLoanInfo',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    name: 'poolName',
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    name: 'apr',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const
