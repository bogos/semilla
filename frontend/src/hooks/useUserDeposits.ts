import { useActivePools } from './usePoolData'
import { usePoolName, usePoolAPR, useUserBalance, useUserWithdrawableInterest } from './useUserData'
import { Address } from 'viem'
import { formatEther } from 'viem'

export interface UserDepositData {
  poolAddress: Address
  poolName: string
  asset: string
  amount: number
  interestEarned: number
  apr: number
}

/**
 * Hook para obtener todos los depósitos del usuario en todos los pools
 * Nota: Por simplicidad, retorna solo los datos de los pools activos
 * Los detalles se cargan bajo demanda cuando se necesitan
 */
export function useUserDeposits() {
  const { data: _poolAddresses, isLoading: poolsLoading } = useActivePools()
  
  // Para cada pool, fetch sus datos
  // El verdadero hook que hace el trabajo es el que itera sobre los datos
  return {
    deposits: [], // Por ahora retornamos vacío - los componentes fetcharán individualmente
    isLoading: poolsLoading,
  }
}

/**
 * Hook para cargar datos de un depósito específico del usuario en un pool
 */
export function useUserDepositData(poolAddress: Address | undefined) {
  const poolName = usePoolName(poolAddress)
  const poolAPR = usePoolAPR(poolAddress)
  const userBalance = useUserBalance(poolAddress)
  const userInterest = useUserWithdrawableInterest(poolAddress)

  if (!poolAddress || !userBalance.data || (userBalance.data as bigint) === 0n) {
    return {
      deposit: null,
      isLoading: false,
    }
  }

  const deposit: UserDepositData = {
    poolAddress,
    poolName: (poolName.data as string) || 'Pool Desconocido',
    asset: 'ETH',
    amount: Number(formatEther(userBalance.data as bigint)),
    interestEarned: (userInterest.data ? Number(formatEther(userInterest.data as bigint)) : 0),
    apr: (poolAPR.data ? Number(poolAPR.data) / 100 : 0),
  }

  return {
    deposit,
    isLoading: poolName.isLoading || poolAPR.isLoading || userBalance.isLoading || userInterest.isLoading,
  }
}
