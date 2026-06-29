import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { formatPrice } from '../utils/product'
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
        <h1>{order ? `Заказ №${order.id} оформлен` : 'Заказ оформлен'}</h1>
        {order && (
          <>
            <p className="success-paid">Оплачено: {formatPrice(order.total)} ₽</p>
            <ul className="order-items-list">
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.product_name} × {item.quantity} — {formatPrice(item.price_at_order)} ₽
                </li>
              ))}
            </ul>
            {parseFloat(order.bonus_earned) > 0 && (
              <p className="bonus-badge">
                Начислено бонусов: {formatPrice(order.bonus_earned)}
              </p>
            )}
          </>
        )}
        <Link to="/profile" className="btn btn--primary btn--full">
          В личный кабинет
        </Link>
      </div>
    </div>
  )
}
