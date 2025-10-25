import { Address } from 'viem'

// Contract addresses
const poolRegistry = import.meta.env.VITE_POOL_REGISTRY_ADDRESS || '0xaCe24dE83154FEb175D725503DE8a862aEf2Af94'
const lendingFactory = import.meta.env.VITE_LENDING_FACTORY_ADDRESS || '0x0ABFbe9D3a56436e54A7176872EaDc493a2ba9E3'
const identityVerifier = import.meta.env.VITE_IDENTITY_VERIFIER_ADDRESS || '0xd4E6B563a9b3F99BB878c858a48EE359499d700f'

// Token addresses
const mockUSDC = import.meta.env.VITE_MOCK_USDC_ADDRESS || '0x6eBdAA7ddA08ed8FC5E8E7cb2F4F01F3EA97D5Ea'
const mockUSX = import.meta.env.VITE_MOCK_USX_ADDRESS || '0x652A8701AdFDD419c19415f0abe8B5E97eAeb72a'

// Debug: log all addresses
console.log('📋 Contract Configuration Loaded:')
console.log('  POOL_REGISTRY:', poolRegistry)
console.log('  LENDING_FACTORY:', lendingFactory)
console.log('  IDENTITY_VERIFIER:', identityVerifier)
console.log('  TOKENS.USDC:', mockUSDC)
console.log('  TOKENS.USX:', mockUSX)
console.log('  TOKENS.ETH: 0x0000000000000000000000000000000000000000')

export const CONTRACTS = {
  POOL_REGISTRY: poolRegistry as Address,
  LENDING_FACTORY: lendingFactory as Address,
  IDENTITY_VERIFIER: identityVerifier as Address,
}

export const TOKENS = {
  USDC: mockUSDC as Address,
  USX: mockUSX as Address,
  ETH: '0x0000000000000000000000000000000000000000' as Address,
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
      { name: 'isERC20', type: 'bool' },
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
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'withdraw',
    inputs: [{ name: 'amount', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
    outputs: [],
  },
  {
    name: 'withdrawInterest',
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
    outputs: [],
  },
  {
    name: 'createLoan',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'durationDays', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
    outputs: [],
  },
  {
    name: 'repayLoan',
    stateMutability: 'payable',
    type: 'function',
    inputs: [{ name: 'repaymentAmount', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'calculateAccruedInterest',
    inputs: [{ name: 'borrower', type: 'address' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    name: 'getPoolStats',
    outputs: [
      { name: '_totalDeposits', type: 'uint256' },
      { name: '_totalBorrowed', type: 'uint256' },
      { name: '_availableLiquidity', type: 'uint256' },
      { name: '_rifFundBalance', type: 'uint256' },
      { name: '_protocolFundBalance', type: 'uint256' },
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
    name: 'getWithdrawableInterest',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    name: 'getLoanInfo',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'principal', type: 'uint256' },
      { name: 'accruedInterest', type: 'uint256' },
      { name: 'dueDate', type: 'uint256' },
      { name: 'status', type: 'string' },
    ],
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
  {
    name: 'isERC20',
    outputs: [{ type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const
