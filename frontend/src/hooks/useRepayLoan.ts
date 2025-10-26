import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { LENDING_POOL_ABI } from '../config/contracts'

export function useRepayLoan(
  poolAddress: `0x${string}`,
  isERC20: boolean = false
) {
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

  const repayLoan = (repaymentAmount: bigint) => {
    if (isERC20) {
      // ERC20: send amount as parameter
      writeContract({
        address: poolAddress,
        abi: LENDING_POOL_ABI,
        functionName: 'repayLoan',
        args: [repaymentAmount],
      })
    } else {
      // ETH: send amount as value
      writeContract({
        address: poolAddress,
        abi: LENDING_POOL_ABI,
        functionName: 'repayLoan',
        args: [BigInt(0)], // dummy argument for ETH
        value: repaymentAmount,
      })
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
