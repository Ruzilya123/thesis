import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { useCart } from '../context/CartContext'
import type { Product } from '../types'
import { formatPrice, productImage, weightLabel, weightPrice } from '../utils/product'

const GRIND_OPTIONS = ['В зёрнах', 'Эспрессо', 'Фильтр']

export default function ProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [weight, setWeight] = useState(250)
  const [grind, setGrind] = useState('В зёрнах')
  const [qty, setQty] = useState(1)
  const { addItem } = useCart()

  useEffect(() => {
    if (id) {
      api.getProduct(Number(id)).then((p) => {
        setProduct(p)
        if (p.grind_name) setGrind(p.grind_name)
      })
    }
  }, [id])

  if (!product) return <div className="container"><p className="muted">Загрузка...</p></div>

  const showGrind = product.category_name.includes('кофе') || product.category_name === 'Дрип-пакеты'
  const showWeight = !['Аксессуары', 'Мерч'].includes(product.category_name)
  const unitPrice = showWeight ? weightPrice(product.price, weight) : parseFloat(product.price)
  const roastSubtitle = product.roast_name
    ? `Спешелти, ${product.roast_name.toLowerCase()} обжарка`
    : product.category_name

  const handleAdd = () => {
    const suffix = showWeight ? `, ${weightLabel(weight)}` : ''
    const grindSuffix = showGrind && grind !== product.grind_name ? `, ${grind}` : ''
    addItem(product, qty, {
      name: `${product.name}${suffix}${grindSuffix}`,
      price: String(unitPrice),
    })
  }

  return (
    <div className="container product-page">
      <nav className="breadcrumbs">
        <Link to="/">Каталог</Link>
        <span>›</span>
        <span>{product.category_name}</span>
        <span>›</span>
        <span>{product.name}</span>
      </nav>
      <div className="product-page__grid">
        <div className="product-page__image-wrap">
          <img
            src={productImage(product.image_url)}
            alt={product.name}
            className="product-page__image"
          />
        </div>
        <div className="product-page__info">
          <h1>{product.name}</h1>
          <p className="product-page__subtitle">{roastSubtitle}</p>
          <p className="product-page__flavor"><strong>Вкус:</strong> {product.flavor_profile}</p>

          {showWeight && (
            <div className="option-group">
              <h3>Вес упаковки</h3>
              <div className="option-pills">
                {[250, 1000].map((w) => (
                  <button
                    key={w}
                    type="button"
                    className={`option-pill${weight === w ? ' option-pill--active' : ''}`}
                    onClick={() => setWeight(w)}
                  >
                    {weightLabel(w)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showGrind && (
            <div className="option-group">
              <h3>Помол</h3>
              <div className="option-pills">
                {GRIND_OPTIONS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    className={`option-pill${grind === g ? ' option-pill--active' : ''}`}
                    onClick={() => setGrind(g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="product-page__price">{formatPrice(unitPrice)} ₽</p>

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
              onClick={handleAdd}
            >
              Добавить в корзину
            </button>
          </div>
          <p className="product-page__note">{product.description}</p>
        </div>
      </div>
    </div>
  )
}
