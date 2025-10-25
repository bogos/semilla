import React from 'react'
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
  const result = useReadContract({
    address: CONTRACTS.POOL_REGISTRY,
    abi: POOL_REGISTRY_ABI,
    functionName: 'getActivePools',
    query: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 10, // 10 minutos (antes cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  })
  
  // Debug logging
  React.useEffect(() => {
    if (result.isSuccess && result.data) {
      console.log('📚 Active Pools:', result.data)
    }
    if (result.isError) {
      console.error('❌ Error fetching active pools:', result.error)
    }
  }, [result.data, result.isSuccess, result.isError, result.error])
  
  return result
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
    query: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  })
}

export function usePoolStats(poolAddress: Address) {
  const { data: stats, isLoading, error } = useReadContract({
    address: poolAddress,
    abi: LENDING_POOL_ABI,
    functionName: 'getPoolStats',
    query: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
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
