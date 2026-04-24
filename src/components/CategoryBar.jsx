export default function CategoryBar({ categories, active, onSelect, primaryColor }) {
  return (
    <div className="bg-gray-900 px-4 py-3 flex gap-3 overflow-x-auto scrollbar-none border-b border-gray-800">
      {categories.map(cat => {
        const isActive = active === cat
        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className="flex-shrink-0 px-5 rounded-full text-lg font-semibold transition-colors active:opacity-70"
            style={{
              minHeight: '48px',
              backgroundColor: isActive ? primaryColor : '#374151',
              color: isActive ? '#ffffff' : '#9ca3af',
            }}
          >
            {cat}
          </button>
        )
      })}
    </div>
  )
}
