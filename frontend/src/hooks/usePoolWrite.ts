import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { LENDING_POOL_ABI } from '../config/contracts'
import { Address, parseUnits } from 'viem'

/**
 * Hook to deposit funds into a lending pool
 */
export function useDeposit(poolAddress: Address) {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const deposit = async (amount: string, decimals: number = 6) => {
    try {
      const parsedAmount = parseUnits(amount, decimals)
      writeContract({
        address: poolAddress,
        abi: LENDING_POOL_ABI,
        functionName: 'deposit',
        args: [parsedAmount],
      })
    } catch (err) {
      console.error('Error depositing:', err)
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
 * Hook to request a loan from a lending pool
 */
export function useLoanRequest(poolAddress: Address) {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const requestLoan = async (amount: string, decimals: number = 6) => {
    try {
      const parsedAmount = parseUnits(amount, decimals)
      writeContract({
        address: poolAddress,
        abi: LENDING_POOL_ABI,
        functionName: 'requestLoan',
        args: [parsedAmount],
      })
    } catch (err) {
      console.error('Error requesting loan:', err)
    }
  }

  return {
    requestLoan,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}
