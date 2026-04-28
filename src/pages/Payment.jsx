import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const fmt = (v) => `R$ ${v.toFixed(2).replace('.', ',')}`

export default function Payment() {
  const navigate = useNavigate()
  const { items, total, generateOrder } = useCart()

  useEffect(() => {
    if (items.length === 0) navigate('/')
  }, [])

  if (items.length === 0) return null

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <header className="bg-gray-900 px-5 py-4 flex items-center gap-4 border-b border-gray-800">
        <button
          onClick={() => navigate('/menu')}
          className="text-gray-400 text-4xl leading-none w-10 h-10 flex items-center justify-center active:opacity-60"
        >
          ‹
        </button>
        <h1 className="text-white text-2xl font-bold">Pagamento</h1>
      </header>

      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        <div className="flex flex-col gap-6 mt-4">
          <div className="bg-gray-900 rounded-2xl px-5 py-4 flex justify-between items-center">
            <span className="text-gray-400 text-lg">Total do pedido</span>
            <span className="text-white text-2xl font-bold">{fmt(total)}</span>
          </div>

          <p className="text-gray-300 text-xl text-center font-medium mt-2">
            Como deseja pagar?
          </p>

          <div className="flex flex-col gap-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => { generateOrder('Debito'); navigate('/confirmation') }}
                className="bg-gray-900 rounded-3xl flex flex-col items-center justify-center gap-4 active:opacity-70 active:scale-95 transition-all border-2 border-gray-800"
                style={{ minHeight: '180px' }}
              >
                <span className="text-6xl">💳</span>
                <p className="text-white text-2xl font-bold text-center">Débito</p>
              </button>

              <button
                onClick={() => { generateOrder('Credito'); navigate('/confirmation') }}
                className="bg-gray-900 rounded-3xl flex flex-col items-center justify-center gap-4 active:opacity-70 active:scale-95 transition-all border-2 border-gray-800"
                style={{ minHeight: '180px' }}
              >
                <span className="text-6xl">💳</span>
                <p className="text-white text-2xl font-bold text-center">Crédito</p>
              </button>
            </div>

            <button
              onClick={() => { generateOrder('PIX'); navigate('/confirmation') }}
              className="w-full bg-gray-900 rounded-3xl flex flex-col items-center justify-center gap-4 active:opacity-70 active:scale-95 transition-all border-2 border-gray-800"
              style={{ minHeight: '180px' }}
            >
              <span className="text-6xl">📱</span>
              <p className="text-white text-2xl font-bold text-center">PIX</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
