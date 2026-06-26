import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import type { Order } from '../types'

export default function OrderSuccessPage() {
  const { id } = useParams()
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (id) api.getOrder(Number(id)).then(setOrder)
  }, [id])

  return (
    <div className="container success-page">
      <div className="success-card card">
        <div className="success-icon">✓</div>
        <h1>Заказ успешно оплачен!</h1>
        {order && (
          <>
            <p>Номер заказа: <strong>#{order.id}</strong></p>
            <p>Сумма: <strong>{parseFloat(order.total).toLocaleString('ru-RU')} ₽</strong></p>
            <ul className="order-items-list">
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.product_name} × {item.quantity} — {parseFloat(item.price_at_order).toLocaleString('ru-RU')} ₽
                </li>
              ))}
            </ul>
            {parseFloat(order.bonus_earned) > 0 && (
              <p className="muted">Начислено бонусов: {parseFloat(order.bonus_earned).toLocaleString('ru-RU')}</p>
            )}
          </>
        )}
        <div className="success-actions">
          <Link to="/profile" className="btn btn--primary">Личный кабинет</Link>
          <Link to="/" className="btn btn--ghost">В каталог</Link>
        </div>
      </div>
    </div>
  )
}
