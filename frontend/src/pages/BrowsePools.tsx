import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
}

// Mock data - TODO: Replace with smart contract calls
const mockPools: Pool[] = [
  {
    id: '1',
    name: 'Microcrédito Lima',
    asset: 'USDC',
    apr: 8,
    rifCoverage: 20,
    liquidity: 50000,
    lenders: 12,
    borrowers: 8,
    active: true,
  },
  {
    id: '2',
    name: 'Crédito Cusco',
    asset: 'USX',
    apr: 7,
    rifCoverage: 15,
    liquidity: 25000,
    lenders: 5,
    borrowers: 3,
    active: true,
  },
  {
    id: '3',
    name: 'Fondo Ayacucho',
    asset: 'ETH',
    apr: 10,
    rifCoverage: 25,
    liquidity: 75000,
    lenders: 20,
    borrowers: 15,
    active: true,
  },
  {
    id: '4',
    name: 'Arequipa Community',
    asset: 'USDC',
    apr: 6,
    rifCoverage: 18,
    liquidity: 15000,
    lenders: 3,
    borrowers: 2,
    active: true,
  },
]

export default function BrowsePools() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    asset: 'all',
    minAPR: 0,
    maxAPR: 20,
  })

  const filteredPools = mockPools.filter(pool => {
    if (filters.asset !== 'all' && pool.asset !== filters.asset) return false
    if (pool.apr < filters.minAPR || pool.apr > filters.maxAPR) return false
    return true
  })

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(to bottom right, #A8D5BA, #E8F0D9)'}}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <img src="/assets/logo.png" alt="Semilla" className="w-8 h-8" />
            <h1 className="text-2xl font-bold text-primary">Semilla</h1>
          </button>
          <div className="flex gap-4">
            <button className="px-6 py-2 text-primary font-semibold hover:text-opacity-80">
              Create Pool
            </button>
            <button className="px-6 py-2 bg-accent text-dark rounded-lg font-semibold hover:bg-opacity-90 transition">
              Connect Wallet
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Expandible */}
        <div className="mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-200 text-dark rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            🔍 {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
          </button>
          
          {showFilters && (
            <div className="bg-white rounded-lg shadow-md p-6 mt-4 grid grid-cols-3 gap-6">
              {/* Asset Filter */}
              <div>
                <label className="block text-sm font-semibold text-dark mb-3">Activo</label>
                <div className="space-y-2">
                  {['all', 'USDC', 'USX', 'ETH'].map(asset => (
                    <label key={asset} className="flex items-center">
                      <input
                        type="radio"
                        name="asset"
                        value={asset}
                        checked={filters.asset === asset}
                        onChange={e => setFilters({ ...filters, asset: e.target.value })}
                        className="mr-2"
                      />
                      <span className="text-gray-600">{asset === 'all' ? 'Todos' : asset}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* APR Range Filter */}
              <div>
                <label className="block text-sm font-semibold text-dark mb-3">APR: {filters.minAPR}-{filters.maxAPR}%</label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={filters.maxAPR}
                  onChange={e => setFilters({ ...filters, maxAPR: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ asset: 'all', minAPR: 0, maxAPR: 20 })}
                  className="w-full px-4 py-2 bg-accent text-dark rounded-lg font-semibold hover:bg-opacity-90 transition"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pools Grid/Table */}
        <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-primary">Pools Disponibles ({filteredPools.length})</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    viewMode === 'grid'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-dark hover:bg-gray-300'
                  }`}
                >
                  📊 Grid
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    viewMode === 'table'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-dark hover:bg-gray-300'
                  }`}
                >
                  📋 Tabla
                </button>
              </div>
            </div>

            {filteredPools.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-600 text-lg">No pools match your filters</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredPools.map(pool => (
                  <div
                    key={pool.id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border border-gray-200"
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

                    {/* Pool Stats - Mini Bentobox */}
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
                      <button className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition">
                        Depositar
                      </button>
                      <button className="flex-1 px-4 py-2 bg-accent text-dark rounded-lg font-semibold hover:bg-opacity-90 transition">
                        Solicitar Préstamo
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-primary text-white">
                    <tr>
                      <th className="px-6 py-3 text-center text-sm font-semibold" style={{width: '60px'}}>ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Pool</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Activo</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold">APR</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold">Liquidez</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold">RIF</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold">Participantes</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPools.map((pool, idx) => (
                      <tr key={pool.id} className="border-b hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-center font-bold text-primary" style={{width: '60px'}}>
                          #{idx + 1}
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
                          <button className="px-3 py-1 bg-primary text-white text-sm font-semibold rounded hover:bg-opacity-90 transition">
                            Depositar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}
