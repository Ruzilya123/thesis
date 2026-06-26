import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
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
    address_text: '',
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
    try {
      const order = await api.createOrder({
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        delivery_method_id: deliveryId,
        ...form,
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

  return (
    <div className="container checkout-page">
      <h1>Оформление заказа</h1>
      <div className="checkout-page__layout">
        <form className="card checkout-form" onSubmit={(e) => { e.preventDefault(); submit() }}>
          <h2>Данные получателя</h2>
          <label>
            ФИО
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
          <label>
            Адрес доставки
            <input
              required
              placeholder="Город, улица, дом, квартира"
              value={form.address_text}
              onChange={(e) => setForm({ ...form, address_text: e.target.value })}
            />
          </label>

          <h2>Доставка и оплата</h2>
          <label>
            Способ доставки
            <select value={deliveryId} onChange={(e) => setDeliveryId(Number(e.target.value))}>
              {deliveryMethods.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {parseFloat(m.cost).toLocaleString('ru-RU')} ₽ ({m.estimated_days} дн.)
                </option>
              ))}
            </select>
          </label>
          <label>
            Способ оплаты
            <select
              value={form.payment_method}
              onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
            >
              <option value="card">Банковская карта (демо ЮKassa)</option>
              <option value="sbp">СБП</option>
            </select>
          </label>

          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
            {loading ? 'Обработка...' : 'Оплатить заказ'}
          </button>
        </form>

        <aside className="card checkout-summary">
          <h2>Ваш заказ</h2>
          {items.map((i) => (
            <div key={i.product_id} className="summary-row">
              <span>{i.name} × {i.quantity}</span>
              <span>{(parseFloat(i.price) * i.quantity).toLocaleString('ru-RU')} ₽</span>
            </div>
          ))}
          {calc && (
            <>
              <div className="summary-row"><span>Подытог</span><span>{parseFloat(calc.subtotal).toLocaleString('ru-RU')} ₽</span></div>
              {parseFloat(calc.discount) > 0 && (
                <div className="summary-row summary-row--discount">
                  <span>Скидка</span><span>−{parseFloat(calc.discount).toLocaleString('ru-RU')} ₽</span>
                </div>
              )}
              {parseFloat(calc.bonus_used) > 0 && (
                <div className="summary-row summary-row--discount">
                  <span>Бонусы</span><span>−{parseFloat(calc.bonus_used).toLocaleString('ru-RU')} ₽</span>
                </div>
              )}
              <div className="summary-row"><span>Доставка</span><span>{parseFloat(calc.delivery_cost).toLocaleString('ru-RU')} ₽</span></div>
              <div className="summary-row summary-row--total">
                <span>Итого</span><span>{parseFloat(calc.total).toLocaleString('ru-RU')} ₽</span>
              </div>
              <p className="muted">Начислим бонусов: {parseFloat(calc.bonus_earned).toLocaleString('ru-RU')}</p>
            </>
          )}
        </aside>
      </div>
    </div>
  )
}
