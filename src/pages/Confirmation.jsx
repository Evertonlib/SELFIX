import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { useCart } from '../context/CartContext'

export default function Confirmation() {
  const navigate = useNavigate()
  const { config, tableNumber } = useStore()
  const { orderNumber, customerName, clearCart } = useCart()
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    if (!orderNumber) {
      navigate('/')
      return
    }

    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(interval)
          clearCart()
          navigate(tableNumber ? '/menu' : '/')
          return 0
        }
        return c - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [orderNumber])

  if (!orderNumber) return null

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8 text-center">
      <div
        className="w-28 h-28 rounded-full flex items-center justify-center text-white text-5xl mb-8 shadow-2xl"
        style={{
          backgroundColor: config.primaryColor,
          boxShadow: `0 0 60px ${config.primaryColor}66`,
        }}
      >
        ✓
      </div>

      <h1 className="text-white text-4xl font-black mb-2">
        Pedido Confirmado!
      </h1>

      {customerName && (
        <p className="text-gray-400 text-2xl mb-6">
          Obrigado, <span className="text-white font-semibold">{customerName}</span>!
        </p>
      )}

      <div className="bg-gray-900 rounded-3xl p-8 mb-8 w-full max-w-xs border border-gray-800">
        <p className="text-gray-500 text-base mb-2 uppercase tracking-widest text-sm font-medium">
          Número do Pedido
        </p>
        <p
          className="text-8xl font-black tabular-nums"
          style={{ color: config.primaryColor }}
        >
          #{orderNumber}
        </p>
      </div>

      <p className="text-gray-300 text-xl font-medium mb-2">
        {tableNumber
          ? `Pedido enviado para a cozinha! ✅ Mesa ${tableNumber} — Pedido #${orderNumber}`
          : 'Aguarde ser chamado no balcão'}
      </p>

      <p className="text-gray-600 text-base">
        Voltando à tela inicial em {countdown}s…
      </p>

      <button
        onClick={() => { clearCart(); navigate(tableNumber ? '/menu' : '/') }}
        className="mt-8 text-gray-600 text-base border border-gray-800 rounded-xl px-6 py-3 active:opacity-70"
      >
        Novo pedido
      </button>
    </div>
  )
}
