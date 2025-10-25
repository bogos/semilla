import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Address } from 'viem'

const ERC20_ABI = [
  {
    name: 'approve',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    name: 'allowance',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export function useApproveToken(tokenAddress: Address, spenderAddress: Address) {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { 
    isLoading: isConfirming, 
    isSuccess 
  } = useWaitForTransactionReceipt({
    hash,
  })

  const approve = (amount: bigint) => {
    writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spenderAddress, amount],
    })
  }

  return {
    approve,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}
