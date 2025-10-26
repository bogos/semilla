import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col min-h-screen" style={{background: 'linear-gradient(to bottom right, #A8D5BA, #E8F0D9)'}}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/assets/logo.png" alt="Semilla" className="w-8 h-8" />
            <h1 className="text-2xl font-bold text-primary">Semilla</h1>
          </div>
          <button
            onClick={() => navigate('/pools')}
            className="px-6 py-2 bg-accent text-dark rounded-lg font-semibold hover:bg-opacity-90 transition"
          >
            Open App
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-20">
          <h2 className="text-6xl font-bold text-primary mb-6">
            Semilla: Microcrédit Descentralizado
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Crea pools, deposita, solicita préstamos sin documentos formales
          </p>
          <button
            onClick={() => navigate('/pools')}
            className="px-8 py-3 bg-primary text-white rounded-lg font-semibold text-lg hover:bg-opacity-90 transition"
          >
            Comenzar
          </button>
        </div>

        {/* Feature Cards - Bentobox Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Lenders */}
          <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition border border-gray-200">
            <div className="text-5xl mb-4">🏦</div>
            <h3 className="text-2xl font-bold text-primary mb-3">Prestamistas</h3>
            <p className="text-gray-600 mb-4">
              Gana 8-12% APY depositando en pools comunitarios y acceso a oportunidades de rendimiento
            </p>
            <button
              onClick={() => navigate('/pools')}
              className="text-accent font-semibold hover:underline"
            >
              Aprender más →
            </button>
          </div>

          {/* Card 2: Borrowers */}
          <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition border border-gray-200">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-2xl font-bold text-primary mb-3">Prestatarios</h3>
            <p className="text-gray-600 mb-4">
              Acceso a crédito verificado con ZK Proofs, sin documentos formales y sin intermediarios
            </p>
            <button
              onClick={() => navigate('/pools')}
              className="text-accent font-semibold hover:underline"
            >
              Aprender más →
            </button>
          </div>

          {/* Card 3: Pool Creators */}
          <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition border border-gray-200">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-primary mb-3">Creadores de Pools</h3>
            <p className="text-gray-600 mb-4">
              Crea tu propia comunidad financiera con parámetros personalizados y gestiona tu pool
            </p>
            <button
              onClick={() => navigate('/pools')}
              className="text-accent font-semibold hover:underline"
            >
              Aprender más →
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-3 gap-8 mb-8">
            <a href="#" className="hover:text-accent transition font-semibold">
              📖 Documentación
            </a>
            <a href="#" className="hover:text-accent transition font-semibold">
              🐙 GitHub
            </a>
            <a href="#" className="hover:text-accent transition font-semibold">
              💬 Contacto
            </a>
          </div>
          <div className="border-t border-opacity-20 border-white pt-8 text-center">
            <p className="text-sm text-opacity-70">
              © 2025 Semilla Protocol. Built on Scroll zkEVM.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
