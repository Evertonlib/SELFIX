import { createContext, useContext, useState, useEffect } from 'react'
import { seedProducts } from '../data/seed'

const DEFAULT_CONFIG = {
  name: 'SELFIX Burger',
  logoUrl: '',
  primaryColor: '#f97316',
  pixKey: 'contato@selfix.com.br',
  pixQrUrl: '',
  adminUser: 'admin',
  adminPass: 'selfix123',
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('selfix_config')
      return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG
    } catch {
      return DEFAULT_CONFIG
    }
  })

  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('selfix_products')
      return saved ? JSON.parse(saved) : seedProducts
    } catch {
      return seedProducts
    }
  })

  useEffect(() => {
    localStorage.setItem('selfix_config', JSON.stringify(config))
  }, [config])

  useEffect(() => {
    localStorage.setItem('selfix_products', JSON.stringify(products))
  }, [products])

  const updateConfig = (partial) => setConfig(prev => ({ ...prev, ...partial }))

  const addProduct = (data) => {
    const product = { ...data, id: `p_${Date.now()}` }
    setProducts(prev => [...prev, product])
  }

  const updateProduct = (updated) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p))
  }

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  const resetProducts = () => {
    setProducts(seedProducts)
    localStorage.setItem('selfix_products', JSON.stringify(seedProducts))
  }

  return (
    <StoreContext.Provider value={{
      config,
      updateConfig,
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      resetProducts,
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export const useStore = () => {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
