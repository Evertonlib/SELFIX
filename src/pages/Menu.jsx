import { useState, useMemo } from 'react'
import { useStore } from '../context/StoreContext'
import { useCart } from '../context/CartContext'
import CategoryBar from '../components/CategoryBar'
import ProductCard from '../components/ProductCard'
import CartDrawer from '../components/CartDrawer'

const fmt = (v) => `R$ ${v.toFixed(2).replace('.', ',')}`
const ALL = 'Todos'

export default function Menu() {
  const { config, products } = useStore()
  const { addItem, itemCount, total } = useCart()
  const [activeCategory, setActiveCategory] = useState(ALL)
  const [cartOpen, setCartOpen] = useState(false)
  const [addedId, setAddedId] = useState(null)

  const activeProducts = useMemo(
    () => products.filter(p => p.active),
    [products]
  )

  const categories = useMemo(
    () => [ALL, ...new Set(activeProducts.map(p => p.category))],
    [activeProducts]
  )

  const displayed = useMemo(
    () => activeCategory === ALL
      ? activeProducts
      : activeProducts.filter(p => p.category === activeCategory),
    [activeProducts, activeCategory]
  )

  const handleAdd = (product) => {
    addItem(product)
    setAddedId(product.id)
    setTimeout(() => setAddedId(null), 600)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <header className="bg-gray-900 px-5 py-4 flex items-center gap-4 border-b border-gray-800">
        {config.logoUrl ? (
          <img src={config.logoUrl} alt={config.name} className="h-10 w-10 object-contain rounded-xl" />
        ) : (
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-black text-lg"
            style={{ backgroundColor: config.primaryColor }}
          >
            {config.name.charAt(0)}
          </div>
        )}
        <h1 className="text-white text-2xl font-bold flex-1">{config.name}</h1>
        <span className="text-gray-500 text-sm">Cardápio</span>
      </header>

      <CategoryBar
        categories={categories}
        active={activeCategory}
        onSelect={setActiveCategory}
        primaryColor={config.primaryColor}
      />

      <div
        className="flex-1 overflow-y-auto p-4"
        style={{ paddingBottom: itemCount > 0 ? '100px' : '16px' }}
      >
        {displayed.length === 0 ? (
          <div className="text-center text-gray-600 py-20 text-xl">
            Nenhum item nesta categoria.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {displayed.map(product => (
              <div
                key={product.id}
                className={`transition-transform duration-150 ${addedId === product.id ? 'scale-95' : 'scale-100'}`}
              >
                <ProductCard
                  product={product}
                  onAdd={() => handleAdd(product)}
                  primaryColor={config.primaryColor}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent pt-8">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full text-white rounded-2xl flex items-center justify-between px-5 active:opacity-80 transition-opacity shadow-xl"
            style={{
              backgroundColor: config.primaryColor,
              minHeight: '64px',
              boxShadow: `0 4px 24px ${config.primaryColor}66`,
            }}
          >
            <span
              className="bg-white/25 rounded-full w-9 h-9 flex items-center justify-center text-base font-black"
            >
              {itemCount}
            </span>
            <span className="text-xl font-bold">Ver pedido</span>
            <span className="text-lg font-bold">{fmt(total)}</span>
          </button>
        </div>
      )}

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        primaryColor={config.primaryColor}
      />
    </div>
  )
}
