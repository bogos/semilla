import { useState, useEffect } from 'react'
import { formatEther, parseEther } from 'viem'
import { useReadContract } from 'wagmi'
import { LENDING_POOL_ABI } from '../config/contracts'
import { useRepayLoan } from '../hooks/useRepayLoan'
import { Toast, ToastType } from './Toast'

interface LoanInfo {
  principal: bigint
  accruedInterest: bigint
  dueDate: bigint
  status: string
}

interface LoanRepaymentCardProps {
  poolAddress: `0x${string}`
  borrowerAddress: `0x${string}`
  isERC20: boolean
}

export function LoanRepaymentCard({
  poolAddress,
  borrowerAddress,
  isERC20,
}: LoanRepaymentCardProps) {
  const [isRepaying, setIsRepaying] = useState(false)
  const [repayAmount, setRepayAmount] = useState('')
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  // Get loan info
  const { data: loanDataRaw, isLoading } = useReadContract({
    address: poolAddress,
    abi: LENDING_POOL_ABI,
    functionName: 'getLoanInfo',
    args: [borrowerAddress],
  })

  const { repayLoan, isPending, isSuccess } = useRepayLoan(
    poolAddress,
    isERC20
  )

  const loanData = loanDataRaw as any as LoanInfo | undefined
  const principal = loanData?.principal ? BigInt(loanData.principal) : BigInt(0)
  const accruedInterest = loanData?.accruedInterest ? BigInt(loanData.accruedInterest) : BigInt(0)
  const dueDate = loanData?.dueDate ? Number(loanData.dueDate) : 0
  const status = loanData?.status
  const totalDue = principal + accruedInterest
  const daysUntilDue = Math.max(0, Math.floor((dueDate - Date.now() / 1000) / 86400))
  const isOverdue = daysUntilDue <= 0 && status === 'ACTIVE'

  // Show toast when repayment is successful
  useEffect(() => {
    if (isSuccess) {
      setToast({
        message: `Préstamo reembolsado exitosamente. Intereses distribuidos.`,
        type: 'success',
      })
    }
  }, [isSuccess])

  if (isLoading) {
    return (
      <>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        <div className="bg-white rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
      </>
    )
  }

  if (status === 'REPAID' || !principal) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-600">No active loan</p>
      </div>
    )
  }

  if (isRepaying) {
    return (
      <div className="bg-white rounded-lg p-6 border-2 border-blue-200">
        <h3 className="font-bold text-lg mb-4">Repay Loan</h3>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between p-3 bg-gray-50 rounded">
            <span className="text-gray-600">Principal:</span>
            <span className="font-semibold">
              {formatEther(principal)} {isERC20 ? 'tokens' : 'ETH'}
            </span>
          </div>

          <div className="flex justify-between p-3 bg-blue-50 rounded">
            <span className="text-gray-600">Accrued Interest:</span>
            <span className="font-semibold text-blue-600">
              +{formatEther(accruedInterest)} {isERC20 ? 'tokens' : 'ETH'}
            </span>
          </div>

          <div className="flex justify-between p-3 bg-green-50 rounded border-2 border-green-200">
            <span className="font-bold text-gray-700">Total Due:</span>
            <span className="font-bold text-lg text-green-600">
              {formatEther(totalDue)} {isERC20 ? 'tokens' : 'ETH'}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount to Repay
          </label>
          <input
            type="number"
            step="0.0001"
            min={formatEther(totalDue)}
            value={repayAmount}
            onChange={(e) => setRepayAmount(e.target.value)}
            placeholder={formatEther(totalDue)}
            disabled={isPending || isSuccess}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Minimum: {formatEther(totalDue)}{' '}
            {isERC20 ? 'tokens' : 'ETH'}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              try {
                const amount = parseEther(repayAmount || formatEther(totalDue))
                repayLoan(amount)
              } catch (err) {
                console.error('Invalid amount', err)
              }
            }}
            disabled={isPending || isSuccess || !repayAmount}
            className="flex-1 bg-green-500 text-white py-2 rounded font-medium hover:bg-green-600 disabled:bg-gray-400 transition"
          >
            {isPending ? 'Processing...' : 'Confirm Repayment'}
          </button>
          <button
            onClick={() => {
              setIsRepaying(false)
              setRepayAmount('')
            }}
            disabled={isPending}
            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded font-medium hover:bg-gray-400 disabled:opacity-50 transition"
          >
            Cancel
          </button>
        </div>

        {isSuccess && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
            ✓ Loan repaid successfully!
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="bg-white rounded-lg p-6 border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-lg">Active Loan</h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            isOverdue
              ? 'bg-red-100 text-red-700'
              : 'bg-blue-100 text-blue-700'
          }`}
        >
          {isOverdue ? 'OVERDUE' : 'ACTIVE'}
        </span>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-600">Principal:</span>
          <span className="font-semibold">
            {formatEther(principal)} {isERC20 ? 'tokens' : 'ETH'}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Accrued Interest:</span>
          <span className="font-semibold text-blue-600">
            +{formatEther(accruedInterest)} {isERC20 ? 'tokens' : 'ETH'}
          </span>
        </div>

        <div className="flex justify-between p-3 bg-green-50 rounded">
          <span className="font-bold">Total Due:</span>
          <span className="font-bold text-lg text-green-600">
            {formatEther(totalDue)} {isERC20 ? 'tokens' : 'ETH'}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Days until due:</span>
          <span className={isOverdue ? 'text-red-600 font-bold' : ''}>
            {isOverdue ? 'OVERDUE' : `${daysUntilDue} days`}
          </span>
        </div>
      </div>

      <button
        onClick={() => setIsRepaying(true)}
        className="w-full bg-green-500 text-white py-2 rounded font-medium hover:bg-green-600 transition"
      >
        Repay Loan
      </button>
    </div>
    </>
  )
}
