import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const fmt = (v) => `R$ ${v.toFixed(2).replace('.', ',')}`

export default function CartDrawer({ isOpen, onClose, primaryColor }) {
  const navigate = useNavigate()
  const { items, updateQty, removeItem, total, customerName, setCustomerName } = useCart()
  const [nameError, setNameError] = useState(false)

  const handleCheckout = () => {
    if (!customerName.trim()) {
      setNameError(true)
      return
    }
    onClose()
    navigate('/payment')
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 z-40"
        onClick={onClose}
      />

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 rounded-t-3xl flex flex-col"
        style={{ maxHeight: '88vh' }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-gray-700 rounded-full" />
        </div>

        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-white text-2xl font-bold font-display">Seu Pedido</h2>
          <button
            onClick={onClose}
            className="text-gray-500 text-3xl leading-none w-10 h-10 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-4">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gray-800 flex-shrink-0 flex items-center justify-center text-2xl">
                  🍔
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-base truncate">{item.name}</p>
                <p className="text-gray-400 text-sm">{fmt(item.price)} / un.</p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => updateQty(item.id, item.qty - 1)}
                  className="w-10 h-10 rounded-full bg-gray-700 text-white text-xl font-bold flex items-center justify-center active:opacity-70"
                >
                  −
                </button>
                <span className="text-white text-lg font-bold w-6 text-center">{item.qty}</span>
                <button
                  onClick={() => updateQty(item.id, item.qty + 1)}
                  className="w-10 h-10 rounded-full text-white text-xl font-bold flex items-center justify-center active:opacity-70"
                  style={{ backgroundColor: primaryColor }}
                >
                  +
                </button>
              </div>

              <button
                onClick={() => removeItem(item.id)}
                className="text-gray-600 text-xl w-8 h-8 flex items-center justify-center ml-1 active:text-red-400"
              >
                🗑
              </button>
            </div>
          ))}
        </div>

        <div className="px-6 pt-4 pb-2 border-t border-gray-800">
          <label className="text-base block mb-2" style={{ color: nameError ? '#f87171' : '#9ca3af' }}>
            Seu nome{nameError ? ' — obrigatório para continuar' : ''}
          </label>
          <input
            type="text"
            value={customerName}
            onChange={e => { setCustomerName(e.target.value); setNameError(false) }}
            placeholder="Como quer ser chamado?"
            className="w-full bg-gray-800 text-white text-lg px-4 rounded-xl outline-none border-2 placeholder-gray-600"
            style={{ minHeight: '56px', borderColor: nameError ? '#f87171' : '#374151' }}
          />
        </div>

        <div className="px-6 py-5">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400 text-lg">Total</span>
            <span className="text-white text-2xl font-bold">{fmt(total)}</span>
          </div>
          <button
            onClick={handleCheckout}
            className="w-full text-white text-xl font-bold rounded-2xl active:opacity-80 transition-opacity"
            style={{ backgroundColor: primaryColor, minHeight: '64px' }}
          >
            Finalizar Pedido →
          </button>
        </div>
      </div>
    </>
  )
}
