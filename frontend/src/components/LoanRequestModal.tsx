import { useState } from 'react'
import { parseEther } from 'viem'
import { useCreateLoan } from '../hooks/useCreateLoan'

interface LoanRequestModalProps {
  poolAddress: `0x${string}`
  isERC20: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function LoanRequestModal({
  poolAddress,
  isERC20,
  onClose,
  onSuccess,
}: LoanRequestModalProps) {
  const [amount, setAmount] = useState('')
  const [durationDays, setDurationDays] = useState('30')
  const [error, setError] = useState('')

  const { createLoan, isPending, isSuccess } = useCreateLoan(poolAddress)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!amount || !durationDays) {
      setError('Please fill in all fields')
      return
    }

    if (parseFloat(amount) <= 0 || parseInt(durationDays) <= 0) {
      setError('Amount and duration must be greater than 0')
      return
    }

    try {
      const amountBigInt = parseEther(amount)
      createLoan(amountBigInt, parseInt(durationDays))
    } catch (err) {
      setError('Invalid amount format')
    }
  }

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <h2 className="text-xl font-bold text-green-600 mb-4">Loan Created!</h2>
          <p className="text-gray-600 mb-6">
            Your loan request has been approved and the funds have been transferred.
          </p>
          <button
            onClick={() => {
              onClose()
              onSuccess?.()
            }}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Request Loan</h2>
          <button
            onClick={onClose}
            disabled={isPending}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Amount {!isERC20 && '(ETH)'}
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.5"
              disabled={isPending}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (Days)
            </label>
            <input
              type="number"
              min="1"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              placeholder="30"
              disabled={isPending}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          <div className="bg-blue-50 p-3 rounded text-sm text-gray-700 space-y-1">
            <p>
              <strong>Interest Rate:</strong> 8% APR
            </p>
            <p>
              <strong>Estimated Interest:</strong>{' '}
              {amount
                ? (
                    (parseFloat(amount) * 0.08 * parseInt(durationDays)) /
                    365
                  ).toFixed(4)
                : '0.0000'}{' '}
              {!isERC20 ? 'ETH' : 'tokens'}
            </p>
            <p className="text-xs text-gray-600 mt-2">
              Interest is automatically calculated at repayment based on actual days
            </p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-500 text-white py-2 rounded font-medium hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {isPending ? 'Processing...' : 'Request Loan'}
          </button>
        </form>
      </div>
    </div>
  )
}
