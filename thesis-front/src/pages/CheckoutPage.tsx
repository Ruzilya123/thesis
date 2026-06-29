import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/product'
import type { DeliveryMethod, OrderCalculation } from '../types'

export default function CheckoutPage() {
  const { items, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>([])
  const [deliveryId, setDeliveryId] = useState<number>(0)
  const [calc, setCalc] = useState<OrderCalculation | null>(null)
  const [form, setForm] = useState({
    recipient_name: user?.full_name || '',
    recipient_phone: user?.phone || '',
    city: '',
    street: '',
    payment_method: 'card',
  })
  const [promoCode, setPromoCode] = useState('')
  const [useBonuses, setUseBonuses] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const meta = sessionStorage.getItem('checkout_meta')
    if (meta) {
      const parsed = JSON.parse(meta)
      setPromoCode(parsed.promoCode || '')
      setUseBonuses(parsed.useBonuses || false)
    }
    api.getDeliveryMethods().then((methods) => {
      setDeliveryMethods(methods)
      if (methods[0]) setDeliveryId(methods[0].id)
    })
  }, [])

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        recipient_name: user.full_name || prev.recipient_name,
        recipient_phone: user.phone || prev.recipient_phone,
      }))
    }
  }, [user])

  useEffect(() => {
    if (!deliveryId || items.length === 0) return
    api
      .calculateOrder({
        items: items.map((i) => ({ product_id: i.product_id, price: i.price, quantity: i.quantity })),
        delivery_method_id: deliveryId,
        promo_code: promoCode,
        use_bonuses: useBonuses,
      })
      .then(setCalc)
      .catch(() => setCalc(null))
  }, [deliveryId, items, promoCode, useBonuses])

  const submit = async () => {
    setError('')
    setLoading(true)
    const address_text = [form.city, form.street].filter(Boolean).join(', ')
    try {
      const order = await api.createOrder({
        items: items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
          price: i.price,
        })),
        delivery_method_id: deliveryId,
        recipient_name: form.recipient_name,
        recipient_phone: form.recipient_phone,
        address_text,
        payment_method: form.payment_method,
        promo_code: promoCode,
        use_bonuses: useBonuses,
      })
      const payment = await api.payOrder(order.id)
      clearCart()
      sessionStorage.removeItem('checkout_meta')
      navigate(`/order-success/${payment.order.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка оформления')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  const itemsSubtotal = items.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0)

  return (
    <div className="container checkout-page">
      <h1 className="page-title">Оформление заказа</h1>
      <div className="checkout-page__layout">
        <form className="card checkout-form" onSubmit={(e) => { e.preventDefault(); submit() }}>
          <h2>Получатель</h2>
          <label>
            Имя
            <input
              required
              value={form.recipient_name}
              onChange={(e) => setForm({ ...form, recipient_name: e.target.value })}
            />
          </label>
          <label>
            Телефон
            <input
              required
              value={form.recipient_phone}
              onChange={(e) => setForm({ ...form, recipient_phone: e.target.value })}
            />
          </label>

          <h2>Адрес доставки</h2>
          <label>
            Город
            <input
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </label>
          <label>
            Улица, дом, квартира
            <input
              required
              value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
            />
          </label>

          <h2>Способ доставки</h2>
          <div className="radio-group">
            {deliveryMethods.map((m) => (
              <label key={m.id} className="radio-option">
                <input
                  type="radio"
                  name="delivery"
                  checked={deliveryId === m.id}
                  onChange={() => setDeliveryId(m.id)}
                />
                {m.name} — {formatPrice(m.cost)} ₽ ({m.estimated_days} дн.)
              </label>
            ))}
          </div>

          <h2>Оплата</h2>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="payment"
                checked={form.payment_method === 'card'}
                onChange={() => setForm({ ...form, payment_method: 'card' })}
              />
              Картой онлайн
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="payment"
                checked={form.payment_method === 'cash'}
                onChange={() => setForm({ ...form, payment_method: 'cash' })}
              />
              При получении
            </label>
          </div>

          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
            {loading ? 'Обработка...' : 'Подтвердить и оплатить'}
          </button>
        </form>

        <aside className="card checkout-summary">
          <h2>Ваш заказ</h2>
          <div className="summary-row">
            <span>Товары ({items.length})</span>
            <span>{formatPrice(itemsSubtotal)} ₽</span>
          </div>
          {calc && (
            <>
              {(parseFloat(calc.discount) > 0 || parseFloat(calc.bonus_used) > 0) && (
                <div className="summary-row summary-row--discount">
                  <span>Скидка и бонусы</span>
                  <span>−{formatPrice(parseFloat(calc.discount) + parseFloat(calc.bonus_used))} ₽</span>
                </div>
              )}
              <div className="summary-row">
                <span>Доставка</span>
                <span>{formatPrice(calc.delivery_cost)} ₽</span>
              </div>
              <div className="summary-row summary-row--total">
                <span>Итого</span>
                <span className="summary-row__value">{formatPrice(calc.total)} ₽</span>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  )
}
