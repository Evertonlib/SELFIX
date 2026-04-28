import { HashRouter, Routes, Route } from 'react-router-dom'
import { StoreProvider } from './context/StoreContext'
import { CartProvider } from './context/CartContext'
import Welcome from './pages/Welcome'
import Menu from './pages/Menu'
import Payment from './pages/Payment'
import Confirmation from './pages/Confirmation'
import Admin from './pages/Admin'
import Kitchen from './pages/Kitchen'
import Cashier from './pages/Cashier'
import ThemeToggle from './components/ThemeToggle'

export default function App() {
  return (
    <StoreProvider>
      <CartProvider>
        <HashRouter>
          <ThemeToggle />
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/confirmation" element={<Confirmation />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/cozinha" element={<Kitchen />} />
            <Route path="/caixa" element={<Cashier />} />
          </Routes>
        </HashRouter>
      </CartProvider>
    </StoreProvider>
  )
}
