import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Tooltip from '../components/Tooltip'
import PoolActionButtons from '../components/PoolActionButtons'
import LoanRepayment from '../components/LoanRepayment'
import ConnectWallet from '../components/ConnectWallet'

// Token icons mapping
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
  owner: string
  description: string
  address: string
}

// Mock pool data - TODO: Replace with smart contract calls
const mockPoolsDetail: { [key: string]: Pool } = {
  '1': {
    id: '1',
    name: 'Microcrédito Lima',
    asset: 'USDC',
    apr: 8,
    rifCoverage: 20,
    liquidity: 50000,
    lenders: 12,
    borrowers: 8,
    active: true,
    owner: '0x123...abc',
    description: 'Community lending pool for small businesses in Lima',
    address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  },
  '2': {
    id: '2',
    name: 'Crédito Cusco',
    asset: 'USX',
    apr: 7,
    rifCoverage: 15,
    liquidity: 25000,
    lenders: 5,
    borrowers: 3,
    active: true,
    owner: '0x456...def',
    description: 'Agricultural financing pool in Cusco region',
    address: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  },
  '3': {
    id: '3',
    name: 'Fondo Ayacucho',
    asset: 'ETH',
    apr: 10,
    rifCoverage: 25,
    liquidity: 75000,
    lenders: 20,
    borrowers: 15,
    active: true,
    owner: '0x789...ghi',
    description: 'Multi-purpose community fund',
    address: '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720',
  },
  '4': {
    id: '4',
    name: 'Arequipa Community',
    asset: 'USDC',
    apr: 6,
    rifCoverage: 18,
    liquidity: 15000,
    lenders: 3,
    borrowers: 2,
    active: true,
    owner: '0xabc...jkl',
    description: 'Local community lending initiative',
    address: '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
  },
}

