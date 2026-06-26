import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Layout() {
  const { isAuthenticated, user, logout } = useAuth()
  const { totalCount } = useCart()

  return (
    <div className="app">
      <header className="header">
        <div className="container header__inner">
          <Link to="/" className="logo">
            <span className="logo__mark">DB</span>
            <span className="logo__text">Double B</span>
          </Link>
          <nav className="nav">
            <Link to="/">Каталог</Link>
            {isAuthenticated && <Link to="/profile">Личный кабинет</Link>}
            {user?.username === 'admin' && <Link to="/admin">Админ</Link>}
          </nav>
          <div className="header__actions">
            {isAuthenticated ? (
              <button type="button" className="btn btn--ghost" onClick={logout}>
                Выйти
              </button>
            ) : (
              <Link to="/login" className="btn btn--ghost">
                Войти
              </Link>
            )}
            <Link to="/cart" className="cart-btn">
              Корзина
              {totalCount > 0 && <span className="cart-btn__badge">{totalCount}</span>}
            </Link>
          </div>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container">
          <p>© 2026 ООО «Дом Даблби» — интернет-магазин спешелти-кофе</p>
        </div>
      </footer>
    </div>
  )
}
