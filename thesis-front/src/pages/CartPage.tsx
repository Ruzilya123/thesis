import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { api } from '../api/client'

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoMessage, setPromoMessage] = useState('')
  const [useBonuses, setUseBonuses] = useState(false)

  const applyPromo = async () => {
    if (!promoCode.trim()) return
    try {
      const result = await api.validatePromo(
        promoCode,
        items.map((i) => ({ price: i.price, quantity: i.quantity })),
        '0',
      )
      setPromoDiscount(parseFloat(result.discount))
      setPromoMessage(`Скидка: ${parseFloat(result.discount).toLocaleString('ru-RU')} ₽`)
    } catch (e) {
      setPromoDiscount(0)
      setPromoMessage(e instanceof Error ? e.message : 'Ошибка')
    }
  }

  const goCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } })
      return
    }
    sessionStorage.setItem(
      'checkout_meta',
      JSON.stringify({ promoCode, useBonuses, promoDiscount }),
    )
    navigate('/checkout')
  }

  if (items.length === 0) {
    return (
      <div className="container empty-state">
        <h1>Корзина пуста</h1>
        <Link to="/" className="btn btn--primary">Перейти в каталог</Link>
      </div>
    )
  }

  const total = totalPrice - promoDiscount

  return (
    <div className="container cart-page">
      <h1>Корзина</h1>
      <div className="cart-page__layout">
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.product_id} className="cart-item">
              <img src={item.image_url} alt={item.name} />
              <div className="cart-item__info">
                <h3>{item.name}</h3>
                <p>{parseFloat(item.price).toLocaleString('ru-RU')} ₽ / шт.</p>
              </div>
              <div className="qty-control">
                <button type="button" onClick={() => updateQuantity(item.product_id, item.quantity - 1)}>−</button>
                <span>{item.quantity}</span>
                <button type="button" onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>+</button>
              </div>
              <strong>{(parseFloat(item.price) * item.quantity).toLocaleString('ru-RU')} ₽</strong>
              <button type="button" className="btn btn--ghost" onClick={() => removeItem(item.product_id)}>✕</button>
            </div>
          ))}
        </div>

        <aside className="cart-summary card">
          <h2>Итого</h2>
          <div className="summary-row">
            <span>Товары</span>
            <span>{totalPrice.toLocaleString('ru-RU')} ₽</span>
          </div>
          {promoDiscount > 0 && (
            <div className="summary-row summary-row--discount">
              <span>Промокод</span>
              <span>−{promoDiscount.toLocaleString('ru-RU')} ₽</span>
            </div>
          )}
          <div className="promo-block">
            <input
              type="text"
              placeholder="Промокод (DOUBLEB10)"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
            <button type="button" className="btn btn--ghost" onClick={applyPromo}>Применить</button>
            {promoMessage && <small>{promoMessage}</small>}
          </div>
          <label className="checkbox-label">
            <input type="checkbox" checked={useBonuses} onChange={(e) => setUseBonuses(e.target.checked)} />
            Списать бонусы (до 50% суммы)
          </label>
          <div className="summary-row summary-row--total">
            <span>К оплате</span>
            <span>{Math.max(0, total).toLocaleString('ru-RU')} ₽</span>
          </div>
          <button type="button" className="btn btn--primary btn--full" onClick={goCheckout}>
            Оформить заказ
          </button>
        </aside>
      </div>
    </div>
  )
}
