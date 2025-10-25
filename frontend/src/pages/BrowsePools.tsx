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
  const [filters, setFilters] = useState({
    asset: 'all',
    minAPR: 2,
    maxAPR: 20,
  })
  
  // Fetch real pools from contract
  const { data: activePoolAddresses, isLoading, refetch } = useActivePools()
  
  // Combine real pools with mock data
  const pools = useMemo<Pool[]>(() => {
    if (!activePoolAddresses || activePoolAddresses.length === 0) {
      return [...mockPools]
    }
    
    // Map real pool addresses to Pool interface
    const realPools = activePoolAddresses.map((address: Address, index: number) => ({
      id: String(index + 3), // Continue from mock pool IDs (1, 2)
      address,
      name: `Pool #${index + 3}`, // Will be updated with real metadata
      asset: index % 2 === 0 ? 'USDC' : 'USX',
      apr: 5 + (index * 2),
      rifCoverage: 15 + (index * 5),
      liquidity: 10000 + (index * 5000),
      lenders: 3 + index,
      borrowers: 1 + index,
      active: true,
    }))
    
    console.log('🔄 Mapped real pools:', realPools)
    // Combine real pools with mock data
    return [...realPools, ...mockPools]
  }, [activePoolAddresses])
  
  const handleRefresh = () => {
    refetch()
  }

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
        {/* Pools Header */}
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-primary">Pools Disponibles ({filteredPools.length})</h2>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-gray-200 text-dark rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              🔄 Refrescar
            </button>
            <button
              onClick={() => navigate('/create-pool')}
              className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition shadow-md"
            >
              ➕ Crear Tu Pool
            </button>
          </div>
        </div>

        {/* Filters and View Mode */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4 flex items-center gap-4 flex-wrap">
          {/* Asset Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-dark">Activo:</label>
            <select
              value={filters.asset}
              onChange={e => setFilters({ ...filters, asset: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="all">Todos</option>
              <option value="USDC">USDC</option>
              <option value="USX">USX</option>
              <option value="ETH">ETH</option>
            </select>
          </div>

          {/* APR Range Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-sm font-semibold text-dark whitespace-nowrap ml-2 w-24">APR: {filters.minAPR}-{filters.maxAPR}%</label>
            <input
              type="range"
              min="2"
              max="20"
              value={filters.maxAPR}
              onChange={e => setFilters({ ...filters, maxAPR: parseInt(e.target.value) })}
              className="w-32 accent-primary"
            />
          </div>

          <div className="flex gap-2 ml-auto items-center">
            {!(filters.asset === 'all' && filters.maxAPR === 20) && (
              <button
                onClick={() => setFilters({ asset: 'all', minAPR: 2, maxAPR: 20 })}
                className="h-10 w-24 bg-accent text-dark rounded-lg font-semibold text-sm hover:bg-opacity-90 transition flex items-center justify-center"
              >
                Limpiar
              </button>
            )}
            <button
              onClick={() => setViewMode('grid')}
              className={`h-10 w-24 rounded-lg font-semibold transition flex items-center justify-center ${
                viewMode === 'grid'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-dark hover:bg-gray-300'
              }`}
            >
              📊 Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`h-10 w-24 rounded-lg font-semibold transition flex items-center justify-center ${
                viewMode === 'table'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-dark hover:bg-gray-300'
              }`}
            >
              📋 Tabla
            </button>
          </div>
        </div>

        {/* Pools Grid/Table */}
        <div>

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
