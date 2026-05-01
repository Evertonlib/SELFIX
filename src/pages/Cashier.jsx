import { useState, useEffect } from 'react'

const PAYMENT_METHODS = ['Dinheiro', 'Debito', 'Credito', 'PIX']

function readOrdersFromStorage() {
  try {
    const raw = localStorage.getItem('selfix_orders')
    return raw ? JSON.parse(raw) : []
  } catch (_) {
    return []
  }
}

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function elapsed(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000 / 60)
  if (diff < 1) return '< 1 min'
  if (diff < 60) return `${diff} min`
  const h = Math.floor(diff / 60)
  const m = diff % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

function fmt(v) {
  return `R$ ${Number(v).toFixed(2).replace('.', ',')}`
}

function deriveComandas(orders) {
  const tableMap = {}
  const counterList = []

  for (const order of orders) {
    if (order.tableNumber === 'Balcão') {
      counterList.push(order)
    } else {
      if (!tableMap[order.tableNumber]) tableMap[order.tableNumber] = []
      tableMap[order.tableNumber].push(order)
    }
  }

  const comandas = []

  for (const [tableNumber, tableOrders] of Object.entries(tableMap)) {
    const sorted = [...tableOrders].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    const mostRecent = sorted[sorted.length - 1]

    const itemMap = {}
    for (const order of tableOrders) {
      for (const item of order.items) {
        const key = `${item.id}_${item.price}`
        if (!itemMap[key]) {
          itemMap[key] = { id: item.id, name: item.name, unitPrice: item.price, qty: 0, total: 0 }
        }
        itemMap[key].qty += item.qty
        itemMap[key].total += item.price * item.qty
      }
    }

    comandas.push({
      key: `table_${tableNumber}`,
      type: 'table',
      tableNumber,
      customerName: mostRecent.customerName,
      orders: tableOrders,
      items: Object.values(itemMap),
      total: tableOrders.reduce((s, o) => s + o.total, 0),
      openedAt: sorted[0].createdAt,
      paymentReference: mostRecent.paymentReference || 'Nao informado',
      isReadyToClose: tableOrders.every(o => o.kitchenStatus === 'done'),
    })
  }

  for (const order of counterList) {
    comandas.push({
      key: `counter_${order.id}`,
      type: 'counter',
      tableNumber: order.tableNumber,
      customerName: order.customerName,
      orders: [order],
      items: order.items.map(item => ({
        id: item.id,
        name: item.name,
        unitPrice: item.price,
        qty: item.qty,
        total: item.price * item.qty,
      })),
      total: order.total,
      openedAt: order.createdAt,
      paymentReference: order.paymentReference || 'Nao informado',
      isReadyToClose: order.kitchenStatus === 'done',
    })
  }

  comandas.sort((a, b) => new Date(a.openedAt) - new Date(b.openedAt))
  return comandas
}

