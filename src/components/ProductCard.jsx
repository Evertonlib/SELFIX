const fmt = (v) => `R$ ${v.toFixed(2).replace('.', ',')}`

export default function ProductCard({ product, onAdd, primaryColor }) {
  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden flex flex-col shadow-lg">
      {product.image ? (
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-36 object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-36 bg-gray-800 flex items-center justify-center text-5xl">
          🍔
        </div>
      )}

      <div className="p-4 flex flex-col gap-1 flex-1">
        <h3 className="text-white text-lg font-bold leading-tight font-display">{product.name}</h3>
        <p className="text-gray-400 text-sm leading-snug flex-1">{product.description}</p>

        <div className="flex items-center justify-between mt-3">
          <span className="text-white text-xl font-bold font-display">{fmt(product.price)}</span>
          <button
            onClick={onAdd}
            aria-label={`Adicionar ${product.name}`}
            className="w-12 h-12 rounded-full text-white text-2xl font-bold flex items-center justify-center active:opacity-70 active:scale-95 transition-transform"
            style={{ backgroundColor: primaryColor }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}
