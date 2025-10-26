import { useState } from 'react'
import Tooltip from './Tooltip'

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
  size?: 'small' | 'large'
}

export default function PoolActionButtons({ pool, size = 'small' }: PoolActionButtonsProps) {
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showBorrowModal, setShowBorrowModal] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const [borrowAmount, setBorrowAmount] = useState('')
  const [estimatedDays, setEstimatedDays] = useState(365)

  const calculateEarnings = (amount: number, days: number, apr: number) => {
    if (!amount || amount <= 0) return 0
    const totalInterest = (amount * apr / 365 / 100) * days
    return totalInterest * 0.7
  }

  const estimatedEarnings = calculateEarnings(parseFloat(depositAmount) || 0, estimatedDays, pool.apr)

  return (
    <>
      <div className={`flex ${size === 'large' ? 'gap-6' : 'gap-3'}`}>
        <button
          onClick={() => setShowDepositModal(true)}
          className={size === 'large' 
            ? 'flex-1 px-4 py-4 bg-primary text-white rounded-lg font-semibold text-lg hover:bg-opacity-90 transition'
            : 'flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition'}
        >
          💰 Depositar
        </button>
        <button
          onClick={() => setShowBorrowModal(true)}
          className={size === 'large'
            ? 'flex-1 px-4 py-4 bg-accent text-dark rounded-lg font-semibold text-lg hover:bg-opacity-90 transition'
            : 'flex-1 px-4 py-2 bg-accent text-dark rounded-lg font-semibold hover:bg-opacity-90 transition'}
        >
          📋 Solicitar Préstamo
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
                setEstimatedDays(365)
              }}
              className="flex-1 px-4 py-2 bg-gray-200 text-dark rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                setShowDepositModal(false)
                setDepositAmount('')
                setEstimatedDays(365)
              }}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition"
            >
              Depositar
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
          <h2 className="text-2xl font-bold text-primary mb-4">Solicitar Préstamo</h2>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-dark mb-2">Monto del Préstamo ({pool.asset})</label>
            <input
              type="number"
              value={borrowAmount}
              onChange={e => setBorrowAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
          <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">⚠️ Requiere verificación de identidad mediante ZK Proof</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowBorrowModal(false)
                setBorrowAmount('')
              }}
              className="flex-1 px-4 py-2 bg-gray-200 text-dark rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                setShowBorrowModal(false)
                setBorrowAmount('')
              }}
              className="flex-1 px-4 py-2 bg-accent text-dark rounded-lg font-semibold hover:bg-opacity-90 transition"
            >
              Solicitar
            </button>
          </div>
        </div>
      </div>
      )}
    </>
  )
}
