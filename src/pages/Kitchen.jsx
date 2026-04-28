import { useState, useEffect } from 'react'
import { useStore } from '../context/StoreContext'

export default function Kitchen() {
  const { config } = useStore()
  const [orders, setOrders] = useState([])
  const [confirmTarget, setConfirmTarget] = useState(null)

  useEffect(() => {
    function readOrders() {
      try {
        const raw = localStorage.getItem('selfix_orders')
        const parsed = raw ? JSON.parse(raw) : []
        const pending = parsed.filter(o => o.kitchenStatus !== 'done')
        setOrders(prev =>
          JSON.stringify(prev) !== JSON.stringify(pending) ? pending : prev
        )
      } catch (_) {
        setOrders(prev => (prev.length === 0 ? prev : []))
      }
    }

    readOrders()
    const interval = setInterval(readOrders, 5000)
    return () => clearInterval(interval)
  }, [])

  function handleDone(id) {
    setConfirmTarget(id)
  }

  function confirmDone() {
    try {
      const raw = localStorage.getItem('selfix_orders')
      const current = raw ? JSON.parse(raw) : []
      const updated = current.map(o =>
        o.id === confirmTarget ? { ...o, kitchenStatus: 'done' } : o
      )
      localStorage.setItem('selfix_orders', JSON.stringify(updated))
      setOrders(prev => prev.filter(o => o.id !== confirmTarget))
    } catch (_) {}
    setConfirmTarget(null)
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-900 px-5 py-4 border-b border-gray-800">
        <h1 className="text-white text-2xl font-bold">Painel da Cozinha</h1>
      </header>

      <div className="p-4 flex flex-col gap-4">
        {orders.length === 0 ? (
          <p className="text-gray-400 text-center text-xl mt-16">
            Nenhum pedido no momento.
          </p>
        ) : (
          orders.map(order => (
            <div key={order.id} className="bg-gray-900 rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-white text-xl font-bold">Pedido #{order.id}</span>
                {order.tableNumber === 'Balcão'
                  ? <span className="text-gray-400 text-base">Balcão</span>
                  : <span className="text-gray-400 text-base">Mesa {order.tableNumber}</span>
                }
              </div>

              <span className="text-gray-300 text-base">{order.customerName}</span>

              <ul className="flex flex-col gap-1">
                {order.items.map(item => (
                  <li key={item.id} className="text-gray-300 text-sm">
                    {item.qty}× {item.name}
                  </li>
                ))}
              </ul>

              <span className="text-gray-400 text-sm">
                Total: R$ {order.total.toFixed(2).replace('.', ',')}
              </span>

              <button
                onClick={() => handleDone(order.id)}
                className="w-full text-white font-bold rounded-2xl py-3 active:opacity-80"
                style={{ backgroundColor: config.primaryColor }}
              >
                Concluído
              </button>
            </div>
          ))
        )}
      </div>

      {confirmTarget !== null && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl p-6 mx-6 flex flex-col gap-4">
            <p className="text-white text-xl font-bold text-center">
              Concluir pedido #{confirmTarget}?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmTarget(null)}
                className="flex-1 bg-gray-700 text-white font-bold rounded-2xl py-3"
              >
                Não
              </button>
              <button
                onClick={confirmDone}
                className="flex-1 text-white font-bold rounded-2xl py-3"
                style={{ backgroundColor: config.primaryColor }}
              >
                Sim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
