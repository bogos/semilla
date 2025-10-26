import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Tooltip from './Tooltip'

const tokenIcons: { [key: string]: string } = {
  USDC: '/assets/usdc_icon.svg',
  USX: '/assets/usx_icon.jpg',
  ETH: '/assets/eth_icon.svg',
}

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

interface PoolCardProps {
  pool: Pool
  variant?: 'grid' | 'table'
}

export default function PoolCard({ pool, variant = 'grid' }: PoolCardProps) {
  const navigate = useNavigate()
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

  const handleDepositClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDepositModal(true)
  }

  const handleBorrowClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowBorrowModal(true)
  }

  const DepositModal = () => (
    showDepositModal && (
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
              onClick={() => setShowDepositModal(false)}
              className="flex-1 px-4 py-2 bg-gray-200 text-dark rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                setShowDepositModal(false)
                setDepositAmount('')
              }}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition"
            >
              Depositar
            </button>
          </div>
        </div>
      </div>
    )
  )

  const BorrowModal = () => (
    showBorrowModal && (
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
              onClick={() => setShowBorrowModal(false)}
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
    )
  )

  if (variant === 'table') {
    return (
      <>
        <tr onClick={() => navigate(`/pool/${pool.id}`)} className="border-b hover:bg-gray-50 transition cursor-pointer">
          <td className="px-6 py-4 text-center font-bold text-primary" style={{width: '60px'}}>
            #{pool.id}
          </td>
          <td className="px-6 py-4">
            <p className="font-bold text-dark">{pool.name}</p>
          </td>
          <td className="px-6 py-4">
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
              ✅ Active
            </span>
          </td>
          <td className="px-6 py-4 text-center">
            <p className="text-lg font-bold text-accent">{pool.apr}%</p>
          </td>
          <td className="px-6 py-4 text-right">
            <p className="font-semibold text-primary">${pool.liquidity.toLocaleString()}</p>
            <p className="text-xs text-gray-600 mt-1 flex items-center justify-end gap-1">
              <img src={tokenIcons[pool.asset] || '/assets/usdc_icon.svg'} alt={pool.asset} className="w-6 h-6" />
              {pool.asset}
            </p>
          </td>
          <td className="px-6 py-4 text-center">
            <p className="font-semibold text-primary">{pool.rifCoverage}%</p>
          </td>
          <td className="px-6 py-4 text-center">
            <p className="text-sm"><span className="font-bold">{pool.lenders}</span> / {pool.borrowers}</p>
            <p className="text-xs text-gray-600">Prestamistas / Prestatarios</p>
          </td>
          <td className="px-6 py-4 text-center">
            <div className="flex gap-2 justify-center">
              <button 
                onClick={handleDepositClick}
                className="px-3 py-1 bg-primary text-white text-sm font-semibold rounded hover:bg-opacity-90 transition"
              >
                Depositar
              </button>
              <button 
                onClick={handleBorrowClick}
                className="px-3 py-1 bg-accent text-dark text-sm font-semibold rounded hover:bg-opacity-90 transition"
              >
                Solicitar
              </button>
            </div>
          </td>
        </tr>
        <DepositModal />
        <BorrowModal />
      </>
    )
  }

  // Grid variant
  return (
    <>
      <div
        onClick={() => navigate(`/pool/${pool.id}`)}
        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border border-gray-200 cursor-pointer"
      >
        {/* Pool Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-primary">{pool.name}</h3>
            <div className="flex gap-2 mt-2">
              <span className="px-3 py-1 bg-beige text-dark text-sm font-semibold rounded-full flex items-center gap-2">
                <img src={tokenIcons[pool.asset] || '/assets/usdc_icon.svg'} alt={pool.asset} className="w-8 h-8" />
                {pool.asset}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                ✅ Active
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-accent">{pool.apr}%</p>
            <p className="text-sm text-gray-600">APR</p>
          </div>
        </div>

        {/* Pool Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200">
          <div>
            <p className="text-sm text-gray-600">Liquidez</p>
            <p className="text-lg font-bold text-primary">${pool.liquidity.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">RIF Coverage</p>
            <p className="text-lg font-bold text-primary">{pool.rifCoverage}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Prestamistas</p>
            <p className="text-lg font-bold text-primary">{pool.lenders}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Prestatarios</p>
            <p className="text-lg font-bold text-primary">{pool.borrowers}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button 
            onClick={handleDepositClick}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition"
          >
            💰 Depositar
          </button>
          <button 
            onClick={handleBorrowClick}
            className="flex-1 px-4 py-2 bg-accent text-dark rounded-lg font-semibold hover:bg-opacity-90 transition"
          >
            📋 Solicitar Préstamo
          </button>
        </div>
      </div>
      <DepositModal />
      <BorrowModal />
    </>
  )
}
