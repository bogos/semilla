import React from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { LENDING_POOL_ABI, LENDING_FACTORY_ABI, CONTRACTS } from '../config/contracts'
import { Address, parseEther } from 'viem'

/**
 * Hook para depositar ETH en un pool de préstamos
 */
export function useDeposit(poolAddress: Address) {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const deposit = (amountInEth: string) => {
    try {
      const valueInWei = parseEther(amountInEth)
      writeContract({
        address: poolAddress,
        abi: LENDING_POOL_ABI,
        functionName: 'deposit',
        value: valueInWei,
      })
    } catch (err) {
      console.error('Error en depósito:', err)
    }
  }

  return {
    deposit,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

/**
 * Hook para retirar ETH de un pool de préstamos
 */
export function useWithdraw(poolAddress: Address) {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const withdraw = (amountInEth: string) => {
    try {
      const amountInWei = parseEther(amountInEth)
      writeContract({
        address: poolAddress,
        abi: LENDING_POOL_ABI,
        functionName: 'withdraw',
        args: [amountInWei],
      })
    } catch (err) {
      console.error('Error en retiro:', err)
    }
  }

  return {
    withdraw,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

/**
 * Hook para crear un préstamo desde un pool
 */
export function useCreateLoan(poolAddress: Address) {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const createLoan = (amountInEth: string, durationDays: number = 30) => {
    try {
      const amountInWei = parseEther(amountInEth)
      writeContract({
        address: poolAddress,
        abi: LENDING_POOL_ABI,
        functionName: 'createLoan',
        args: [amountInWei, BigInt(durationDays)],
      })
    } catch (err) {
      console.error('Error al crear préstamo:', err)
    }
  }

  return {
    createLoan,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

/**
 * Hook para reembolsar un préstamo
 */
export function useRepayLoan(poolAddress: Address) {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const repayLoan = (amountInEth: string) => {
    try {
      const valueInWei = parseEther(amountInEth)
      writeContract({
        address: poolAddress,
        abi: LENDING_POOL_ABI,
        functionName: 'repayLoan',
        args: [valueInWei],
        value: valueInWei,
      })
    } catch (err) {
      console.error('Error al reembolsar préstamo:', err)
    }
  }

  return {
    repayLoan,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

/**
 * Hook para solicitar un préstamo (alias de useCreateLoan)
 */
export function useLoanRequest(poolAddress: Address) {
  return useCreateLoan(poolAddress)
}

/**
 * Hook para crear un nuevo pool
 */
export function useCreatePool() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    query: {
      retry: 1, // Only retry once to avoid too many reverts
    },
  })

  const createPool = (
    name: string,
    asset: Address,
    apr: number,
    rifCoverageBp: number,
    isERC20: boolean = true
  ) => {
    try {
      console.log('🔗 Calling writeContract with:', {
        address: CONTRACTS.LENDING_FACTORY,
        functionName: 'createPool',
        args: [name, asset, apr, rifCoverageBp, isERC20],
        gas: 3000000n,
      })
      writeContract({
        address: CONTRACTS.LENDING_FACTORY,
        abi: LENDING_FACTORY_ABI,
        functionName: 'createPool',
        args: [name, asset, apr, rifCoverageBp, isERC20],
        gas: 3000000n, // High gas limit for pool creation (~2.15M in tests)
      })
    } catch (err) {
      console.error('❌ Error al crear pool:', err)
    }
  }

  // Log errors whenever they occur
  React.useEffect(() => {
    if (error) {
      console.error('🚨 useCreatePool error state:', error)
    }
  }, [error])

  // Log hash when transaction is sent
  React.useEffect(() => {
    if (hash) {
      console.log('✅ Transaction sent with hash:', hash)
    }
  }, [hash])

  return {
    createPool,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}