export default function Cashier() {
  const [orders, setOrders] = useState([])
  const [view, setView] = useState('active')
  const [archivedTabs, setArchivedTabs] = useState([])
  const [selectedPaymentByTab, setSelectedPaymentByTab] = useState({})
  const [confirmTarget, setConfirmTarget] = useState(null)

  useEffect(() => {
    function load() {
      setOrders(readOrdersFromStorage())
    }
    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [])

  const comandas = deriveComandas(orders)

  function selectPayment(key, method) {
    setSelectedPaymentByTab(prev => ({ ...prev, [key]: method }))
  }

  function confirmClose() {
    const comanda = confirmTarget
    const paymentMethod = selectedPaymentByTab[comanda.key]
    const now = new Date().toISOString()

    const snapshot = {
      key: comanda.key,
      type: comanda.type,
      tableNumber: comanda.tableNumber,
      customerName: comanda.customerName,
      items: comanda.items,
      total: comanda.total,
      cashierPaymentMethod: paymentMethod,
      openedAt: comanda.openedAt,
      closedAt: now,
    }

    const closedIds = new Set(comanda.orders.map(o => o.id))
    try {
      const raw = localStorage.getItem('selfix_orders')
      const current = raw ? JSON.parse(raw) : []
      const updated = current.filter(o => !closedIds.has(o.id))
      localStorage.setItem('selfix_orders', JSON.stringify(updated))
      setOrders(updated)
    } catch (_) {}

    setArchivedTabs(prev => [...prev, snapshot])
    setSelectedPaymentByTab(prev => {
      const next = { ...prev }
      delete next[comanda.key]
      return next
    })
    setConfirmTarget(null)
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-900 px-5 py-4 border-b border-gray-800 flex items-center justify-between">
        <h1 className="text-white text-2xl font-bold font-display">Painel do Caixa</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView('active')}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
              view === 'active' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            Ativas ({comandas.length})
          </button>
          <button
            onClick={() => setView('archived')}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
              view === 'archived' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            Encerradas ({archivedTabs.length})
          </button>
        </div>
      </header>

      <div className="p-4 flex flex-col gap-4">
        {view === 'active' ? (
          comandas.length === 0 ? (
            <p className="text-gray-400 text-center text-xl mt-16">
              Nenhuma comanda ativa no momento.
            </p>
          ) : (
            comandas.map(comanda => {
              const selectedPayment = selectedPaymentByTab[comanda.key] || ''
              const label = comanda.type === 'table' ? `Mesa ${comanda.tableNumber}` : 'Balcão'
              return (
                <div
                  key={comanda.key}
                  className={`bg-gray-900 rounded-2xl p-5 flex flex-col gap-4 border-2 ${
                    comanda.isReadyToClose ? 'border-green-500' : 'border-gray-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-white text-xl font-bold font-display">{label}</span>
                      <p className="text-gray-400 text-base">{comanda.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">Aberta às {formatTime(comanda.openedAt)}</p>
                      <p className="text-gray-500 text-sm">{elapsed(comanda.openedAt)}</p>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm">
                    Ref. quiosque: <span className="text-gray-300">{comanda.paymentReference}</span>
                  </p>

                  <div className="flex flex-col gap-1">
                    <div className="flex text-gray-500 text-xs font-semibold uppercase mb-1">
                      <span className="w-8">Qtd</span>
                      <span className="flex-1">Item</span>
                      <span className="w-20 text-right">Unit.</span>
                      <span className="w-20 text-right">Total</span>
                    </div>
                    {comanda.items.map(item => (
                      <div key={`${item.id}_${item.unitPrice}`} className="flex text-gray-300 text-sm">
                        <span className="w-8">{item.qty}×</span>
                        <span className="flex-1">{item.name}</span>
                        <span className="w-20 text-right">{fmt(item.unitPrice)}</span>
                        <span className="w-20 text-right">{fmt(item.total)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center border-t border-gray-800 pt-3">
                    <span className="text-gray-400">Total</span>
                    <span className="text-white text-xl font-bold">{fmt(comanda.total)}</span>
                  </div>

                  {comanda.isReadyToClose ? (
                    <p className="text-green-400 text-sm font-semibold text-center">
                      Todos os pedidos concluidos pela cozinha
                    </p>
                  ) : (
                    <p className="text-yellow-400 text-sm text-center">
                      Ha pedidos em preparo — aguardando a cozinha
                    </p>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    {PAYMENT_METHODS.map(method => (
                      <button
                        key={method}
                        onClick={() => selectPayment(comanda.key, method)}
                        disabled={!comanda.isReadyToClose}
                        className={`px-3 py-2 rounded-xl text-sm font-bold transition-colors ${
                          selectedPayment === method
                            ? 'bg-indigo-600 text-white'
                            : comanda.isReadyToClose
                            ? 'bg-gray-800 text-gray-300'
                            : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setConfirmTarget(comanda)}
                    disabled={!comanda.isReadyToClose || !selectedPayment}
                    className={`w-full font-bold rounded-2xl py-3 transition-all ${
                      comanda.isReadyToClose && selectedPayment
                        ? 'bg-green-600 text-white active:opacity-80'
                        : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    Fechar Comanda
                  </button>
                </div>
              )
            })
          )
        ) : (
          archivedTabs.length === 0 ? (
            <p className="text-gray-400 text-center text-xl mt-16">
              Nenhuma comanda encerrada nesta sessao.
            </p>
          ) : (
            [...archivedTabs].reverse().map(tab => {
              const label = tab.type === 'table' ? `Mesa ${tab.tableNumber}` : 'Balcão'
              return (
                <div
                  key={`${tab.key}_${tab.closedAt}`}
                  className="bg-gray-900 rounded-2xl p-5 flex flex-col gap-3 border-2 border-gray-700"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-white text-xl font-bold font-display">{label}</span>
                      <p className="text-gray-400 text-base">{tab.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 text-xs">Aberta: {formatTime(tab.openedAt)}</p>
                      <p className="text-gray-500 text-xs">Fechada: {formatTime(tab.closedAt)}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    {tab.items.map(item => (
                      <div key={`${item.id}_${item.unitPrice}`} className="flex text-gray-300 text-sm">
                        <span className="w-8">{item.qty}×</span>
                        <span className="flex-1">{item.name}</span>
                        <span className="w-20 text-right">{fmt(item.total)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center border-t border-gray-800 pt-2">
                    <span className="text-gray-400">Total</span>
                    <span className="text-white font-bold">{fmt(tab.total)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Pagamento confirmado</span>
                    <span className="text-green-400 font-semibold text-sm">{tab.cashierPaymentMethod}</span>
                  </div>
                </div>
              )
            })
          )
        )}
      </div>

      {confirmTarget && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl p-6 mx-6 flex flex-col gap-4">
            <p className="text-white text-xl font-bold text-center">
              Fechar comanda{' '}
              {confirmTarget.type === 'table'
                ? `Mesa ${confirmTarget.tableNumber}`
                : 'Balcão'}{' '}
              — {confirmTarget.customerName}?
            </p>
            <p className="text-gray-400 text-center text-sm">
              Pagamento: {selectedPaymentByTab[confirmTarget.key]}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmTarget(null)}
                className="flex-1 bg-gray-700 text-white font-bold rounded-2xl py-3"
              >
                Cancelar
              </button>
              <button
                onClick={confirmClose}
                className="flex-1 bg-green-600 text-white font-bold rounded-2xl py-3"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
