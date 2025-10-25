import { Address } from 'viem'
import { useUserDepositData } from '../hooks/useUserDeposits'
import Tooltip from './Tooltip'

interface DepositCardProps {
  poolAddress?: Address
  mockData?: {
    poolName: string
    amount: number
    interestEarned: number
    apr: number
  }
}

export default function DepositCard({ poolAddress, mockData }: DepositCardProps) {
  const { deposit, isLoading } = useUserDepositData(poolAddress)
  const depositData = mockData || deposit

  if (isLoading && !mockData) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200 animate-pulse">
        <div className="h-4 bg-green-200 rounded w-1/3 mb-3"></div>
        <div className="space-y-2">
          <div className="h-3 bg-green-200 rounded w-1/4"></div>
          <div className="h-3 bg-green-200 rounded w-1/4"></div>
        </div>
      </div>
    )
  }

  if (!depositData) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-bold text-green-900">{depositData.poolName}</h4>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-xs text-green-700">Bruto</span>
            <span className="text-sm font-bold text-green-700 bg-white rounded px-2 py-1">
              {depositData.apr.toFixed(2)}%
            </span>
            <Tooltip text="APR total del pool">
              <span className="inline-flex items-center justify-center w-3 h-3 text-xs font-bold text-white bg-green-600 rounded-full cursor-help">
                ?
              </span>
            </Tooltip>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-green-700">Neto</span>
            <span className="text-sm font-bold text-green-600 bg-white rounded px-2 py-1">
              {(depositData.apr * 0.7).toFixed(2)}%
            </span>
            <Tooltip text="Tu parte real (70% del APR bruto)">
              <span className="inline-flex items-center justify-center w-3 h-3 text-xs font-bold text-white bg-green-600 rounded-full cursor-help">
                ?
              </span>
            </Tooltip>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded p-2">
          <p className="text-xs text-gray-600">Depositado</p>
          <p className="font-bold text-green-600">${depositData.amount.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded p-2">
          <p className="text-xs text-gray-600">Interés</p>
          <p className="font-bold text-green-600">+${depositData.interestEarned.toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}
