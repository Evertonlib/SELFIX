import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { useCart } from '../context/CartContext'

const fmt = (v) => `R$ ${v.toFixed(2).replace('.', ',')}`

export default function Payment() {
  const navigate = useNavigate()
  const { config } = useStore()
  const { items, total, generateOrder } = useCart()
  const [method, setMethod] = useState(null)

  useEffect(() => {
    if (items.length === 0) navigate('/')
  }, [])

  if (items.length === 0) return null

  const handleConfirm = () => {
    generateOrder()
    navigate('/confirmation')
  }

  const pixQrSrc = config.pixQrUrl ||
    `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(config.pixKey)}&size=240x240&color=000000&bgcolor=FFFFFF&margin=1`

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <header className="bg-gray-900 px-5 py-4 flex items-center gap-4 border-b border-gray-800">
        <button
          onClick={() => method ? setMethod(null) : navigate('/menu')}
          className="text-gray-400 text-4xl leading-none w-10 h-10 flex items-center justify-center active:opacity-60"
        >
          ‹
        </button>
        <h1 className="text-white text-2xl font-bold">Pagamento</h1>
      </header>

      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        {!method && (
          <div className="flex flex-col gap-6 mt-4">
            <div className="bg-gray-900 rounded-2xl px-5 py-4 flex justify-between items-center">
              <span className="text-gray-400 text-lg">Total do pedido</span>
              <span className="text-white text-2xl font-bold">{fmt(total)}</span>
            </div>

            <p className="text-gray-300 text-xl text-center font-medium mt-2">
              Como deseja pagar?
            </p>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <button
                onClick={() => setMethod('pix')}
                className="bg-gray-900 rounded-3xl flex flex-col items-center justify-center gap-4 active:opacity-70 active:scale-95 transition-all border-2 border-gray-800"
                style={{ minHeight: '180px' }}
              >
                <span className="text-6xl">📱</span>
                <div>
                  <p className="text-white text-2xl font-bold text-center">PIX</p>
                  <p className="text-gray-500 text-sm text-center">Instantâneo</p>
                </div>
              </button>

              <button
                onClick={() => setMethod('card')}
                className="bg-gray-900 rounded-3xl flex flex-col items-center justify-center gap-4 active:opacity-70 active:scale-95 transition-all border-2 border-gray-800"
                style={{ minHeight: '180px' }}
              >
                <span className="text-6xl">💳</span>
                <div>
                  <p className="text-white text-2xl font-bold text-center">Cartão</p>
                  <p className="text-gray-500 text-sm text-center">No caixa</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {method === 'pix' && (
          <div className="flex flex-col items-center gap-6 mt-4">
            <h2 className="text-white text-2xl font-bold">Pague com PIX</h2>

            <div className="bg-white p-4 rounded-2xl shadow-lg">
              <img
                src={pixQrSrc}
                alt="QR Code PIX"
                className="w-56 h-56 block"
                onError={e => { e.target.style.display = 'none' }}
              />
            </div>

            <div className="bg-gray-900 rounded-2xl px-6 py-4 w-full text-center border border-gray-800">
              <p className="text-gray-500 text-sm mb-1">Chave PIX</p>
              <p className="text-white text-lg font-mono break-all">{config.pixKey}</p>
            </div>

            <div className="bg-gray-900 rounded-2xl px-5 py-3 flex justify-between items-center w-full border border-gray-800">
              <span className="text-gray-400">Valor a pagar</span>
              <span className="text-white text-xl font-bold" style={{ color: config.primaryColor }}>{fmt(total)}</span>
            </div>

            <p className="text-gray-400 text-center text-base">
              Escaneie o QR Code com o app do seu banco e confirme o pagamento.
              Após pagar, toque em confirmar abaixo.
            </p>

            <button
              onClick={handleConfirm}
              className="w-full text-white text-xl font-bold rounded-2xl active:opacity-80"
              style={{ backgroundColor: config.primaryColor, minHeight: '64px' }}
            >
              ✓ Confirmar Pagamento
            </button>
          </div>
        )}

        {method === 'card' && (
          <div className="flex flex-col items-center gap-6 mt-4">
            <div className="text-8xl">💳</div>
            <h2 className="text-white text-2xl font-bold text-center">
              Pague no Caixa
            </h2>

            <div className="bg-gray-900 rounded-2xl p-6 w-full border border-gray-800">
              <p className="text-gray-300 text-xl text-center leading-relaxed">
                Dirija-se ao caixa com seu pedido. Informe seu número de pedido
                ao atendente para realizar o pagamento com cartão.
              </p>
            </div>

            <div className="bg-gray-900 rounded-2xl px-5 py-3 flex justify-between items-center w-full border border-gray-800">
              <span className="text-gray-400">Total</span>
              <span className="text-white text-xl font-bold">{fmt(total)}</span>
            </div>

            <button
              onClick={handleConfirm}
              className="w-full text-white text-xl font-bold rounded-2xl active:opacity-80 mt-2"
              style={{ backgroundColor: config.primaryColor, minHeight: '64px' }}
            >
              Confirmar Pedido →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
