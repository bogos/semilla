import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { Address } from 'viem'
import ConnectWallet from '../components/ConnectWallet'
import Tooltip from '../components/Tooltip'
import { useCreatePool } from '../hooks/usePoolWrite'
import { Toast, ToastType } from '../components/Toast'
import { TOKENS } from '../config/contracts'

export default function CreatePool() {
  const navigate = useNavigate()
  const { isConnected } = useAccount()
  const [formData, setFormData] = useState({
    name: '',
    asset: 'USDC',
    apr: 8,
    rifCoverage: 20,
    description: '',
    imageUrl: '',
  })
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const { createPool, isPending: isCreating, isSuccess, hash } = useCreatePool()

  // Show toast when pool is created successfully
  useEffect(() => {
    if (isSuccess && hash) {
      setToast({
        message: `Pool creado exitosamente! Hash: ${hash.slice(0, 10)}...`,
        type: 'success',
      })
      // Reset form after 2 seconds
      const timer = setTimeout(() => {
        setFormData({
          name: '',
          asset: 'USDC',
          apr: 8,
          rifCoverage: 20,
          description: '',
          imageUrl: '',
        })
        navigate('/pools')
      }, 2000)
      return () => clearTimeout(timer)
    }
    return
  }, [isSuccess, hash, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected) {
      setToast({ message: 'Por favor conecta tu wallet', type: 'warning' })
      return
    }
    
    try {
      // Convertir asset a address y determinar si es ERC20
      let assetAddress: Address = '0x0000000000000000000000000000000000000000'
      let isERC20 = false
      
      if (formData.asset === 'USDC') {
        assetAddress = TOKENS.USDC
        isERC20 = true
      } else if (formData.asset === 'USX') {
        assetAddress = TOKENS.USX
        isERC20 = true
      } else if (formData.asset === 'ETH') {
        assetAddress = TOKENS.ETH
        isERC20 = false
      }
      
      console.log('🚀 Creating Pool with params:', {
        name: formData.name,
        asset: assetAddress,
        apr: formData.apr,
        rifCoverageBp: formData.rifCoverage * 100,
        isERC20,
      })
      createPool(
        formData.name,
        assetAddress,
        formData.apr,
        formData.rifCoverage * 100, // Convertir a basis points (20% = 2000)
        isERC20
      )
      
    } catch (error) {
      console.error('Error creando pool:', error)
      setToast({ message: 'Error al crear el pool', type: 'error' })
    }
  }

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
          <p className="text-xl text-gray-600 mb-4">Por favor conecta tu wallet para crear un pool</p>
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

  // Este 'i' que creaste (según instrucción) lo agregamos debajo de "¿Qué es un pool?"
  // Voy a agregar un mensaje informativo simple, por ejemplo una frase con estilo, debajo del h3 correspondiente.

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(to bottom right, #A8D5BA, #E8F0D9)'}}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
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

      {/* Create Pool Form */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-primary mb-2">Crear un Nuevo Pool</h1>
        <p className="text-gray-600 mb-8">Define los parámetros de tu pool de microcréditos</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Pool Name */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Nombre del Pool *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="ej: Microcrédito Lima"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                  <p className="text-xs text-gray-600 mt-1">Nombre descriptivo para tu pool</p>
                </div>

                {/* Pool Description */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Descripción del Pool
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe el propósito de tu pool, a quién va dirigido, etc."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary h-24 resize-none"
                  />
                  <p className="text-xs text-gray-600 mt-1">Opcional - máximo 500 caracteres</p>
                </div>

                {/* Pool Image URL */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Imagen del Pool (URL)
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl || ''}
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/pool-image.jpg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                  <p className="text-xs text-gray-600 mt-1">Opcional - URL de una imagen representativa</p>
                </div>

                {/* Asset Selection */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Activo (Token) *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'USDC', label: 'USDC', icon: '/assets/usdc_icon.svg' },
                      { value: 'USX', label: 'USX', icon: '/assets/usx_icon.jpg' },
                      { value: 'ETH', label: 'ETH', icon: '/assets/eth_icon.svg' },
                    ].map(token => (
                      <button
                        key={token.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, asset: token.value })}
                        className={`p-4 rounded-lg border-2 transition flex flex-col items-center gap-2 ${
                          formData.asset === token.value
                            ? 'border-primary bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <img src={token.icon} alt={token.label} className="w-8 h-8" />
                        <span className="text-sm font-semibold text-dark">{token.label}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">Token que se usará en este pool</p>
                </div>

            {/* APR */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-semibold text-dark">
                  APR (Tasa Porcentual Anual)
                </label>
                <Tooltip text="Tasa anual de rendimiento. Se distribuirá: 70% lenders, 20% RIF, 10% protocolo">
                  <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-gray-400 rounded-full cursor-help">?</span>
                </Tooltip>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={formData.apr}
                  onChange={e => setFormData({ ...formData, apr: parseInt(e.target.value) })}
                  className="flex-1 accent-primary"
                />
                <div className="text-center min-w-16">
                  <p className="text-2xl font-bold text-accent">{formData.apr}%</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-1">Selecciona entre 1% y 50%</p>
            </div>

            {/* RIF Coverage */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-semibold text-dark">
                  Cobertura RIF (%)
                </label>
                <Tooltip text="Porcentaje del pool reservado como fondo de seguro para cubrir defaults">
                  <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-gray-400 rounded-full cursor-help">?</span>
                </Tooltip>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={formData.rifCoverage}
                  onChange={e => setFormData({ ...formData, rifCoverage: parseInt(e.target.value) })}
                  className="flex-1 accent-primary"
                />
                <div className="text-center min-w-16">
                  <p className="text-2xl font-bold text-primary">{formData.rifCoverage}%</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-1">Fondo de seguro: 5% - 50%</p>
            </div>

            {/* Summary */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-bold text-primary mb-4">📊 Resumen de Distribución</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">APR Bruto</span>
                  <span className="font-bold text-primary">{formData.apr}%</span>
                </div>
                <div className="pt-3 border-t border-blue-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-green-600">Prestamistas (70%)</span>
                    <span className="font-bold text-green-600">{(formData.apr * 0.7).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-yellow-600">RIF (20%)</span>
                    <span className="font-bold text-yellow-600">{(formData.apr * 0.2).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-purple-600">Protocolo (10%)</span>
                    <span className="font-bold text-purple-600">{(formData.apr * 0.1).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </div>
            {hash && (
            <div className="rounded-lg bg-blue-100 border border-blue-300 px-4 py-3 flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-700 truncate flex-1">
                      <b>Transacción enviada:</b> {hash}
                    </span>
                    <button
                      type="button"
                      className="p-1 bg-blue-200 hover:bg-blue-300 rounded transition text-blue-700 text-xs font-semibold"
                      onClick={() => {
                        navigator.clipboard.writeText(hash || '')
                        setCopied(true)
                        setTimeout(() => setCopied(false), 2000)
                      }}
                      title="Copiar hash de transacción"
                      disabled={copied}
                    >
                      📋 {copied ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                </div>
                )}
                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate('/pools')}
                    className="flex-1 px-4 py-3 bg-gray-200 text-dark rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || !formData.name}
                    className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50"
                  >
                    {isCreating ? 'Creando Pool...' : 'Crear Pool'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Info Box */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="font-bold text-primary mb-4 text-lg">ℹ️ ¿Qué es un Pool?</h3>
              {/* Mensaje "i" agregado abajo según instrucción */}
              <p className="text-gray-600 mb-4 text-sm">
                Un pool es el núcleo de tu comunidad financiera descentralizada donde los prestamistas depositan fondos para ganar intereses, 
                y los prestatarios solicitan créditos verificados.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Tú eres el gestor del pool</li>
                <li>✓ Define el APR y parámetros de riesgo</li>
                <li>✓ Recibe comisión por cada transacción</li>
                <li>✓ Tu reputación crece con el tiempo</li>
              </ul>
            </div>

            {/* Transaction Info */}
            {hash && (
              <div className="bg-white rounded-lg shadow-md p-6 mt-4 sticky top-24">
                <h3 className="font-bold text-primary mb-4 text-lg">ℹ️ ¿Dónde está el address del nuevo pool?</h3>
                <p className="text-gray-600 text-sm">Una vez confirmada la transacción, el contrato emite un evento con el address del nuevo pool creado.</p>
                <p className="text-gray-600 text-sm mt-2">(Para ver el address del pool, consulta el receipt del evento en block explorer)</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
