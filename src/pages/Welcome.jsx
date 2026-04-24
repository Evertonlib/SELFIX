import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { useCart } from '../context/CartContext'

export default function Welcome() {
  const navigate = useNavigate()
  const { config } = useStore()
  const { clearCart } = useCart()

  useEffect(() => {
    clearCart()
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-8 p-8 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 40%, ${config.primaryColor} 0%, transparent 70%)`,
        }}
      />

      <div className="relative flex flex-col items-center gap-8 w-full max-w-sm">
        {config.logoUrl ? (
          <img
            src={config.logoUrl}
            alt={config.name}
            className="h-36 w-36 object-contain rounded-3xl shadow-2xl"
          />
        ) : (
          <div
            className="h-36 w-36 rounded-3xl flex items-center justify-center text-white text-6xl font-black shadow-2xl"
            style={{ backgroundColor: config.primaryColor }}
          >
            {config.name.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="text-center">
          <h1 className="text-white text-5xl font-black tracking-tight leading-tight">
            {config.name}
          </h1>
          <p className="text-gray-400 text-xl mt-3">
            Peça aqui · Retire no balcão
          </p>
        </div>

        <button
          onClick={() => navigate('/menu')}
          className="w-full text-white text-2xl font-bold rounded-2xl shadow-lg active:opacity-80 active:scale-95 transition-all mt-4"
          style={{
            backgroundColor: config.primaryColor,
            minHeight: '80px',
            boxShadow: `0 0 40px ${config.primaryColor}55`,
          }}
        >
          Toque para começar
        </button>

        <p className="text-gray-700 text-base animate-pulse mt-2">
          ☝ Toque na tela para fazer seu pedido
        </p>
      </div>

      <a
        href="/admin"
        className="absolute bottom-5 right-5 text-gray-800 text-xs px-3 py-2 rounded-lg"
        aria-label="Painel admin"
      >
        ⚙
      </a>
    </div>
  )
}
