import { Link, Outlet, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Layout() {
  const { isAuthenticated, user, logout } = useAuth()
  const { totalCount } = useCart()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const searchValue = searchParams.get('search') || ''

  const onSearchChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set('search', value)
    else params.delete('search')
    navigate({ pathname: '/', search: params.toString() ? `?${params}` : '' })
  }

  return (
    <div className="app">
      <header className="header">
        <div className="container header__inner">
          <Link to="/" className="logo">
            Double B
          </Link>
          <input
            type="search"
            className="header__search"
            placeholder="Поиск товаров..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <div className="header__actions">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="header__login">Кабинет</Link>
                {user?.username === 'admin' && (
                  <Link to="/admin" className="header__login">Админ</Link>
                )}
                <button type="button" className="btn btn--header btn--sm" onClick={logout}>
                  Выйти
                </button>
              </>
            ) : (
              <Link to="/login" className="header__login">Вход</Link>
            )}
            <Link to="/cart" className="cart-btn">
              Корзина{totalCount > 0 ? ` (${totalCount})` : ''}
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
