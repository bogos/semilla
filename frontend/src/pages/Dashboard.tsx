import { useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import ConnectWallet from '../components/ConnectWallet'
import Tooltip from '../components/Tooltip'
import LoanRepayment from '../components/LoanRepayment'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts'
import { CONTRACTS } from '../config/contracts'

interface UserDeposit {
  poolName: string
  asset: string
  amount: number
  interestEarned: number
  apr: number
}

interface UserLoan {
  poolName: string
  asset: string
  amount: number
  interestOwed: number
  status: 'active' | 'repaid' | 'defaulted'
  dueDate: string
}

// Mock data - TODO: Replace with contract calls
const mockDeposits: UserDeposit[] = [
  {
    poolName: 'Microcrédito Lima',
    asset: 'USDC',
    amount: 5000,
    interestEarned: 245,
    apr: 8,
  },
  {
    poolName: 'Crédito Cusco',
    asset: 'USX',
    amount: 2000,
    interestEarned: 65,
    apr: 7,
  },
]

const mockLoans: UserLoan[] = [
  {
    poolName: 'Microcrédito Lima',
    asset: 'USDC',
    amount: 3000,
    interestOwed: 150,
    status: 'active',
    dueDate: '2025-12-26',
  },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { address, isConnected } = useAccount()

  if (!isConnected) {
    return (
      <div className="min-h-screen" style={{background: 'linear-gradient(to bottom right, #A8D5BA, #E8F0D9)'}}>
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <button onClick={() => navigate('/')} className="flex items-center gap-2">
              <img src="/assets/logo.png" alt="Semilla" className="w-8 h-8" />
              <h1 className="text-2xl font-bold text-primary">Semilla</h1>
            </button>
            <ConnectWallet />
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-xl text-gray-600 mb-4">Por favor conecta tu wallet para ver tu dashboard</p>
          <button
            onClick={() => navigate('/pools')}
            className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition"
          >
            Ver Pools
          </button>
        </div>
      </div>
    )
  }

  const totalDeposited = mockDeposits.reduce((sum, d) => sum + d.amount, 0)
  const totalInterestEarned = mockDeposits.reduce((sum, d) => sum + d.interestEarned, 0)
  const totalBorrowed = mockLoans.reduce((sum, l) => sum + l.amount, 0)
  const totalInterestOwed = mockLoans.reduce((sum, l) => sum + l.interestOwed, 0)
  const netBalance = totalDeposited + totalInterestEarned - totalBorrowed - totalInterestOwed

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
              onClick={() => navigate('/pools')}
              className="px-6 py-2 text-primary font-semibold hover:text-opacity-80"
            >
              Ver Pools
            </button>
            <ConnectWallet />
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold text-primary mb-2">
            Bienvenido, {address?.slice(0, 6)}...{address?.slice(-4)}
          </h2>
          <p className="text-gray-600">Aquí está un resumen de tu actividad en Semilla</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-2">Balance Neto</p>
            <p className="text-3xl font-bold text-primary">${netBalance.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-2">Total Depositado</p>
            <p className="text-3xl font-bold text-green-600">${totalDeposited.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-2">Intereses Ganados</p>
            <p className="text-3xl font-bold text-green-600">+${totalInterestEarned.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-2">Total Adeudado</p>
            <p className="text-3xl font-bold text-red-600">${totalBorrowed.toLocaleString()}</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Portfolio Breakdown */}
          {mockDeposits.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-primary mb-4">Composición del Portfolio</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={mockDeposits.map(d => ({
                      name: d.poolName,
                      value: d.amount,
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: $${value}`}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {mockDeposits.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={['#22c55e', '#3b82f6', '#f59e0b'][index % 3]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => `$${value}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          
          {/* Próximos Pagos */}
          {mockLoans.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-primary mb-4">Próximos Pagos</h3>
              <div className="space-y-3">
                {mockLoans
                  .filter(l => l.status === 'active')
                  .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                  .map((loan, idx) => {
                    const daysLeft = Math.max(0, Math.ceil((new Date(loan.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                    const urgency = daysLeft <= 7 ? 'bg-red-50 border-red-200' : daysLeft <= 30 ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'
                    return (
                      <div key={idx} className={`p-3 rounded-lg border ${urgency}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-dark">{loan.poolName}</p>
                            <p className="text-sm text-gray-600">${loan.amount.toLocaleString()} + ${loan.interestOwed} interés</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">{daysLeft} días</p>
                            <p className="text-xs text-gray-600">{new Date(loan.dueDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Deposits & Loans Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Deposits */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-primary mb-6">Tus Depósitos</h3>
            {mockDeposits.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No tienes depósitos yet</p>
            ) : (
              <div className="space-y-3">
                {mockDeposits.map((deposit, idx) => (
                  <div key={idx} className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-green-900">{deposit.poolName}</h4>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-green-700">Bruto</span>
                          <span className="text-sm font-bold text-green-700 bg-white rounded px-2 py-1">{deposit.apr}%</span>
                          <Tooltip text="APR total del pool">
                            <span className="inline-flex items-center justify-center w-3 h-3 text-xs font-bold text-white bg-green-600 rounded-full cursor-help">?</span>
                          </Tooltip>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-green-700">Neto</span>
                          <span className="text-sm font-bold text-green-600 bg-white rounded px-2 py-1">{(deposit.apr * 0.7).toFixed(2)}%</span>
                          <Tooltip text="Tu parte real (70% del APR bruto)">
                            <span className="inline-flex items-center justify-center w-3 h-3 text-xs font-bold text-white bg-green-600 rounded-full cursor-help">?</span>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded p-2">
                        <p className="text-xs text-gray-600">Depositado</p>
                        <p className="font-bold text-green-600">${deposit.amount.toLocaleString()}</p>
                      </div>
                      <div className="bg-white rounded p-2">
                        <p className="text-xs text-gray-600">Interés</p>
                        <p className="font-bold text-green-600">+${deposit.interestEarned.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Loans */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-primary mb-6">Tus Préstamos</h3>
            
            {/* Nota: Los préstamos se mostrarán en cada Pool Detail */}
            <p className="text-sm text-gray-600 text-center py-4">
              Haz click en un pool para ver y reembolsar tus préstamos activos
            </p>
            
            {/* Préstamos Mockeados (solo para referencia) */}
            {mockLoans.length === 0 ? (
              <p className="text-gray-600 text-center py-4">No tienes préstamos activos</p>
            ) : (
              <div className="space-y-3">
                {mockLoans.map((loan, idx) => {
                  const statusColors = {
                    active: 'from-yellow-50 to-yellow-100 border-yellow-200',
                    repaid: 'from-green-50 to-green-100 border-green-200',
                    defaulted: 'from-red-50 to-red-100 border-red-200',
                  }
                  const textColors = {
                    active: 'text-yellow-900',
                    repaid: 'text-green-900',
                    defaulted: 'text-red-900',
                  }
                  return (
                    <div key={idx} className={`bg-gradient-to-r ${statusColors[loan.status]} rounded-lg p-4 border`}>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className={`font-bold ${textColors[loan.status]}`}>{loan.poolName}</h4>
                        <span className={`text-xs font-bold ${textColors[loan.status]} bg-white rounded px-2 py-1`}>
                          {loan.status === 'active' ? '🔄 Activo' : loan.status === 'repaid' ? '✅ Pagado' : '❌ Default'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white rounded p-2">
                          <p className="text-xs text-gray-600">Monto</p>
                          <p className="font-bold text-primary">${loan.amount.toLocaleString()}</p>
                        </div>
                        <div className="bg-white rounded p-2">
                          <p className="text-xs text-gray-600">Interés</p>
                          <p className="font-bold text-red-600">${loan.interestOwed.toLocaleString()}</p>
                        </div>
                        <div className="bg-white rounded p-2">
                          <p className="text-xs text-gray-600">Vence</p>
                          <p className="font-bold text-sm">{new Date(loan.dueDate).toLocaleDateString('es-ES', {month: 'short', day: 'numeric'})}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
