import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Address } from 'viem'
import Tooltip from './Tooltip'
import { useDeposit, useLoanRequest, useRepayLoan } from '../hooks/usePoolWrite'
import { useApproveToken } from '../hooks/useApproveToken'
import { TOKENS } from '../config/contracts'
import { useUserLoanInfo } from '../hooks/useUserData'
import { Toast, ToastType } from './Toast'

interface Pool {
  id: string
  name: string
  asset: string
  apr: number
  rifCoverage: number
  liquidity: number
  lenders: number
  borrowers: number
  active: boolean
}

interface PoolActionButtonsProps {
  pool: Pool
  poolAddress: Address
  size?: 'small' | 'large'
  compact?: boolean
}

export default function PoolActionButtons({ pool, poolAddress, size = 'small', compact = false }: PoolActionButtonsProps) {
  const { isConnected } = useAccount()
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showBorrowModal, setShowBorrowModal] = useState(false)
  const [showRepayModal, setShowRepayModal] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const [borrowAmount, setBorrowAmount] = useState('')
  const [repayAmount, setRepayAmount] = useState('')
  const [estimatedDays, setEstimatedDays] = useState(30)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const [isApprovePending, setIsApprovePending] = useState(false)
  
  // Determine token address based on pool asset
  const tokenAddress = pool.asset === 'USDC' ? TOKENS.USDC : pool.asset === 'USX' ? TOKENS.USX : undefined
  
  // Approve hook
  const { approve: approveToken, isPending: isApprovingToken, isSuccess: isApproveSuccess } = useApproveToken(
    tokenAddress!,
    poolAddress
  )
  
  // Deposit hook
  const { deposit, isPending: isDepositPending } = useDeposit(poolAddress)
  
  // Loan request hook
  const { createLoan: requestLoan, isPending: isLoanPending, isSuccess: isLoanSuccess } = useLoanRequest(poolAddress)
  
  // Repay loan hook
  const { repayLoan, isPending: isRepayPending, isSuccess: isRepaySuccess } = useRepayLoan(poolAddress)
  
  // Check for active loan
  const { data: loanData } = useUserLoanInfo(poolAddress)
  const hasActiveLoan = loanData && loanData.principal > 0n && loanData.status === 'active'
  
  const calculateEarnings = (amount: number, days: number, apr: number) => {
    if (!amount || amount <= 0) return 0
    const totalInterest = (amount * apr / 365 / 100) * days
    return totalInterest * 0.7
  }

  const estimatedEarnings = calculateEarnings(parseFloat(depositAmount) || 0, estimatedDays, pool.apr)
  
  // After approval is confirmed, deposit automatically
  useEffect(() => {
    if (isApproveSuccess && isApprovePending && depositAmount && showDepositModal && !isApprovingToken) {
      console.log('✅ Approval confirmed! Now depositing...')
      setTimeout(() => {
        setIsApprovePending(false)
        // Pass pool asset so deposit can use correct decimals
        console.log('Depositing with asset:', pool.asset, 'amount:', depositAmount)
        deposit(depositAmount)
      }, 1000) // Wait 1 second to ensure approval is finalized
    }
  }, [isApproveSuccess, isApprovePending, isApprovingToken, depositAmount, showDepositModal, deposit])
  
  // Track if we just sent a deposit
  const [justDepositedRef] = useState({ current: false })
  
  // Close modal and show toast after deposit hash is received
  useEffect(() => {
    // Only close if: approve is done, deposit was sent (isPending was true), and now it's false
    // This means the transaction was successfully broadcast
    if (!isApprovePending && !isDepositPending && depositAmount && showDepositModal && justDepositedRef.current) {
      console.log('✅ Deposit sent! Closing modal...')
      setShowDepositModal(false)
      setDepositAmount('')
      setEstimatedDays(30)
      setToast({
        message: `💰 Depósito enviado exitosamente`,
        type: 'success',
      })
      justDepositedRef.current = false
    }
  }, [isApprovePending, isDepositPending, depositAmount, showDepositModal, justDepositedRef])
  
  // Track when deposit is initiated
  useEffect(() => {
    if (isDepositPending) {
      justDepositedRef.current = true
    }
  }, [isDepositPending, justDepositedRef])

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className={`flex ${size === 'large' ? 'gap-6' : 'gap-2'}`}>
        <button
          onClick={() => setShowDepositModal(true)}
          className={size === 'large' 
            ? 'flex-1 px-4 py-4 bg-primary text-white rounded-lg font-semibold text-lg hover:bg-opacity-90 transition'
            : compact
              ? 'px-3 py-2 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-opacity-90 transition whitespace-nowrap'
              : 'flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition'}
        >
          {compact ? 'Depositar' : '💰 Depositar'}
        </button>
        <button
          onClick={() => hasActiveLoan ? setShowRepayModal(true) : setShowBorrowModal(true)}
          className={size === 'large'
            ? `flex-1 px-4 py-4 text-dark rounded-lg font-semibold text-lg hover:bg-opacity-90 transition ${hasActiveLoan ? 'bg-red-500' : 'bg-accent'}`
            : compact
              ? `px-3 py-2 text-dark rounded-lg font-semibold text-sm hover:bg-opacity-90 transition whitespace-nowrap ${hasActiveLoan ? 'bg-red-500' : 'bg-accent'}`
              : `flex-1 px-4 py-2 text-dark rounded-lg font-semibold hover:bg-opacity-90 transition ${hasActiveLoan ? 'bg-red-500' : 'bg-accent'}`}
        >
          {hasActiveLoan 
            ? (compact ? 'Pagar' : '💳 Pagar Préstamo')
            : (compact ? 'Préstamo' : '📋 Solicitar Préstamo')
          }
        </button>
      </div>

      {showDepositModal && (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={() => setShowDepositModal(false)}
      >
        <div 
          className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
          onClick={e => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold text-primary mb-4">Depositar Fondos</h2>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-dark mb-2">Monto ({pool.asset})</label>
            <input
              type="number"
              value={depositAmount}
              onChange={e => setDepositAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-primary mb-3">📊 Calculadora de Ganancias</h4>
            <div className="mb-3">
              <label className="text-sm text-gray-600 mb-2 block">Período (días)</label>
              <input
                type="range"
                min="1"
                max="365"
                value={estimatedDays}
                onChange={e => setEstimatedDays(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
              <p className="text-xs text-gray-600 mt-1">Seleccionado: {estimatedDays} días</p>
            </div>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <span className="text-gray-600">APR Bruto</span>
                  <Tooltip text="Tasa Porcentual Anual total antes de distribución">
                    <span className="inline-flex items-center justify-center w-3 h-3 text-xs font-bold text-white bg-gray-400 rounded-full cursor-help">?</span>
                  </Tooltip>
                </span>
                <span className="font-semibold text-accent">{pool.apr}%</span>
              </p>
              <div className="bg-blue-50 p-2 rounded space-y-1">
                <p className="text-xs text-gray-600">Distribución del APR:</p>
                <p className="text-xs"><span className="text-green-600 font-semibold">{(pool.apr * 0.7).toFixed(2)}%</span> para prestamistas (70%)</p>
                <p className="text-xs"><span className="text-yellow-600 font-semibold">{(pool.apr * 0.2).toFixed(2)}%</span> para RIF (20%)</p>
                <p className="text-xs"><span className="text-purple-600 font-semibold">{(pool.apr * 0.1).toFixed(2)}%</span> para protocolo (10%)</p>
              </div>
              <p><span className="text-gray-600">Interés Estimado (tu parte):</span> <span className="font-semibold text-green-600">${estimatedEarnings.toFixed(2)}</span></p>
              <p><span className="text-gray-600">Interés RIF:</span> <span className="text-xs text-yellow-600">${(estimatedEarnings / 0.7 * 0.2).toFixed(2)}</span></p>
              <p><span className="text-gray-600">Total:</span> <span className="font-semibold">${((parseFloat(depositAmount) || 0) + estimatedEarnings).toFixed(2)}</span></p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowDepositModal(false)
                setDepositAmount('')
                setEstimatedDays(30)
              }}
              className="flex-1 px-4 py-2 bg-gray-200 text-dark rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                console.log('💰 Deposit button clicked:', { poolAddress, depositAmount, isConnected })
                if (!isConnected) {
                  alert('Por favor conecta tu wallet')
                  return
                }
                if (!depositAmount) {
                  alert('Por favor ingresa un monto')
                  return
                }
                if (!tokenAddress) {
                  alert('Token no soportado')
                  return
                }
                
                // First approve with unlimited amount (max uint256)
                console.log('🔓 Requesting approval for unlimited amount...')
                console.log('Pool asset:', pool.asset)
                approveToken(BigInt(2)**BigInt(256) - BigInt(1))
                setIsApprovePending(true)
              }}
              disabled={isDepositPending || isApprovingToken || isApprovePending}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50"
            >
              {isApprovingToken || isApprovePending ? '🔓 Aprobando...' : isDepositPending ? 'Depositando...' : 'Depositar'}
            </button>
          </div>
        </div>
      </div>
      )}

      {showBorrowModal && (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={() => setShowBorrowModal(false)}
      >
        <div 
          className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary">Solicitar Préstamo</h2>
            <button
              onClick={() => setShowBorrowModal(false)}
              disabled={isLoanPending}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50 text-2xl"
            >
              ✕
            </button>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-semibold text-dark mb-2">Monto del Préstamo ({pool.asset})</label>
            <input
              type="number"
              step="0.01"
              value={borrowAmount}
              onChange={e => setBorrowAmount(e.target.value)}
              placeholder="0.00"
              disabled={isLoanPending}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary disabled:bg-gray-100"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-semibold text-dark mb-2">Plazo (Días)</label>
            <input
              type="number"
              min="1"
              max="365"
              value={estimatedDays}
              onChange={e => setEstimatedDays(Math.max(1, parseInt(e.target.value) || 1))}
              disabled={isLoanPending}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary disabled:bg-gray-100"
            />
            <p className="text-xs text-gray-600 mt-1">Entre 1 y 365 días</p>
          </div>
          
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-primary mb-3 text-sm">📊 Detalles del Préstamo</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tasa APR:</span>
                <span className="font-semibold text-accent">{pool.apr}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Interés estimado:</span>
                <span className="font-semibold text-blue-600">
                  {borrowAmount
                    ? ((parseFloat(borrowAmount) * pool.apr * estimatedDays) / 36500).toFixed(4)
                    : '0.0000'}
                  {' '}{pool.asset}
                </span>
              </div>
              <div className="border-t border-blue-200 pt-2 flex justify-between">
                <span className="font-semibold text-gray-700">Total a pagar:</span>
                <span className="font-semibold text-lg text-blue-600">
                  {borrowAmount
                    ? (
                        parseFloat(borrowAmount) +
                        (parseFloat(borrowAmount) * pool.apr * estimatedDays) / 36500
                      ).toFixed(4)
                    : '0.0000'}
                  {' '}{pool.asset}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">ℹ️ El préstamo se aprobará a través del sistema de jury del pool. Los fondos se transferirán una vez aprobado.</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowBorrowModal(false)
                setBorrowAmount('')
                setEstimatedDays(30)
              }}
              disabled={isLoanPending}
              className="flex-1 px-4 py-2 bg-gray-200 text-dark rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={async () => {
                if (!isConnected) {
                  alert('Por favor conecta tu wallet')
                  return
                }
                if (!borrowAmount || parseFloat(borrowAmount) <= 0) {
                  alert('Por favor ingresa un monto válido')
                  return
                }
                await requestLoan(borrowAmount, estimatedDays)
                if (isLoanSuccess) {
                  setShowBorrowModal(false)
                  setBorrowAmount('')
                  setEstimatedDays(30)
                  setToast({
                    message: ` Solicitud de préstamo por ${borrowAmount} ${pool.asset} enviada al jury. Espera la aprobación.`,
                    type: 'success',
                  })
                }
              }}
              disabled={isLoanPending}
              className="flex-1 px-4 py-2 bg-accent text-dark rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoanPending ? 'Solicitando...' : 'Solicitar'}
            </button>
          </div>
        </div>
      </div>
      )}
      
      {showRepayModal && (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={() => setShowRepayModal(false)}
      >
        <div 
          className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary">Pagar Préstamo</h2>
            <button
              onClick={() => setShowRepayModal(false)}
              disabled={isRepayPending}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50 text-2xl"
            >
              ✕
            </button>
          </div>
          
          {loanData && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-primary mb-3 text-sm">📊 Detalles del Préstamo Activo</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Principal:</span>
                  <span className="font-semibold">{loanData.principal.toString()} wei</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Interés Acumulado:</span>
                  <span className="font-semibold text-blue-600">{loanData.accruedInterest.toString()} wei</span>
                </div>
                <div className="border-t border-blue-200 pt-2 flex justify-between">
                  <span className="font-semibold">Total a Pagar:</span>
                  <span className="font-semibold text-lg text-blue-600">
                    {(loanData.principal + loanData.accruedInterest).toString()} wei
                  </span>
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  Vencimiento: {new Date(Number(loanData.dueDate) * 1000).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-semibold text-dark mb-2">Monto a Pagar ({pool.asset})</label>
            <input
              type="number"
              step="0.01"
              value={repayAmount}
              onChange={e => setRepayAmount(e.target.value)}
              placeholder="0.00"
              disabled={isRepayPending}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary disabled:bg-gray-100"
            />
            <p className="text-xs text-gray-600 mt-1">Ingresa el monto total a reembolsar (principal + interés)</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowRepayModal(false)
                setRepayAmount('')
              }}
              disabled={isRepayPending}
              className="flex-1 px-4 py-2 bg-gray-200 text-dark rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={async () => {
                if (!isConnected) {
                  alert('Por favor conecta tu wallet')
                  return
                }
                if (!repayAmount || parseFloat(repayAmount) <= 0) {
                  alert('Por favor ingresa un monto válido')
                  return
                }
                await repayLoan(repayAmount)
                if (isRepaySuccess) {
                  setShowRepayModal(false)
                  setRepayAmount('')
                  setToast({
                    message: ` Préstamo de ${repayAmount} ${pool.asset} pagado exitosamente`,
                    type: 'success',
                  })
                }
              }}
              disabled={isRepayPending}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRepayPending ? 'Pagando...' : 'Pagar'}
            </button>
          </div>
        </div>
      </div>
      )}
    </>
  )
}
