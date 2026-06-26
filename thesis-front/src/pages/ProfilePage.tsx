import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import type { LoyaltyAccount, Order } from '../types'

export default function ProfilePage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loyalty, setLoyalty] = useState<LoyaltyAccount | null>(null)

  useEffect(() => {
    api.getOrders().then((data) => setOrders(data.results || []))
    api.getLoyalty().then(setLoyalty).catch(() => setLoyalty(null))
  }, [])

  return (
    <div className="container profile-page">
      <h1>Личный кабинет</h1>
      <div className="profile-page__grid">
        <section className="card">
          <h2>Профиль</h2>
          <p><strong>Логин:</strong> {user?.username}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>ФИО:</strong> {user?.full_name || '—'}</p>
          <p><strong>Телефон:</strong> {user?.phone || '—'}</p>
        </section>

        <section className="card loyalty-card">
          <h2>Бонусная программа</h2>
          {loyalty ? (
            <>
              <p className="loyalty-balance">{parseFloat(loyalty.balance).toLocaleString('ru-RU')} бонусов</p>
              <p className="muted">Уровень: {loyalty.level_name} ({loyalty.earn_percent}% начисления)</p>
              <h3>История</h3>
              <ul className="transactions">
                {loyalty.transactions.slice(0, 5).map((t) => (
                  <li key={t.id}>
                    {t.transaction_type === 'earn' ? '+' : '−'}
                    {parseFloat(t.amount).toLocaleString('ru-RU')} — {t.comment}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="muted">Нет данных о бонусах</p>
          )}
        </section>
      </div>

      <section className="card">
        <h2>История заказов</h2>
        {orders.length === 0 ? (
          <p className="muted">Заказов пока нет. <Link to="/">Перейти в каталог</Link></p>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>№</th>
                <th>Дата</th>
                <th>Статус</th>
                <th>Сумма</th>
                <th>Состав</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{new Date(o.created_at).toLocaleDateString('ru-RU')}</td>
                  <td><span className={`status status--${o.status}`}>{o.status_display}</span></td>
                  <td>{parseFloat(o.total).toLocaleString('ru-RU')} ₽</td>
                  <td>{o.items.map((i) => `${i.product_name} ×${i.quantity}`).join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
