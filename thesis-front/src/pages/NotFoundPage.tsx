import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="container empty-state">
      <h1>Страница не найдена</h1>
      <p className="muted">Такого адреса в магазине нет. Перейдите в каталог.</p>
      <Link to="/" className="btn btn--primary">На главную</Link>
    </div>
  )
}
