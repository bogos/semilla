import { useReadContract } from 'wagmi'
import { LENDING_POOL_ABI, POOL_REGISTRY_ABI, CONTRACTS } from '../config/contracts'
import { Address } from 'viem'

export interface PoolData {
  pool: Address
  owner: Address
  name: string
  asset: Address
  createdAt: number
  active: boolean
}

/**
 * Fetch all active pools from the registry
 */
export function useActivePools() {
  return useReadContract({
    address: CONTRACTS.POOL_REGISTRY,
    abi: POOL_REGISTRY_ABI,
    functionName: 'getActivePools',
  })
}

/**
 * Fetch metadata for a specific pool
 */
export function usePoolMetadata(poolAddress: Address | undefined) {
  return useReadContract({
    address: CONTRACTS.POOL_REGISTRY,
    abi: POOL_REGISTRY_ABI,
    functionName: 'getPoolMetadata',
    args: poolAddress ? [poolAddress] : undefined,
    query: {
      enabled: !!poolAddress,
    },
  })
}

/**
 * Fetch total pool count
 */
export function usePoolCount() {
  return useReadContract({
    address: CONTRACTS.POOL_REGISTRY,
    abi: POOL_REGISTRY_ABI,
    functionName: 'getPoolCount',
  })
}

export function usePoolStats(poolAddress: Address) {
  const { data: stats, isLoading, error } = useReadContract({
    address: poolAddress,
    abi: LENDING_POOL_ABI,
    functionName: 'getPoolStats',
  } as any)

  const result = stats as [bigint, bigint, bigint, bigint] | undefined

  return {
    totalLiquidity: result?.[0] ?? 0n,
    totalBorrowed: result?.[1] ?? 0n,
    lenderCount: result?.[2] ?? 0n,
    borrowerCount: result?.[3] ?? 0n,
    isLoading,
    error,
  }
}
