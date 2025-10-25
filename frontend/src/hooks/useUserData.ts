import { useReadContract, useAccount } from 'wagmi'
import { LENDING_POOL_ABI } from '../config/contracts'
import { Address } from 'viem'

/**
 * Hook para obtener el balance de depósitos del usuario en un pool
 */
export function useUserBalance(poolAddress: Address | undefined) {
  const { address } = useAccount()
  
  return useReadContract({
    address: poolAddress,
    abi: LENDING_POOL_ABI,
    functionName: 'getBalance',
    args: address ? [address] : undefined,
    query: {
      enabled: !!poolAddress && !!address,
    },
  })
}

/**
 * Hook para obtener el interés acumulado del usuario en un pool
 */
export function useUserAccruedInterest(poolAddress: Address | undefined) {
  const { address } = useAccount()
  
  return useReadContract({
    address: poolAddress,
    abi: LENDING_POOL_ABI,
    functionName: 'calculateAccruedInterest',
    args: address ? [address] : undefined,
    query: {
      enabled: !!poolAddress && !!address,
    },
  })
}

/**
 * Hook para obtener el interés retirable del usuario en un pool
 */
export function useUserWithdrawableInterest(poolAddress: Address | undefined) {
  const { address } = useAccount()
  
  return useReadContract({
    address: poolAddress,
    abi: LENDING_POOL_ABI,
    functionName: 'getWithdrawableInterest',
    args: address ? [address] : undefined,
    query: {
      enabled: !!poolAddress && !!address,
    },
  })
}

export interface LoanInfo {
  principal: bigint
  accruedInterest: bigint
  dueDate: bigint
  status: string
}

/**
 * Hook para obtener información del préstamo activo del usuario
 */
export function useUserLoanInfo(poolAddress: Address | undefined) {
  const { address } = useAccount()
  
  const result = useReadContract({
    address: poolAddress,
    abi: LENDING_POOL_ABI,
    functionName: 'getLoanInfo',
    args: address ? [address] : undefined,
    query: {
      enabled: !!poolAddress && !!address,
    },
  })
  
  return {
    ...result,
    data: result.data as LoanInfo | undefined,
  }
}

/**
 * Hook para obtener el nombre del pool
 */
export function usePoolName(poolAddress: Address | undefined) {
  return useReadContract({
    address: poolAddress,
    abi: LENDING_POOL_ABI,
    functionName: 'poolName',
    query: {
      enabled: !!poolAddress,
    },
  })
}

/**
 * Hook para obtener el APR del pool
 */
export function usePoolAPR(poolAddress: Address | undefined) {
  return useReadContract({
    address: poolAddress,
    abi: LENDING_POOL_ABI,
    functionName: 'apr',
    query: {
      enabled: !!poolAddress,
    },
  })
}

/**
 * Hook para obtener estadísticas generales del pool
 */
export function usePoolStats(poolAddress: Address | undefined) {
  return useReadContract({
    address: poolAddress,
    abi: LENDING_POOL_ABI,
    functionName: 'getPoolStats',
    query: {
      enabled: !!poolAddress,
    },
  })
}

/**
 * Hook para obtener si el pool usa ERC20
 */
export function usePoolIsERC20(poolAddress: Address | undefined) {
  return useReadContract({
    address: poolAddress,
    abi: LENDING_POOL_ABI,
    functionName: 'isERC20',
    query: {
      enabled: !!poolAddress,
    },
  })
}
