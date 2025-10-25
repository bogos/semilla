import { useReadContract } from 'wagmi'
import { LENDING_POOL_ABI } from '../config/contracts'
import { Address } from 'viem'

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
