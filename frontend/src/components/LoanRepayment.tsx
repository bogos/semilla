import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Address, formatEther } from 'viem'
import { useUserLoanInfo, usePoolAPR } from '../hooks/useUserData'
import { useRepayLoan } from '../hooks/usePoolWrite'
import Tooltip from './Tooltip'

interface LoanRepaymentProps {
  poolAddress: Address
  poolName: string
}

export default function LoanRepayment({ poolAddress, poolName }: LoanRepaymentProps) {
  const { address, isConnected } = useAccount()
  const [showRepayModal, setShowRepayModal] = useState(false)
  const [repayAmount, setRepayAmount] = useState('')

  // Obtener info del préstamo del usuario
  const { data: loanAmount, isLoading: isLoadingLoan } = useUserLoanInfo(poolAddress)
  const { data: aprData, isLoading: isLoadingAPR } = usePoolAPR(poolAddress)
  const { repayLoan, isPending: isRepaying, isSuccess: isRepaySucess } = useRepayLoan(poolAddress)

  // Convertir datos
  const loanAmountBigInt = loanAmount as bigint | undefined
  const aprValue = (aprData as bigint | undefined) || 0n
  const loanAmountEth = loanAmountBigInt ? parseFloat(formatEther(loanAmountBigInt)) : 0
  const aprPercent = Number(aprValue)

  // Calcular interés acumulado (estimado - en production vendría del contrato)
  const estimatedInterest = loanAmountEth > 0 ? (loanAmountEth * aprPercent / 365 / 100) : 0
  const totalOwed = loanAmountEth + estimatedInterest

  // Si no hay préstamo, mostrar mensaje
  if (!loanAmountBigInt || loanAmountBigInt === 0n) {
    return (
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <p className="text-sm text-blue-800">✓ No tienes préstamos activos en este pool</p>
      </div>
    )
  }

  const handleRepay = async () => {
    if (!isConnected) {
      alert('Por favor conecta tu wallet')
      return
    }
    if (!repayAmount || parseFloat(repayAmount) <= 0) {
      alert('Por favor ingresa un monto válido')
      return
    }
    
    await repayLoan(repayAmount)
    if (isRepaySucess) {
      setShowRepayModal(false)
      setRepayAmount('')
    }
  }

  return (
    <>
      {/* Active Loan Card */}
      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-yellow-900">Préstamo Activo</h3>
            <p className="text-sm text-yellow-700">{poolName}</p>
          </div>
          <span className="px-3 py-1 bg-yellow-200 text-yellow-900 text-xs font-bold rounded-full">
            🔄 Activo
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Monto Prestado</p>
            <p className="text-lg font-bold text-primary">{loanAmountEth.toFixed(4)} ETH</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="flex items-center gap-1 mb-1">
              <p className="text-xs text-gray-600">Interés Estimado</p>
              <Tooltip text="Interés acumulado (estimado diariamente)">
                <span className="inline-flex items-center justify-center w-3 h-3 text-xs font-bold text-white bg-gray-400 rounded-full cursor-help">?</span>
              </Tooltip>
            </div>
            <p className="text-lg font-bold text-red-600">{estimatedInterest.toFixed(4)} ETH</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Total a Pagar</p>
            <p className="text-lg font-bold text-primary">{totalOwed.toFixed(4)} ETH</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowRepayModal(true)}
            disabled={!isConnected}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✅ Reembolsar Préstamo
          </button>
        </div>
      </div>

      {/* Repayment Modal */}
      {showRepayModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowRepayModal(false)}
        >
          <div
            className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-primary mb-4">Reembolsar Préstamo</h2>

            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monto Prestado</span>
                  <span className="font-semibold text-primary">{loanAmountEth.toFixed(4)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Interés Estimado</span>
                  <span className="font-semibold text-red-600">{estimatedInterest.toFixed(4)} ETH</span>
                </div>
                <div className="pt-2 border-t border-blue-200 flex justify-between font-bold">
                  <span>Total a Pagar</span>
                  <span className="text-primary">{totalOwed.toFixed(4)} ETH</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-dark mb-2">
                Monto a Reembolsar (ETH)
              </label>
              <input
                type="number"
                value={repayAmount}
                onChange={e => setRepayAmount(e.target.value)}
                placeholder={totalOwed.toFixed(4)}
                step="0.0001"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              />
              <p className="text-xs text-gray-600 mt-1">
                Mínimo: {totalOwed.toFixed(4)} ETH (para liquidar completamente)
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRepayModal(false)
                  setRepayAmount('')
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-dark rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleRepay}
                disabled={isRepaying || !repayAmount}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
              >
                {isRepaying ? 'Reembolsando...' : 'Reembolsar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
