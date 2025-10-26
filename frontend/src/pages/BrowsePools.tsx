import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import PoolCard from '../components/PoolCard'
import PoolSkeleton from '../components/PoolSkeleton'
import ConnectWallet from '../components/ConnectWallet'
import { useActivePools } from '../hooks/usePoolData'
import { Address } from 'viem'

interface Pool {
  id: string
  address: Address
  name: string
  asset: string
  apr: number
  rifCoverage: number
  liquidity: number
  lenders: number
  borrowers: number
  active: boolean
}

// Fallback mock data for when contracts are not available
const mockPools: Pool[] = [
  {
    id: '1',
    address: '0x5FbDB2315678afecb367f032d93F642f64180aa3' as Address,
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
    address: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' as Address,
    name: 'Crédito Cusco',
    asset: 'USX',
    apr: 7,
    rifCoverage: 15,
    liquidity: 25000,
    lenders: 5,
    borrowers: 3,
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
  
  // Fetch real pools from contract
  const { data: activePoolAddresses, isLoading } = useActivePools()
  
  // Use contract data if available, fallback to mock
  const pools = useMemo<Pool[]>(() => {
    const poolAddresses = activePoolAddresses as Address[] | undefined
    if (!poolAddresses || poolAddresses.length === 0) {
      return mockPools
    }
    // TODO: Map contract data to Pool interface
    // For now, use mock data
    return mockPools
  }, [activePoolAddresses])

  const filteredPools = pools.filter(pool => {
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
            <button
              onClick={() => navigate('/create-pool')}
              className="px-6 py-2 text-primary font-semibold hover:text-opacity-80"
            >
              Create Pool
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 text-primary font-semibold hover:text-opacity-80"
            >
              Dashboard
            </button>
            <ConnectWallet />
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

            {isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <PoolSkeleton key={i} />
                ))}
              </div>
            ) : filteredPools.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-600 text-lg">No pools match your filters</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredPools.map(pool => (
                  <PoolCard key={pool.id} pool={pool} variant="grid" />
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
                    {filteredPools.map((pool) => (
                      <PoolCard key={pool.id} pool={pool} variant="table" />
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
