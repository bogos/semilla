import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { LENDING_POOL_ABI } from '../config/contracts'

export function useWithdrawInterest(poolAddress: `0x${string}`) {
  const { 
    writeContract, 
    data: hash, 
    isPending, 
    error 
  } = useWriteContract()
  
  const { 
    isLoading: isConfirming, 
    isSuccess 
  } = useWaitForTransactionReceipt({
    hash,
  })

  const withdrawInterest = () => {
    writeContract({
      address: poolAddress,
      abi: LENDING_POOL_ABI,
      functionName: 'withdrawInterest',
      args: [],
    })
  }

  return {
    withdrawInterest,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}
