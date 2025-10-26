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
  })

  const createPool = (
    name: string,
    asset: Address,
    apr: number,
    rifCoverageBp: number,
    isERC20: boolean = true
  ) => {
    try {
      writeContract({
        address: CONTRACTS.LENDING_FACTORY,
        abi: LENDING_FACTORY_ABI,
        functionName: 'createPool',
        args: [name, asset, BigInt(apr), BigInt(rifCoverageBp) as any, isERC20],
      })
    } catch (err) {
      console.error('Error al crear pool:', err)
    }
  }

  return {
    createPool,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}
