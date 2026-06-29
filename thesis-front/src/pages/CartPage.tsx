import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { api } from '../api/client'
import { formatPrice, productImage } from '../utils/product'
import type { LoyaltyAccount } from '../types'

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoMessage, setPromoMessage] = useState('')
  const [useBonuses, setUseBonuses] = useState(false)
  const [loyalty, setLoyalty] = useState<LoyaltyAccount | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      api.getLoyalty().then(setLoyalty).catch(() => setLoyalty(null))
    }
  }, [isAuthenticated])

  const applyPromo = async () => {
    if (!promoCode.trim()) return
    try {
      const result = await api.validatePromo(
        promoCode,
        items.map((i) => ({ price: i.price, quantity: i.quantity })),
        '0',
      )
      setPromoDiscount(parseFloat(result.discount))
      setPromoMessage(`Скидка: ${formatPrice(result.discount)} ₽`)
    } catch (e) {
      setPromoDiscount(0)
      setPromoMessage(e instanceof Error ? e.message : 'Ошибка')
    }
  }

  const bonusAvailable = loyalty ? parseFloat(loyalty.balance) : 0
  const afterPromo = totalPrice - promoDiscount
  const bonusUsedPreview = useBonuses
    ? Math.min(bonusAvailable, afterPromo * 0.5)
    : 0
  const total = Math.max(0, afterPromo - bonusUsedPreview)

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

  return (
    <div className="container cart-page">
      <h1 className="page-title">Корзина</h1>
      <div className="cart-page__layout">
        <div className="cart-items">
          {items.map((item) => (
            <div key={`${item.product_id}:${item.name}:${item.price}`} className="cart-item">
              <img src={productImage(item.image_url)} alt={item.name} />
              <div className="cart-item__info">
                <h3>{item.name}</h3>
              </div>
              <div className="qty-control">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.product_id, item.quantity - 1, item.name, item.price)}
                >
                  −
                </button>
                <span>{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.product_id, item.quantity + 1, item.name, item.price)}
                >
                  +
                </button>
              </div>
              <strong>{formatPrice(parseFloat(item.price) * item.quantity)} ₽</strong>
              <button
                type="button"
                className="cart-item__remove"
                onClick={() => removeItem(item.product_id, item.name, item.price)}
                aria-label="Удалить"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <aside className="cart-summary card">
          <div className="promo-block">
            <input
              type="text"
              placeholder="Промокод"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
            <button type="button" className="btn btn--primary btn--sm" onClick={applyPromo}>
              Применить
            </button>
          </div>
          {promoMessage && <small className="muted">{promoMessage}</small>}

          {isAuthenticated && bonusAvailable > 0 && (
            <label className="bonus-toggle">
              <input type="checkbox" checked={useBonuses} onChange={(e) => setUseBonuses(e.target.checked)} />
              Списать бонусы (доступно {formatPrice(bonusAvailable)} ₽)
            </label>
          )}

          <div className="summary-row">
            <span>Сумма</span>
            <span>{formatPrice(totalPrice)} ₽</span>
          </div>
          {promoDiscount > 0 && (
            <div className="summary-row summary-row--discount">
              <span>Скидка</span>
              <span>−{formatPrice(promoDiscount)} ₽</span>
            </div>
          )}
          {bonusUsedPreview > 0 && (
            <div className="summary-row summary-row--discount">
              <span>Бонусы</span>
              <span>−{formatPrice(bonusUsedPreview)} ₽</span>
            </div>
          )}
          <div className="summary-row summary-row--total">
            <span>Итого</span>
            <span className="summary-row__value">{formatPrice(total)} ₽</span>
          </div>
          <button type="button" className="btn btn--primary btn--full" onClick={goCheckout}>
            Перейти к оформлению
          </button>
        </aside>
      </div>
    </div>
  )
}
