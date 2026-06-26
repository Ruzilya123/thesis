import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { useCart } from '../context/CartContext'
import type { Product } from '../types'

export default function ProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [qty, setQty] = useState(1)
  const { addItem } = useCart()

  useEffect(() => {
    if (id) api.getProduct(Number(id)).then(setProduct)
  }, [id])

  if (!product) return <div className="container"><p className="muted">Загрузка...</p></div>

  return (
    <div className="container product-page">
      <Link to="/" className="back-link">← Назад в каталог</Link>
      <div className="product-page__grid">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600'}
          alt={product.name}
          className="product-page__image"
        />
        <div className="product-page__info">
          <span className="badge">{product.category_name}</span>
          <h1>{product.name}</h1>
          <p className="product-page__price">
            {parseFloat(product.price).toLocaleString('ru-RU')} ₽
          </p>
          <p>{product.description}</p>
          <ul className="specs">
            {product.origin && <li><strong>Происхождение:</strong> {product.origin}</li>}
            {product.roast_name && <li><strong>Обжарка:</strong> {product.roast_name}</li>}
            {product.grind_name && <li><strong>Помол:</strong> {product.grind_name}</li>}
            <li><strong>Вес:</strong> {product.weight_grams} г</li>
            <li><strong>Вкус:</strong> {product.flavor_profile}</li>
            <li><strong>В наличии:</strong> {product.stock} шт.</li>
          </ul>
          <div className="product-page__actions">
            <div className="qty-control">
              <button type="button" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span>{qty}</span>
              <button type="button" onClick={() => setQty(Math.min(product.stock, qty + 1))}>+</button>
            </div>
            <button
              type="button"
              className="btn btn--primary"
              disabled={product.stock === 0}
              onClick={() => addItem(product, qty)}
            >
              Добавить в корзину
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
