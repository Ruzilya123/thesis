import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Order } from '../types'

const STATUSES = [
  { value: 'paid', label: 'Оплачен' },
  { value: 'processing', label: 'В сборке' },
  { value: 'shipped', label: 'Отправлен' },
  { value: 'delivered', label: 'Доставлен' },
  { value: 'cancelled', label: 'Отменён' },
]

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState({ orders_count: 0, total_revenue: '0', products_count: 0 })

  const load = () => {
    api.getAdminOrders().then((data) => setOrders(data.results || []))
    api.getAdminStats().then(setStats)
  }

  useEffect(() => { load() }, [])

  const changeStatus = async (id: number, status: string) => {
    await api.updateOrderStatus(id, status)
    load()
  }

  return (
    <div className="container admin-page">
      <h1>Административная панель</h1>
      <div className="admin-stats">
        <div className="stat-card card">
          <span>Оплаченных заказов</span>
          <strong>{stats.orders_count}</strong>
        </div>
        <div className="stat-card card">
          <span>Выручка</span>
          <strong>{parseFloat(stats.total_revenue).toLocaleString('ru-RU')} ₽</strong>
        </div>
        <div className="stat-card card">
          <span>Товаров в каталоге</span>
          <strong>{stats.products_count}</strong>
        </div>
      </div>

      <section className="card">
        <h2>Заказы</h2>
        <table className="orders-table">
          <thead>
            <tr>
              <th>№</th>
              <th>Покупатель</th>
              <th>Состав</th>
              <th>Сумма</th>
              <th>Статус</th>
              <th>Действие</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>
                  {o.recipient_name}<br />
                  <small>{o.recipient_phone}</small><br />
                  <small>{o.address_text}</small>
                </td>
                <td>{o.items.map((i) => `${i.product_name} ×${i.quantity}`).join(', ')}</td>
                <td>{parseFloat(o.total).toLocaleString('ru-RU')} ₽</td>
                <td><span className={`status status--${o.status}`}>{o.status_display}</span></td>
                <td>
                  <select
                    value={o.status}
                    onChange={(e) => changeStatus(o.id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <p className="muted">
        Полное управление каталогом — в Django Admin: <a href="http://localhost:8000/admin/" target="_blank" rel="noreferrer">/admin/</a> (admin / admin123)
      </p>
    </div>
  )
}
