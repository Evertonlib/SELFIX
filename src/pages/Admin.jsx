import { useState, useRef } from 'react'
import { useStore } from '../context/StoreContext'
import AdminProductForm from '../components/AdminProductForm'

function LoginForm({ onLogin, config }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (user === config.adminUser && pass === config.adminPass) {
      onLogin()
    } else {
      setError('Usuário ou senha incorretos.')
      setPass('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">⚙️</div>
          <h1 className="text-2xl font-bold text-gray-900">Painel SELFIX</h1>
          <p className="text-gray-500 text-sm mt-1">Acesso exclusivo para o administrador</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
            <input
              type="text"
              value={user}
              onChange={e => setUser(e.target.value)}
              autoComplete="username"
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              value={pass}
              onChange={e => setPass(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-2">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors mt-2"
          >
            Entrar
          </button>
        </form>

        <p className="text-center text-gray-400 text-xs mt-6">
          Padrão: admin / selfix123
        </p>
      </div>
    </div>
  )
}

function SettingsTab() {
  const { config, updateConfig } = useStore()
  const [form, setForm] = useState({ ...config })
  const [saved, setSaved] = useState(false)
  const fileRef = useRef()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleLogoFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => set('logoUrl', reader.result)
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    updateConfig(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-6 pb-8">
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-900 text-lg mb-4">Identidade do Estabelecimento</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Estabelecimento</label>
            <input
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
            {form.logoUrl && (
              <div className="relative inline-block mb-3">
                <img src={form.logoUrl} alt="Logo atual" className="w-20 h-20 object-contain rounded-xl border border-gray-200 bg-gray-50" />
                <button
                  type="button"
                  onClick={() => set('logoUrl', '')}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-sm flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current.click()}
              className="block border-2 border-dashed border-gray-300 rounded-xl px-4 py-2 text-gray-500 hover:border-blue-400 hover:text-blue-500 text-sm font-medium transition-colors mb-2"
            >
              📁 Upload de logo
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoFile} className="hidden" />
            <input
              type="text"
              value={form.logoUrl}
              onChange={e => set('logoUrl', e.target.value)}
              placeholder="https://... ou deixe vazio"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cor Primária</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.primaryColor}
                onChange={e => set('primaryColor', e.target.value)}
                className="w-14 h-12 rounded-xl cursor-pointer border border-gray-300 p-1"
              />
              <input
                type="text"
                value={form.primaryColor}
                onChange={e => set('primaryColor', e.target.value)}
                placeholder="#f97316"
                className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 w-36 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div
                className="flex-1 h-12 rounded-xl border border-gray-200"
                style={{ backgroundColor: form.primaryColor }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-900 text-lg mb-4">Configuração PIX</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chave PIX</label>
            <input
              type="text"
              value={form.pixKey}
              onChange={e => set('pixKey', e.target.value)}
              placeholder="CPF, CNPJ, e-mail ou chave aleatória"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL do QR Code PIX
              <span className="text-gray-400 font-normal ml-1">(opcional)</span>
            </label>
            <input
              type="text"
              value={form.pixQrUrl}
              onChange={e => set('pixQrUrl', e.target.value)}
              placeholder="Se vazio, gera QR automaticamente da chave PIX"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Para PIX oficial, gere o QR no seu banco e cole a URL da imagem aqui.
            </p>
          </div>

          {form.pixKey && (
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              <p className="text-xs text-gray-500 mb-2 font-medium">Pré-visualização do QR Code:</p>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(form.pixKey)}&size=120x120`}
                alt="QR Preview"
                className="w-28 h-28 rounded"
              />
            </div>
          )}
        </div>
      </section>

      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-900 text-lg mb-4">Credenciais de Acesso</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
            <input
              type="text"
              value={form.adminUser}
              onChange={e => set('adminUser', e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
            <input
              type="password"
              value={form.adminPass}
              onChange={e => set('adminPass', e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      <button
        onClick={handleSave}
        className={`w-full py-4 rounded-2xl font-bold text-white text-lg transition-colors ${
          saved ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {saved ? '✓ Configurações salvas!' : 'Salvar Configurações'}
      </button>
    </div>
  )
}

function ProductsTab() {
  const { products, addProduct, updateProduct, deleteProduct, resetProducts } = useStore()
  const [editingProduct, setEditingProduct] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = (data) => {
    if (editingProduct) {
      updateProduct({ ...editingProduct, ...data })
    } else {
      addProduct(data)
    }
    setShowForm(false)
    setEditingProduct(null)
  }

  const handleDelete = (id) => {
    if (window.confirm('Excluir este produto?')) deleteProduct(id)
  }

  const handleReset = () => {
    if (window.confirm('Restaurar o cardápio de exemplo? Isso substituirá todos os produtos atuais.')) {
      resetProducts()
    }
  }

  if (showForm) {
    return (
      <AdminProductForm
        product={editingProduct}
        onSave={handleSave}
        onCancel={() => { setShowForm(false); setEditingProduct(null) }}
      />
    )
  }

  const activeCount = products.filter(p => p.active).length

  return (
    <div className="pb-8">
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar produto..."
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => { setEditingProduct(null); setShowForm(true) }}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 text-sm whitespace-nowrap"
        >
          + Novo
        </button>
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="text-gray-500 text-sm">
          {products.length} produto{products.length !== 1 ? 's' : ''} · {activeCount} ativo{activeCount !== 1 ? 's' : ''}
        </p>
        <button
          onClick={handleReset}
          className="text-gray-400 text-xs hover:text-orange-500 transition-colors"
        >
          Restaurar demo
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center text-gray-400 py-16">
          {search ? 'Nenhum produto encontrado.' : 'Nenhum produto cadastrado.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(product => (
            <div
              key={product.id}
              className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm"
            >
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-gray-100"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 flex items-center justify-center text-2xl">
                  🍔
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      product.active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {product.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <p className="text-gray-400 text-sm truncate">{product.category}</p>
                <p className="text-gray-800 font-semibold text-sm">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </p>
              </div>

              <div className="flex flex-col gap-1 flex-shrink-0">
                <button
                  onClick={() => { setEditingProduct(product); setShowForm(true) }}
                  className="text-blue-600 hover:bg-blue-50 font-medium text-sm px-3 py-1.5 rounded-lg"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="text-red-500 hover:bg-red-50 font-medium text-sm px-3 py-1.5 rounded-lg"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Admin() {
  const { config } = useStore()
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem('selfix_admin') === '1'
  })
  const [activeTab, setActiveTab] = useState('settings')

  const handleLogin = () => {
    sessionStorage.setItem('selfix_admin', '1')
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('selfix_admin')
    setIsLoggedIn(false)
  }

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} config={config} />
  }

  const tabs = [
    { key: 'settings', label: '⚙ Configurações' },
    { key: 'products', label: '🍔 Cardápio' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900">Painel SELFIX</h1>
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="text-blue-600 text-sm font-medium hover:underline"
          >
            Ver quiosque ↗
          </a>
          <button
            onClick={handleLogout}
            className="text-gray-500 text-sm hover:text-gray-800 transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-4 px-4 text-sm font-semibold border-b-2 transition-colors mr-2 ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        {activeTab === 'settings' ? <SettingsTab /> : <ProductsTab />}
      </div>
    </div>
  )
}
