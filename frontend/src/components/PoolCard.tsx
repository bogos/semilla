import { useNavigate } from 'react-router-dom'
import PoolActionButtons from './PoolActionButtons'
import Tooltip from './Tooltip'
import { Address } from 'viem'

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
  address?: Address
}

interface PoolCardProps {
  pool: Pool
  variant?: 'grid' | 'table'
}

export default function PoolCard({ pool, variant = 'grid' }: PoolCardProps) {
  const navigate = useNavigate()
  
  // Use mock address for now - TODO: get real pool address from contract
  const poolAddress = (pool.address || `0x${'0'.repeat(40)}`) as Address

  if (variant === 'table') {
    return (
      <tr onClick={() => navigate(`/pool/${pool.id}`)} className="border-b hover:bg-blue-50 transition cursor-pointer" title="Click para ver detalles del pool">
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
          <div className="flex items-center justify-center gap-2">
            <p className="text-lg font-bold text-accent">{pool.apr}%</p>
            <Tooltip text="Tasa de rendimiento anual actual">
              <svg className="w-4 h-4 text-gray-500 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </Tooltip>
          </div>
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
        <td className="px-6 py-4 text-center" onClick={e => e.stopPropagation()}>
          <PoolActionButtons pool={pool} poolAddress={poolAddress} size="small" compact={true} />
        </td>
      </tr>
    )
  }

  // Grid variant
  return (
    <Tooltip text="Click para ver detalles del pool">
      <div
        onClick={() => navigate(`/pool/${pool.id}`)}
        className="bg-white rounded-lg shadow-md p-6 hover:bg-gray-50 hover:shadow-lg transition-all duration-300 border border-gray-200 cursor-pointer"
      >
      {/* Pool Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-primary mb-2">{pool.name}</h3>
          <div className="flex gap-2 items-center h-7 flex-wrap">
            <span className="px-3 py-1 bg-beige text-dark text-sm font-semibold rounded-full inline-flex items-center gap-2 min-w-20">
              <img src={tokenIcons[pool.asset] || '/assets/usdc_icon.svg'} alt={pool.asset} className="w-5 h-5" />
              {pool.asset}
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full inline-flex items-center justify-center min-w-20">
              ✅ Active
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-2">
            <p className="text-3xl font-bold text-accent">{pool.apr}%</p>
            <Tooltip text="Tasa de rendimiento anual actual">
              <svg className="w-5 h-5 text-gray-500 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </Tooltip>
          </div>
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
      <div onClick={e => e.stopPropagation()}>
        <PoolActionButtons pool={pool} poolAddress={poolAddress} size="small" />
      </div>
      </div>
    </Tooltip>
  )
}
