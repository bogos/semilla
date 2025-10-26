import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { LENDING_POOL_ABI } from '../config/contracts'

export function useCreateLoan(poolAddress: `0x${string}`) {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { 
    isLoading: isConfirming, 
    isSuccess 
  } = useWaitForTransactionReceipt({
    hash,
  })

  const createLoan = (amount: bigint, durationDays: number) => {
    writeContract({
      address: poolAddress,
      abi: LENDING_POOL_ABI,
      functionName: 'createLoan',
      args: [amount, BigInt(durationDays)],
    })
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
