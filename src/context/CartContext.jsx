import { createContext, useContext, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [customerName, setCustomerName] = useState('')
  const [orderNumber, setOrderNumber] = useState(null)

  const addItem = (product) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, { ...product, qty: 1 }]
    })
  }

  const removeItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const updateQty = (id, qty) => {
    if (qty <= 0) return removeItem(id)
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i))
  }

  const generateOrder = () => {
    const num = String(Math.floor(1000 + Math.random() * 9000))
    setOrderNumber(num)
    try {
      const params = new URLSearchParams(window.location.search)
      const tableNum = params.get('mesa') ?? 'Balcão'
      const totalAtual = items.reduce((s, i) => s + i.price * i.qty, 0)
      const snapshot = items.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty }))
      const order = {
        id: num,
        tableNumber: tableNum,
        customerName,
        items: snapshot,
        total: totalAtual,
        createdAt: new Date().toISOString(),
      }
      let existing = []
      try {
        const raw = localStorage.getItem('selfix_orders')
        existing = raw ? JSON.parse(raw) : []
      } catch (_) {}
      existing.push(order)
      localStorage.setItem('selfix_orders', JSON.stringify(existing))
    } catch (_) {}
    return num
  }

  const clearCart = () => {
    setItems([])
    setCustomerName('')
    setOrderNumber(null)
  }

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0)

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQty,
      customerName,
      setCustomerName,
      total,
      itemCount,
      orderNumber,
      generateOrder,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
