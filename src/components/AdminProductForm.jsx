import { useState, useRef } from 'react'

const PRESET_CATEGORIES = ['Hambúrgueres', 'Acompanhamentos', 'Bebidas', 'Sobremesas', 'Outros']

export default function AdminProductForm({ product, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product?.price ?? '',
    category: product?.category ?? PRESET_CATEGORIES[0],
    image: product?.image ?? '',
    active: product?.active ?? true,
  })
  const [preview, setPreview] = useState(product?.image ?? '')
  const fileRef = useRef()

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      set('image', reader.result)
      setPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleUrlChange = (e) => {
    set('image', e.target.value)
    setPreview(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || form.price === '') return
    onSave({ ...form, price: parseFloat(String(form.price).replace(',', '.')) })
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 text-lg font-medium"
        >
          ← Voltar
        </button>
        <h2 className="text-xl font-bold text-gray-900 font-display">
          {product ? 'Editar Produto' : 'Novo Produto'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
          <input
            type="text"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={e => set('price', e.target.value)}
              required
              placeholder="0,00"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <input
              type="text"
              value={form.category}
              onChange={e => set('category', e.target.value)}
              list="cat-options"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <datalist id="cat-options">
              {PRESET_CATEGORIES.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Foto do Produto</label>

          {preview && (
            <div className="relative w-full h-40 rounded-xl overflow-hidden mb-3 bg-gray-100">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => { set('image', ''); setPreview('') }}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm"
              >
                ×
              </button>
            </div>
          )}

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => fileRef.current.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors text-sm font-medium"
            >
              📷 Fazer upload de imagem
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />

            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-400 text-xs">ou</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <input
              type="text"
              value={form.image}
              onChange={handleUrlChange}
              placeholder="https://... (URL da imagem)"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
          <input
            type="checkbox"
            id="active-toggle"
            checked={form.active}
            onChange={e => set('active', e.target.checked)}
            className="w-5 h-5 rounded accent-blue-600 cursor-pointer"
          />
          <label htmlFor="active-toggle" className="text-gray-700 font-medium cursor-pointer flex-1">
            Produto ativo
            <span className="block text-xs text-gray-400 font-normal">Visível no cardápio do quiosque</span>
          </label>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${form.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
            {form.active ? 'Ativo' : 'Inativo'}
          </span>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
          >
            {product ? 'Salvar Alterações' : 'Criar Produto'}
          </button>
        </div>
      </form>
    </div>
  )
}