export default function PoolDetail() {
  const navigate = useNavigate()
  const { poolId } = useParams()
  const [copiedAddress, setCopiedAddress] = useState(false)

  const pool = poolId ? mockPoolsDetail[poolId] : null

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(pool?.address || '')
    setCopiedAddress(true)
    setTimeout(() => setCopiedAddress(false), 2000)
  }

  if (!pool) {
    return (
      <div className="min-h-screen" style={{background: 'linear-gradient(to bottom right, #A8D5BA, #E8F0D9)'}}>
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button onClick={() => navigate('/pools')} className="text-primary font-semibold hover:text-opacity-80">
              ← Back to Pools
            </button>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-xl text-gray-600">Pool no encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(to bottom right, #A8D5BA, #E8F0D9)'}}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <button onClick={() => navigate('/pools')} className="text-primary font-semibold hover:text-opacity-80">
            ← Back to Pools
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 text-primary font-semibold hover:text-opacity-80"
          >
            Dashboard
          </button>
          <ConnectWallet />
        </div>
      </header>

      {/* Pool Detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <img src={tokenIcons[pool.asset] || '/assets/usdc_icon.svg'} alt={pool.asset} className="w-12 h-12" />
                <div>
                  <h1 className="text-4xl font-bold text-primary">{pool.name}</h1>
                  <p className="text-gray-600 mt-2">{pool.description}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-baseline justify-end gap-1">
                <p className="text-5xl font-bold text-accent">{pool.apr}</p>
                <p className="text-lg text-accent font-semibold">%</p>
              </div>
              <div className="flex items-center justify-end gap-2 mt-1">
                <p className="text-sm text-gray-600">APR</p>
              <Tooltip text="APR: 70% para prestamistas, 20% para RIF, 10% para protocolo">
                <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-gray-400 rounded-full cursor-help">?</span>
              </Tooltip>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 pt-6 border-t border-gray-200">
            <div>
              <div className="flex items-center gap-1 mb-2">
                <p className="text-sm text-gray-600">APR Bruto</p>
                <Tooltip text="Tasa bruta antes de distribución (70% lenders, 20% RIF, 10% protocolo)">
                  <span className="inline-flex items-center justify-center w-3 h-3 text-xs font-bold text-white bg-gray-400 rounded-full cursor-help">?</span>
                </Tooltip>
              </div>
              <p className="text-2xl font-bold text-accent">{pool.apr}%</p>
            </div>
            <div>
              <div className="flex items-center gap-1 mb-2">
                <p className="text-sm text-gray-600">APR Neto</p>
                <Tooltip text="Tu tasa real como prestamista (70% del APR bruto)">
                  <span className="inline-flex items-center justify-center w-3 h-3 text-xs font-bold text-white bg-gray-400 rounded-full cursor-help">?</span>
                </Tooltip>
              </div>
              <p className="text-2xl font-bold text-green-600">{(pool.apr * 0.7).toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Liquidez Total</p>
              <p className="text-2xl font-bold text-primary">${pool.liquidity.toLocaleString()}</p>
            </div>
            <div>
              <div className="flex items-center gap-1 mb-2">
                <p className="text-sm text-gray-600">Activo</p>
              </div>
              <div className="flex items-center gap-2">
                <img src={tokenIcons[pool.asset] || '/assets/usdc_icon.svg'} alt={pool.asset} className="w-6 h-6" />
                <p className="text-2xl font-bold text-primary">{pool.asset}</p>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1 mb-2">
                <p className="text-sm text-gray-600">Cobertura RIF</p>
              <Tooltip text="Fondo de seguro que cubre pérdidas por defaults (20% del APR)">
                  <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-gray-400 rounded-full cursor-help">?</span>
                </Tooltip>
              </div>
              <p className="text-2xl font-bold text-primary">{pool.rifCoverage}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Prestamistas</p>
              <p className="text-2xl font-bold text-primary">{pool.lenders}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Prestatarios</p>
              <p className="text-2xl font-bold text-primary">{pool.borrowers}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Dirección</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-xs text-primary truncate flex-1" title={pool.address}>{pool.address}</p>
                <button
                  onClick={handleCopyAddress}
                  className="p-1 hover:bg-gray-100 rounded transition"
                  title="Copiar dirección"
                >
                  <span className="text-sm">{copiedAddress ? '✓' : '📋'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6">
          <PoolActionButtons pool={pool} poolAddress={pool.address as any} size="large" />
        </div>

        {/* Pool Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-primary mb-4">Detalles del Pool</h3>
            <div className="space-y-3">
              <p><span className="text-gray-600">Estado:</span> <span className="font-semibold text-green-600">Activo</span></p>
              <p className="flex items-center gap-2">
                <span className="text-gray-600">Activo:</span>
                <img src={tokenIcons[pool.asset] || '/assets/usdc_icon.svg'} alt={pool.asset} className="w-5 h-5" />
                <span className="font-semibold">{pool.asset}</span>
              </p>
              <p><span className="text-gray-600">Propietario:</span> <span className="font-mono text-sm">{pool.owner}</span></p>
              <p><span className="text-gray-600">Dirección Pool:</span> <span className="font-mono text-xs break-all">{pool.address}</span></p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-primary mb-4">Utilización y Riesgo</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Prestado</p>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-accent h-3 rounded-full" style={{width: '45%'}}></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">45% de la liquidez ($33,750)</p>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-3">Nivel de Riesgo</p>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-600">Riesgo de Default</span>
                      <span className="text-xs font-semibold text-yellow-600">Medio (15%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{width: '15%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-600">Cobertura RIF</span>
                      <span className="text-xs font-semibold text-green-600">Buena (25%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '25%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-600">Liquidez Disponible</span>
                      <span className="text-xs font-semibold text-blue-600">Excelente (55%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '55%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-primary mb-4">Tu Participación</h3>
            
            {/* Componente de Reembolso */}
            <LoanRepayment poolAddress={pool.address as any} poolName={pool.name} />
            
            {/* Info adicional */}
            <div className="space-y-3 mt-4">
              <p><span className="text-gray-600">Tus Depósitos:</span> <span className="font-semibold">$0.00</span></p>
              <p><span className="text-gray-600">Intereses Ganados:</span> <span className="font-semibold text-green-600">$0.00</span></p>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-lg shadow-md p-6 md:col-span-3">
            <h3 className="text-lg font-bold text-primary mb-4">Historial de Transacciones</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {/* Deposit */}
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200 hover:shadow-md transition">
                <div className="flex-shrink-0 w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                  <span className="text-lg">💰</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800"><span className="font-mono">0x123...abc</span> depositó</p>
                  <p className="text-xs text-gray-600">hace 2 horas</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">+1,000 USDC</p>
                </div>
              </div>
              
              {/* Loan Request */}
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200 hover:shadow-md transition">
                <div className="flex-shrink-0 w-10 h-10 bg-red-200 rounded-full flex items-center justify-center">
                  <span className="text-lg">📋</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800"><span className="font-mono">0x456...def</span> solicitó préstamo</p>
                  <p className="text-xs text-gray-600">hace 5 horas</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">-500 USDC</p>
                </div>
              </div>
              
              {/* Repayment */}
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200 hover:shadow-md transition">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                  <span className="text-lg">✅</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800"><span className="font-mono">0x789...ghi</span> repagó</p>
                  <p className="text-xs text-gray-600">hace 1 día</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">+512 USDC</p>
                </div>
              </div>
              
              {/* Deposit */}
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200 hover:shadow-md transition">
                <div className="flex-shrink-0 w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                  <span className="text-lg">💰</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800"><span className="font-mono">0xabc...jkl</span> depositó</p>
                  <p className="text-xs text-gray-600">hace 2 días</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">+2,500 USDC</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
